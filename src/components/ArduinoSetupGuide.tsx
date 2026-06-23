import { useState } from "react";
import { ChevronDown, ChevronUp, Monitor, Usb, Upload, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: <Monitor size={16} />,
    title: "1. Install Arduino IDE",
    content: [
      "Go to arduino.cc/en/software and download the Arduino IDE for your OS (Windows, macOS, or Linux).",
      "Run the installer and follow the on-screen instructions.",
      "Launch the Arduino IDE — you should see a blank sketch with setup() and loop().",
    ],
  },
  {
    icon: <Usb size={16} />,
    title: "2. Connect & Select Your Board",
    content: [
      "Plug your Arduino into your computer via USB cable.",
      "In the IDE, go to Tools → Board and select your board (e.g. \"Arduino Uno\").",
      "Go to Tools → Port and select the COM port that appeared (e.g. COM3 on Windows, /dev/ttyUSB0 on Linux).",
      "If no port appears, install the CH340 or FTDI driver for your board.",
    ],
  },
  {
    icon: <Upload size={16} />,
    title: "3. Upload Your Code",
    content: [
      "Copy the project code and paste it into the Arduino IDE (replace the default sketch).",
      "If the project requires external libraries, install them via Sketch → Include Library → Manage Libraries.",
      "Click the ✓ (Verify) button to compile and check for errors.",
      "Click the → (Upload) button to flash the code to your Arduino.",
      "Open the Serial Monitor (Tools → Serial Monitor) at 9600 baud to see output.",
    ],
  },
];

export default function ArduinoSetupGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(new Array(steps.length).fill(false));

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  return (
    <div
      className="rounded-2xl border mb-6 overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(229, 45%, 14%), hsl(145, 30%, 13%))", borderColor: "hsl(145, 30%, 24%)" }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-all hover:opacity-90"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🛠️</span>
          <span className="font-bold text-sm" style={{ color: "#4ADE80" }}>New to Arduino? Setup Guide</span>
          {completedSteps.every(Boolean) && completedSteps.length > 0 && (
            <CheckCircle size={14} style={{ color: "#10B981" }} />
          )}
        </div>
        {isOpen ? <ChevronUp size={16} style={{ color: "#A0AED9" }} /> : <ChevronDown size={16} style={{ color: "#A0AED9" }} />}
      </button>

      {isOpen && (
        <div className="px-5 pb-5 space-y-3 animate-fade-in">
          {steps.map((step, i) => (
            <div
              key={i}
              className="rounded-xl p-4 transition-all"
              style={{
                background: completedSteps[i] ? "rgba(16,185,129,0.05)" : "hsl(229, 42%, 16%)",
                border: `1px solid ${completedSteps[i] ? "rgba(16,185,129,0.2)" : "hsl(229, 42%, 26%)"}`,
              }}
            >
              <div className="flex items-center gap-3 mb-3 cursor-pointer" onClick={() => toggleStep(i)}>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: completedSteps[i] ? "rgba(16,185,129,0.15)" : "rgba(74,222,128,0.12)",
                    color: completedSteps[i] ? "#10B981" : "#4ADE80",
                  }}
                >
                  {completedSteps[i] ? <CheckCircle size={14} /> : step.icon}
                </div>
                <span className={`font-bold text-sm ${completedSteps[i] ? "line-through opacity-60" : ""}`} style={{ color: "#E0E7FF" }}>
                  {step.title}
                </span>
              </div>
              <ul className="space-y-2 ml-10">
                {step.content.map((line, j) => (
                  <li key={j} className="text-xs leading-relaxed flex items-start gap-2" style={{ color: "#A0AED9" }}>
                    <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: "#4ADE80" }} />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="rounded-xl p-3 text-xs" style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.15)", color: "#A0AED9" }}>
            💡 <strong style={{ color: "#4ADE80" }}>Tip:</strong> Use the "Download .ino" button above the code editor to save the file directly. Double-click the .ino file to open it in Arduino IDE automatically.
          </div>
        </div>
      )}
    </div>
  );
}
