import { useState } from "react";
import { AlertTriangle, Search, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import Layout from "@/components/Layout";
import FadeInView from "@/components/motion/FadeInView";
import MotionCard from "@/components/motion/MotionCard";
import StaggerContainer, { staggerItem } from "@/components/motion/StaggerContainer";
import { motion, AnimatePresence } from "framer-motion";

type ErrorCategory = "all" | "compile" | "upload" | "runtime" | "library" | "wiring";

interface ArduinoError {
  id: number;
  title: string;
  errorMessage: string;
  category: ErrorCategory;
  cause: string;
  fix: string;
  example?: string;
  tags: string[];
}

const errors: ArduinoError[] = [
  // COMPILE ERRORS
  { id: 1, title: "Missing Semicolon", errorMessage: "expected ';' before '}' token", category: "compile", cause: "A statement is missing a semicolon at the end of the line.", fix: "Add a semicolon (;) at the end of the highlighted line.", example: `// Wrong:\nint x = 5\n\n// Correct:\nint x = 5;`, tags: ["syntax", "beginner"] },
  { id: 2, title: "Undeclared Variable", errorMessage: "'myVar' was not declared in this scope", category: "compile", cause: "You're using a variable that hasn't been declared, or it's declared in a different scope (e.g., inside a function).", fix: "Declare the variable before using it, or check for typos in the variable name.", example: `// Wrong:\nvoid loop() {\n  Serial.println(myVar);\n}\n\n// Correct:\nint myVar = 10;\nvoid loop() {\n  Serial.println(myVar);\n}`, tags: ["scope", "declaration"] },
  { id: 3, title: "Function Not Declared", errorMessage: "'myFunction' was not declared in this scope", category: "compile", cause: "You're calling a function that doesn't exist or is defined after the point where you call it.", fix: "Either define the function before it's called, or add a function prototype at the top of your sketch.", example: `// Add prototype at top:\nvoid myFunction();\n\nvoid setup() {\n  myFunction();\n}\n\nvoid myFunction() {\n  // ...\n}`, tags: ["function", "prototype"] },
  { id: 4, title: "Type Mismatch", errorMessage: "cannot convert 'String' to 'int'", category: "compile", cause: "You're assigning a value of one type to a variable of an incompatible type.", fix: "Use the correct type, or convert with toInt(), (int), String(), etc.", example: `// Wrong:\nint x = "hello";\n\n// Correct:\nString s = "42";\nint x = s.toInt();`, tags: ["types", "casting"] },
  { id: 5, title: "Missing Bracket", errorMessage: "expected '}' at end of input", category: "compile", cause: "There's an unmatched opening brace { somewhere in your code.", fix: "Count your opening and closing braces. Use the IDE's auto-format (Ctrl+T) to find the mismatch.", tags: ["syntax", "braces"] },
  { id: 6, title: "Redefinition Error", errorMessage: "redefinition of 'void setup()'", category: "compile", cause: "You have two setup() or loop() functions, or you're including a library that conflicts.", fix: "Make sure you only have one setup() and one loop() function. Check for duplicate #include files.", tags: ["duplicate", "function"] },
  { id: 7, title: "Array Out of Bounds", errorMessage: "array subscript is above array bounds", category: "compile", cause: "You're accessing an array index that's beyond the declared size.", fix: "Check your array size and make sure loop indices stay within bounds (0 to size-1).", example: `// Wrong:\nint arr[5];\narr[5] = 10; // Max index is 4!\n\n// Correct:\narr[4] = 10;`, tags: ["array", "bounds"] },

  // UPLOAD ERRORS
  { id: 8, title: "Port Not Found", errorMessage: "Serial port 'COM3' not found", category: "upload", cause: "The Arduino board is not connected, or the wrong COM port is selected.", fix: "1. Check USB cable connection\n2. Go to Tools > Port and select the correct port\n3. Try a different USB cable\n4. Install/update CH340 or FTDI drivers", tags: ["port", "connection"] },
  { id: 9, title: "Upload Timeout", errorMessage: "avrdude: stk500_recv(): programmer is not responding", category: "upload", cause: "The bootloader on the Arduino is not responding. Could be wrong board selected, or something connected to pins 0/1.", fix: "1. Select correct board in Tools > Board\n2. Disconnect anything from pins 0 (RX) and 1 (TX)\n3. Press the reset button just before upload starts\n4. Try a different USB port", tags: ["bootloader", "avrdude"] },
  { id: 10, title: "Sketch Too Large", errorMessage: "Sketch too big; see https://support.arduino.cc/...", category: "upload", cause: "Your compiled sketch exceeds the flash memory of your board (32KB for Uno).", fix: "1. Use F() macro for string literals: Serial.println(F(\"text\"))\n2. Remove unused libraries\n3. Use smaller data types (byte instead of int)\n4. Move large data to PROGMEM", tags: ["memory", "flash"] },
  { id: 11, title: "Wrong Board Selected", errorMessage: "avrdude: Expected signature ... does not match", category: "upload", cause: "The board selected in the IDE doesn't match the physical board connected.", fix: "Go to Tools > Board and select the correct Arduino board model.", tags: ["board", "signature"] },

  // RUNTIME ERRORS
  { id: 12, title: "Low Memory Warning", errorMessage: "Low memory available, stability problems may occur", category: "runtime", cause: "Your sketch uses too much RAM (2KB on Uno). Global variables, strings, and arrays consume RAM.", fix: "1. Use F() for Serial.print strings\n2. Reduce array sizes\n3. Use PROGMEM for constant data\n4. Avoid String class — use char arrays", example: `// Wrong (uses RAM):\nSerial.println("Hello World");\n\n// Better (stored in flash):\nSerial.println(F("Hello World"));`, tags: ["RAM", "memory"] },
  { id: 13, title: "Watchdog Reset", errorMessage: "Board keeps resetting / random restarts", category: "runtime", cause: "Usually caused by power issues, short circuits, or infinite loops that trigger the watchdog timer.", fix: "1. Check for short circuits in wiring\n2. Use an external power supply if running motors/servos\n3. Add decoupling capacitors near power-hungry components\n4. Check for infinite while() loops", tags: ["reset", "power"] },
  { id: 14, title: "Serial Garbage Output", errorMessage: "⸮⸮⸮⸮ or random characters in Serial Monitor", category: "runtime", cause: "The baud rate in Serial Monitor doesn't match the baud rate in your code.", fix: "Make sure Serial.begin(BAUD) matches the dropdown in Serial Monitor. Common: 9600, 115200.", example: `// In your code:\nSerial.begin(9600);\n\n// In Serial Monitor: select \"9600 baud\"`, tags: ["serial", "baud"] },
  { id: 15, title: "Floating Pin Reads", errorMessage: "Analog readings jump randomly (0-1023)", category: "runtime", cause: "An unconnected analog pin picks up electromagnetic noise, giving random readings.", fix: "1. Connect unused analog pins to GND\n2. Use INPUT_PULLUP for digital pins\n3. Add a pull-down resistor to the analog pin", tags: ["analog", "noise"] },

  // LIBRARY ERRORS
  { id: 16, title: "Library Not Found", errorMessage: "fatal error: SomeLibrary.h: No such file or directory", category: "library", cause: "The required library is not installed in your Arduino IDE.", fix: "Go to Sketch > Include Library > Manage Libraries, search for the library name, and install it.", tags: ["include", "install"] },
  { id: 17, title: "Library Version Conflict", errorMessage: "Multiple libraries found for 'Wire.h'", category: "library", cause: "Two libraries provide the same header file, causing a conflict.", fix: "1. Remove duplicate libraries from your Arduino/libraries folder\n2. Check Sketch > Include Library for duplicates\n3. Restart the IDE after removing", tags: ["conflict", "duplicate"] },

  // WIRING ERRORS
  { id: 18, title: "LED Not Lighting Up", errorMessage: "LED connected but stays off", category: "wiring", cause: "Common causes: LED is backwards (check anode/cathode), missing resistor, wrong pin, or pin not set to OUTPUT.", fix: "1. Check LED polarity — long leg is + (anode)\n2. Add a 220Ω resistor in series\n3. Make sure you called pinMode(pin, OUTPUT)\n4. Verify the pin number matches your code", tags: ["LED", "polarity"] },
  { id: 19, title: "Servo Jittering", errorMessage: "Servo vibrates or moves erratically", category: "wiring", cause: "Insufficient power. Servos draw 100-500mA — too much for the Arduino 5V pin alone.", fix: "1. Power servo from external 5V supply (not Arduino)\n2. Connect servo GND to Arduino GND\n3. Add a 100µF capacitor across servo power lines\n4. Use only the signal wire to Arduino", tags: ["servo", "power"] },
  { id: 20, title: "I2C Device Not Found", errorMessage: "No I2C devices found at any address", category: "wiring", cause: "SDA/SCL wires are swapped, missing pull-up resistors, or wrong address.", fix: "1. SDA → A4, SCL → A5 on Uno\n2. Add 4.7kΩ pull-up resistors on SDA and SCL\n3. Run an I2C scanner sketch\n4. Check if the device needs 3.3V instead of 5V", tags: ["I2C", "wiring"] },
];

const categories: { value: ErrorCategory; label: string; emoji: string; color: string }[] = [
  { value: "all", label: "All Errors", emoji: "📋", color: "hsl(var(--primary))" },
  { value: "compile", label: "Compile", emoji: "🔴", color: "#FF4444" },
  { value: "upload", label: "Upload", emoji: "🟠", color: "#FFA500" },
  { value: "runtime", label: "Runtime", emoji: "🟡", color: "#FFD700" },
  { value: "library", label: "Library", emoji: "📦", color: "#B744FF" },
  { value: "wiring", label: "Wiring", emoji: "🔧", color: "#00F5FF" },
];

export default function ErrorDatabasePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ErrorCategory>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filtered = errors.filter(e => {
    if (category !== "all" && e.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      return e.title.toLowerCase().includes(q) || e.errorMessage.toLowerCase().includes(q) || e.tags.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <FadeInView>
          <div className="mb-6">
            <h1 className="text-2xl font-bold font-orbitron mb-1" style={{ color: "hsl(var(--foreground))" }}>
              <AlertTriangle size={24} className="inline mr-2" style={{ color: "#FFA500" }} />
              Error Database
            </h1>
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              Search common Arduino errors — find causes and fixes instantly.
            </p>
          </div>
        </FadeInView>

        {/* Search */}
        <FadeInView delay={0.1}>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--muted-foreground))" }} />
            <input
              type="text"
              placeholder="Paste an error message or search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
              style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", "--tw-ring-color": "hsl(var(--primary))" } as any}
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(c => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={category === c.value
                  ? { background: `${c.color}20`, color: c.color, border: `1px solid ${c.color}50` }
                  : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", border: "1px solid transparent" }
                }
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </FadeInView>

        {/* Results count */}
        <p className="text-xs mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>
          {filtered.length} error{filtered.length !== 1 ? "s" : ""} found
        </p>

        {/* Error List */}
        <StaggerContainer className="space-y-3">
          {filtered.map(error => {
            const isExpanded = expandedId === error.id;
            const catInfo = categories.find(c => c.value === error.category);
            return (
              <motion.div key={error.id} variants={staggerItem}>
                <MotionCard
                  className="rounded-xl overflow-hidden cursor-pointer"
                  style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  onClick={() => setExpandedId(isExpanded ? null : error.id)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-medium" style={{ background: `${catInfo?.color}20`, color: catInfo?.color }}>
                            {catInfo?.emoji} {catInfo?.label}
                          </span>
                          {error.tags.map(t => (
                            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-md hidden sm:inline" style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>{t}</span>
                          ))}
                        </div>
                        <h3 className="font-semibold text-sm" style={{ color: "hsl(var(--foreground))" }}>{error.title}</h3>
                        <code className="text-xs block mt-1 truncate" style={{ color: "#FF6B6B" }}>{error.errorMessage}</code>
                      </div>
                      {isExpanded ? <ChevronUp size={16} style={{ color: "hsl(var(--muted-foreground))" }} /> : <ChevronDown size={16} style={{ color: "hsl(var(--muted-foreground))" }} />}
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 space-y-3">
                          <div className="p-3 rounded-lg" style={{ background: "hsl(var(--muted))" }}>
                            <p className="text-xs font-semibold mb-1" style={{ color: "#FFA500" }}>⚡ Cause</p>
                            <p className="text-xs" style={{ color: "hsl(var(--foreground))" }}>{error.cause}</p>
                          </div>
                          <div className="p-3 rounded-lg" style={{ background: "hsl(var(--muted))" }}>
                            <p className="text-xs font-semibold mb-1" style={{ color: "#00FF88" }}>✅ Fix</p>
                            <p className="text-xs whitespace-pre-line" style={{ color: "hsl(var(--foreground))" }}>{error.fix}</p>
                          </div>
                          {error.example && (
                            <div className="relative">
                              <button
                                onClick={e => { e.stopPropagation(); handleCopy(error.id, error.example!); }}
                                className="absolute top-2 right-2 p-1 rounded-md" style={{ background: "hsl(var(--background))" }}
                              >
                                {copiedId === error.id ? <Check size={12} style={{ color: "#00FF88" }} /> : <Copy size={12} style={{ color: "hsl(var(--muted-foreground))" }} />}
                              </button>
                              <pre className="text-xs p-3 rounded-lg overflow-x-auto" style={{ background: "hsl(var(--muted))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))" }}>
                                <code>{error.example}</code>
                              </pre>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </MotionCard>
              </motion.div>
            );
          })}
        </StaggerContainer>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <AlertTriangle size={48} className="mx-auto mb-3 opacity-30" style={{ color: "hsl(var(--muted-foreground))" }} />
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>No errors match your search. Try different keywords.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
