import { useState } from "react";
import { CheckSquare, Square, Download, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface LibraryInfo {
  name: string;
  installName: string;
  builtIn?: boolean;
  description: string;
  installSteps: string[];
}

const LIBRARY_DB: Record<string, LibraryInfo> = {
  "DHT.h": {
    name: "DHT Sensor Library",
    installName: "DHT sensor library",
    description: "Adafruit library for DHT11, DHT22, and AM2302 temperature & humidity sensors.",
    installSteps: [
      "Open Arduino IDE → Sketch → Include Library → Manage Libraries",
      "Search for \"DHT sensor library\" by Adafruit",
      "Click Install (also install \"Adafruit Unified Sensor\" if prompted)",
    ],
  },
  "Servo.h": {
    name: "Servo Library",
    installName: "Servo",
    builtIn: true,
    description: "Built-in Arduino library for controlling servo motors. No installation needed.",
    installSteps: ["This library comes pre-installed with the Arduino IDE."],
  },
  "LiquidCrystal_I2C.h": {
    name: "LiquidCrystal I2C",
    installName: "LiquidCrystal I2C",
    description: "Library for controlling I2C LCD displays (16×2, 20×4, etc.).",
    installSteps: [
      "Open Arduino IDE → Sketch → Include Library → Manage Libraries",
      "Search for \"LiquidCrystal I2C\" by Frank de Brabander",
      "Click Install",
    ],
  },
  "Wire.h": {
    name: "Wire (I2C)",
    installName: "Wire",
    builtIn: true,
    description: "Built-in library for I2C/TWI communication between devices.",
    installSteps: ["This library comes pre-installed with the Arduino IDE."],
  },
  "Adafruit_SSD1306.h": {
    name: "Adafruit SSD1306",
    installName: "Adafruit SSD1306",
    description: "Driver library for SSD1306-based 128×64 and 128×32 OLED displays.",
    installSteps: [
      "Open Arduino IDE → Sketch → Include Library → Manage Libraries",
      "Search for \"Adafruit SSD1306\"",
      "Click Install (also install \"Adafruit GFX Library\" when prompted)",
    ],
  },
  "Adafruit_GFX.h": {
    name: "Adafruit GFX Library",
    installName: "Adafruit GFX Library",
    description: "Core graphics library used by Adafruit display drivers for drawing shapes, text, and bitmaps.",
    installSteps: [
      "Open Arduino IDE → Sketch → Include Library → Manage Libraries",
      "Search for \"Adafruit GFX Library\"",
      "Click Install",
    ],
  },
};

function extractLibraries(code: string): LibraryInfo[] {
  const includes = code.match(/#include\s*<([^>]+)>/g) || [];
  const libs: LibraryInfo[] = [];
  const seen = new Set<string>();

  for (const inc of includes) {
    const match = inc.match(/<([^>]+)>/);
    if (match && LIBRARY_DB[match[1]] && !seen.has(match[1])) {
      seen.add(match[1]);
      libs.push(LIBRARY_DB[match[1]]);
    }
  }
  return libs;
}

interface Props {
  basicCode: string;
  optimizedCode: string;
}

export default function RequiredLibraries({ basicCode, optimizedCode }: Props) {
  const libraries = extractLibraries(basicCode + "\n" + optimizedCode);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [installed, setInstalled] = useState<Record<string, boolean>>({});

  if (libraries.length === 0) return null;

  const externalLibs = libraries.filter((l) => !l.builtIn);
  const builtInLibs = libraries.filter((l) => l.builtIn);

  return (
    <div
      className="rounded-2xl p-5 border mb-6"
      style={{ background: "linear-gradient(135deg, hsl(229, 45%, 14%), hsl(200, 40%, 14%))", borderColor: "hsl(200, 42%, 26%)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Download size={16} style={{ color: "#00D4AA" }} />
        <span className="font-bold text-sm" style={{ color: "#00D4AA" }}>Required Libraries</span>
        <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ background: "rgba(0,212,170,0.1)", color: "#00D4AA" }}>
          {libraries.length} {libraries.length === 1 ? "library" : "libraries"}
        </span>
      </div>

      <div className="space-y-2">
        {externalLibs.map((lib) => {
          const isExpanded = expanded === lib.name;
          const isInstalled = installed[lib.name];
          return (
            <div key={lib.name}>
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer hover:scale-[1.01]"
                style={{
                  background: isInstalled ? "rgba(0,255,136,0.06)" : "hsl(229, 42%, 18%)",
                  border: `1px solid ${isInstalled ? "rgba(0,255,136,0.2)" : isExpanded ? "rgba(0,212,170,0.3)" : "hsl(229, 42%, 28%)"}`,
                }}
                onClick={() => setExpanded(isExpanded ? null : lib.name)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setInstalled((prev) => ({ ...prev, [lib.name]: !prev[lib.name] }));
                  }}
                  className="flex-shrink-0 transition-all hover:scale-110"
                >
                  {isInstalled ? (
                    <CheckSquare size={18} style={{ color: "#00FF88" }} />
                  ) : (
                    <Square size={18} style={{ color: "#A0AED9" }} />
                  )}
                </button>
                <div className="flex-1">
                  <span className={`font-medium ${isInstalled ? "line-through opacity-60" : ""}`} style={{ color: "#E0E7FF" }}>
                    {lib.name}
                  </span>
                  <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(255,165,0,0.12)", color: "#FFA500" }}>
                    Install required
                  </span>
                </div>
                {isExpanded ? <ChevronUp size={14} style={{ color: "#A0AED9" }} /> : <ChevronDown size={14} style={{ color: "#A0AED9" }} />}
              </div>
              {isExpanded && (
                <div className="ml-4 mt-1 mb-2 p-3 rounded-xl text-xs space-y-3 animate-fade-in" style={{ background: "hsl(229, 42%, 15%)", border: "1px solid hsl(229, 42%, 25%)" }}>
                  <p style={{ color: "#E0E7FF" }}>{lib.description}</p>
                  <div>
                    <span className="font-bold text-xs mb-1.5 block" style={{ color: "#00D4AA" }}>Installation Steps:</span>
                    <ol className="space-y-1.5">
                      {lib.installSteps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2" style={{ color: "#A0AED9" }}>
                          <span className="font-bold flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{ background: "rgba(0,212,170,0.15)", color: "#00D4AA" }}>
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {builtInLibs.length > 0 && (
          <div className="pt-2 border-t" style={{ borderColor: "hsl(229, 42%, 22%)" }}>
            <span className="text-xs font-medium block mb-2" style={{ color: "#A0AED9" }}>Built-in (no install needed):</span>
            {builtInLibs.map((lib) => (
              <div key={lib.name} className="flex items-center gap-2 px-3 py-1.5 text-xs" style={{ color: "#A0AED9" }}>
                <CheckSquare size={14} style={{ color: "#00FF88" }} />
                <span>{lib.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(0,255,136,0.1)", color: "#00FF88" }}>
                  Pre-installed
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
