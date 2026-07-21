import { useState } from "react";
import { Code, Copy, Check, Search, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import FadeInView from "@/components/motion/FadeInView";
import MotionCard from "@/components/motion/MotionCard";
import StaggerContainer, { staggerItem } from "@/components/motion/StaggerContainer";
import { motion, AnimatePresence } from "framer-motion";

type Category = "all" | "input" | "output" | "timing" | "communication" | "display" | "math" | "state";

interface Snippet {
  id: number;
  title: string;
  desc: string;
  category: Category;
  difficulty: "beginner" | "intermediate" | "advanced";
  code: string;
  tags: string[];
}

const snippets: Snippet[] = [
  { id: 1, title: "Digital Button Read", desc: "Read a push button with internal pull-up resistor and debounce.", category: "input", difficulty: "beginner", tags: ["Button", "Digital"], code: `const int BTN = 2;
bool lastState = HIGH;
unsigned long lastDebounce = 0;
const unsigned long DEBOUNCE_MS = 50;

void setup() {
  pinMode(BTN, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  bool reading = digitalRead(BTN);
  if (reading != lastState && (millis() - lastDebounce) > DEBOUNCE_MS) {
    lastDebounce = millis();
    lastState = reading;
    if (reading == LOW) {
      Serial.println("Button pressed!");
    }
  }
}` },
  { id: 2, title: "Analog Sensor Read", desc: "Read an analog sensor and map it to a useful range.", category: "input", difficulty: "beginner", tags: ["Analog", "Sensor"], code: `const int SENSOR_PIN = A0;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int raw = analogRead(SENSOR_PIN);
  int mapped = map(raw, 0, 1023, 0, 100);
  Serial.print("Value: ");
  Serial.println(mapped);
  delay(200);
}` },
  { id: 3, title: "Potentiometer Smooth Read", desc: "Read a potentiometer with averaging for stable values.", category: "input", difficulty: "intermediate", tags: ["Potentiometer", "Smoothing"], code: `const int POT_PIN = A0;
const int SAMPLES = 10;
int readings[SAMPLES];
int readIndex = 0;
long total = 0;

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < SAMPLES; i++) readings[i] = 0;
}

void loop() {
  total -= readings[readIndex];
  readings[readIndex] = analogRead(POT_PIN);
  total += readings[readIndex];
  readIndex = (readIndex + 1) % SAMPLES;
  int average = total / SAMPLES;
  Serial.println(average);
  delay(10);
}` },
  { id: 4, title: "LED Blink Pattern", desc: "Blink an LED in a custom SOS pattern without delay().", category: "output", difficulty: "beginner", tags: ["LED", "Timing"], code: `const int LED = 13;
const int pattern[] = {200,200,200,200,200,600,600,200,600,200,600,600,200,200,200,200,200,1000};
const int patternLen = 18;
int step = 0;
unsigned long lastChange = 0;

void setup() { pinMode(LED, OUTPUT); }

void loop() {
  if (millis() - lastChange >= pattern[step]) {
    lastChange = millis();
    digitalWrite(LED, step % 2 == 0 ? HIGH : LOW);
    step = (step + 1) % patternLen;
  }
}` },
  { id: 5, title: "PWM LED Fade", desc: "Smoothly fade an LED up and down using PWM.", category: "output", difficulty: "beginner", tags: ["LED", "PWM"], code: `const int LED = 9;
int brightness = 0;
int fadeAmount = 5;

void setup() { pinMode(LED, OUTPUT); }

void loop() {
  analogWrite(LED, brightness);
  brightness += fadeAmount;
  if (brightness <= 0 || brightness >= 255) {
    fadeAmount = -fadeAmount;
  }
  delay(30);
}` },
  { id: 6, title: "Servo Sweep", desc: "Sweep a servo motor back and forth smoothly.", category: "output", difficulty: "beginner", tags: ["Servo", "Motor"], code: `#include <Servo.h>
Servo myServo;
int pos = 0;
int direction = 1;

void setup() { myServo.attach(9); }

void loop() {
  pos += direction;
  if (pos >= 180 || pos <= 0) direction = -direction;
  myServo.write(pos);
  delay(15);
}` },
  { id: 7, title: "Tone Melody Player", desc: "Play a melody using tone() with note arrays.", category: "output", difficulty: "intermediate", tags: ["Buzzer", "Music"], code: `const int BUZZER = 8;
int melody[] = {262,294,330,349,392,440,494,523};
int durations[] = {250,250,250,250,250,250,250,500};
const int NOTES = 8;

void setup() {
  for (int i = 0; i < NOTES; i++) {
    tone(BUZZER, melody[i], durations[i]);
    delay(durations[i] * 1.3);
    noTone(BUZZER);
  }
}

void loop() {}` },
  { id: 8, title: "Non-Blocking Timer", desc: "Execute tasks at intervals without blocking using millis().", category: "timing", difficulty: "beginner", tags: ["millis", "Timer"], code: `unsigned long previousMillis = 0;
const long interval = 1000;

void setup() { Serial.begin(9600); }

void loop() {
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    Serial.println("Tick!");
  }
}` },
  { id: 9, title: "Multi-Task Timer", desc: "Run multiple independent tasks at different intervals.", category: "timing", difficulty: "intermediate", tags: ["millis", "Multitask"], code: `unsigned long timer1 = 0, timer2 = 0, timer3 = 0;

void setup() {
  Serial.begin(9600);
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
}

void loop() {
  unsigned long now = millis();
  if (now - timer1 >= 500)  { timer1 = now; digitalWrite(13, !digitalRead(13)); }
  if (now - timer2 >= 1000) { timer2 = now; digitalWrite(12, !digitalRead(12)); }
  if (now - timer3 >= 2000) { timer3 = now; Serial.println("2s tick"); }
}` },
  { id: 10, title: "Serial Command Parser", desc: "Parse serial commands like 'LED ON' or 'LED OFF'.", category: "communication", difficulty: "intermediate", tags: ["Serial", "Parsing"], code: `String inputString = "";

void setup() {
  Serial.begin(9600);
  pinMode(13, OUTPUT);
  Serial.println("Commands: LED ON, LED OFF");
}

void loop() {
  while (Serial.available()) {
    char c = (char)Serial.read();
    if (c == '\\n') {
      inputString.trim();
      inputString.toUpperCase();
      if (inputString == "LED ON") {
        digitalWrite(13, HIGH);
        Serial.println("LED is ON");
      } else if (inputString == "LED OFF") {
        digitalWrite(13, LOW);
        Serial.println("LED is OFF");
      } else {
        Serial.println("Unknown command");
      }
      inputString = "";
    } else {
      inputString += c;
    }
  }
}` },
  { id: 11, title: "I2C Scanner", desc: "Scan and find all I2C devices on the bus.", category: "communication", difficulty: "intermediate", tags: ["I2C", "Scanner"], code: `#include <Wire.h>

void setup() {
  Wire.begin();
  Serial.begin(9600);
  Serial.println("I2C Scanner...");
}

void loop() {
  int count = 0;
  for (byte addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      Serial.print("Found: 0x");
      if (addr < 16) Serial.print("0");
      Serial.println(addr, HEX);
      count++;
    }
  }
  Serial.print("Found ");
  Serial.print(count);
  Serial.println(" device(s)");
  delay(5000);
}` },
  { id: 12, title: "LCD Print Helper", desc: "Print formatted text on a 16x2 LCD with I2C.", category: "display", difficulty: "beginner", tags: ["LCD", "I2C"], code: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Hello World!");
  lcd.setCursor(0, 1);
  lcd.print("Arduino Lab");
}

void loop() {}` },
  { id: 13, title: "OLED Display Template", desc: "Display text and graphics on a 0.96\" OLED.", category: "display", difficulty: "intermediate", tags: ["OLED", "SSD1306"], code: `#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);

void setup() {
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(10, 10);
  display.println("Arduino");
  display.setCursor(30, 35);
  display.println("Lab!");
  display.display();
}

void loop() {}` },
  { id: 14, title: "Map & Constrain", desc: "Map sensor values to output range with constraints.", category: "math", difficulty: "beginner", tags: ["map", "constrain"], code: `void setup() { Serial.begin(9600); }

void loop() {
  int raw = analogRead(A0);
  int pct = map(raw, 0, 1023, 0, 100);
  int angle = constrain(map(raw, 100, 900, 0, 180), 0, 180);
  int brightness = map(raw, 0, 1023, 0, 255);
  
  Serial.print(pct); Serial.print("% | ");
  Serial.print(angle); Serial.print("° | ");
  Serial.println(brightness);
  delay(100);
}` },
  { id: 15, title: "Running Average Filter", desc: "Smooth noisy sensor data with a running average.", category: "math", difficulty: "intermediate", tags: ["Filter", "Smoothing"], code: `const int NUM_READINGS = 20;
int readings[NUM_READINGS];
int readIndex = 0;
long total = 0;

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < NUM_READINGS; i++) readings[i] = 0;
}

void loop() {
  total -= readings[readIndex];
  readings[readIndex] = analogRead(A0);
  total += readings[readIndex];
  readIndex = (readIndex + 1) % NUM_READINGS;
  
  int smoothed = total / NUM_READINGS;
  Serial.print("Raw: ");
  Serial.print(analogRead(A0));
  Serial.print(" | Smooth: ");
  Serial.println(smoothed);
  delay(50);
}` },
  { id: 16, title: "State Machine (FSM)", desc: "Implement a finite state machine for multi-stage sequential logic.", category: "state", difficulty: "advanced", tags: ["FSM", "Logic", "Structure"], code: `enum State { IDLE, RUNNING, PAUSED, DONE };
State currentState = IDLE;
unsigned long stateTimer = 0;

void setup() {
  Serial.begin(9600);
  pinMode(2, INPUT_PULLUP);
  pinMode(13, OUTPUT);
}

void loop() {
  bool btnPressed = digitalRead(2) == LOW;
  switch (currentState) {
    case IDLE:
      digitalWrite(13, LOW);
      if (btnPressed) { currentState = RUNNING; stateTimer = millis(); }
      break;
    case RUNNING:
      digitalWrite(13, HIGH);
      if (millis() - stateTimer > 5000) currentState = DONE;
      if (btnPressed) currentState = PAUSED;
      break;
    case PAUSED:
      digitalWrite(13, !digitalRead(13));
      delay(200);
      if (btnPressed) currentState = RUNNING;
      break;
    case DONE:
      digitalWrite(13, LOW);
      delay(1000);
      currentState = IDLE;
      break;
  }
}` },
  { id: 17, title: "Toggle with Debounce", desc: "Toggle between states with software button debouncing.", category: "state", difficulty: "beginner", tags: ["Toggle", "Debounce"], code: `const int BTN = 2;
const int LED = 13;
bool ledState = false;
bool lastBtnState = HIGH;
unsigned long lastDebounce = 0;

void setup() {
  pinMode(BTN, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
}

void loop() {
  bool reading = digitalRead(BTN);
  if (reading != lastBtnState) { lastDebounce = millis(); }
  if ((millis() - lastDebounce) > 50) {
    if (reading == LOW && lastBtnState == HIGH) {
      ledState = !ledState;
      digitalWrite(LED, ledState);
    }
  }
  lastBtnState = reading;
}` },
  { id: 18, title: "Hardware Interrupts", desc: "Instantly trigger functions using hardware interrupts (Pins 2 & 3 on Uno).", category: "state", difficulty: "advanced", tags: ["Interrupt", "Hardware", "ISR"], code: `const int BUTTON_PIN = 2;
const int LED_PIN = 13;
volatile bool ledState = false;

// Interrupt Service Routine (ISR)
// Must be as fast as possible; do not use delay() or Serial.print() inside
void toggleLED() {
  ledState = !ledState;
}

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  
  // Attach interrupt to pin 2
  // Options: LOW, CHANGE, RISING, FALLING
  attachInterrupt(digitalPinToInterrupt(BUTTON_PIN), toggleLED, FALLING);
}

void loop() {
  digitalWrite(LED_PIN, ledState);
}` },
  { id: 19, title: "EEPROM Persistent Storage", desc: "Save calibration values or state variables across resets/power loss.", category: "math", difficulty: "advanced", tags: ["EEPROM", "Storage", "Memory"], code: `#include <EEPROM.h>

const int ADDR_BOOT_COUNT = 0;
int bootCount = 0;

void setup() {
  Serial.begin(9600);
  
  // Read value from address 0
  bootCount = EEPROM.read(ADDR_BOOT_COUNT);
  bootCount++;
  
  // Save updated value back to address 0
  EEPROM.write(ADDR_BOOT_COUNT, bootCount);
  
  Serial.print("This Arduino has booted ");
  Serial.print(bootCount);
  Serial.println(" times.");
}

void loop() {
  // Your main program runs here
}` },
  { id: 20, title: "Sleep Mode (Low Power)", desc: "Shut down parts of the MCU to run your Arduino for months on batteries.", category: "timing", difficulty: "advanced", tags: ["Sleep", "Low Power", "Battery"], code: `#include <avr/sleep.h>
#include <avr/power.h>

const int INTERRUPT_PIN = 2;

void wakeUp() {
  // Handler executes after waking up
}

void enterSleepMode() {
  set_sleep_mode(SLEEP_MODE_PWR_DOWN); // Deep sleep
  sleep_enable();
  
  // Wake up when pin 2 is pulled LOW
  attachInterrupt(digitalPinToInterrupt(INTERRUPT_PIN), wakeUp, LOW);
  
  sleep_cpu(); // Arduino goes to sleep here
  
  // --- PROGRAM RESUMES HERE AFTER WAKING UP ---
  sleep_disable();
  detachInterrupt(digitalPinToInterrupt(INTERRUPT_PIN));
}

void setup() {
  pinMode(INTERRUPT_PIN, INPUT_PULLUP);
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  // Blink LED to indicate activity
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  
  // Enter sleep mode to save energy
  enterSleepMode();
}` },
  { id: 21, title: "Custom Class Structure", desc: "Design a modular class to wrap hardware features (like a library).", category: "state", difficulty: "advanced", tags: ["Class", "Library", "OOP"], code: `// Object Oriented programming for cleaner code structure
class Flasher {
  private:
    int ledPin;
    long onTime;
    long offTime;
    int ledState;
    unsigned long previousMillis;

  public:
    Flasher(int pin, long on, long off) {
      ledPin = pin;
      onTime = on;
      offTime = off;
      ledState = LOW;
      previousMillis = 0;
    }

    void Begin() {
      pinMode(ledPin, OUTPUT);
    }

    void Update() {
      unsigned long currentMillis = millis();
      if ((ledState == HIGH) && (currentMillis - previousMillis >= onTime)) {
        ledState = LOW;
        previousMillis = currentMillis;
        digitalWrite(ledPin, ledState);
      }
      else if ((ledState == LOW) && (currentMillis - previousMillis >= offTime)) {
        ledState = HIGH;
        previousMillis = currentMillis;
        digitalWrite(ledPin, ledState);
      }
    }
};

// Create flasher objects
Flasher led1(12, 100, 400);
Flasher led2(13, 350, 350);

void setup() {
  led1.Begin();
  led2.Begin();
}

void loop() {
  led1.Update();
  led2.Update();
}` },
];

const categories: { value: Category; label: string; emoji: string }[] = [
  { value: "all", label: "All", emoji: "📚" },
  { value: "input", label: "Input", emoji: "🎮" },
  { value: "output", label: "Output", emoji: "💡" },
  { value: "timing", label: "Timing", emoji: "⏱️" },
  { value: "communication", label: "Communication", emoji: "📡" },
  { value: "display", label: "Display", emoji: "🖥️" },
  { value: "math", label: "Math & Mapping", emoji: "📐" },
  { value: "state", label: "State Management", emoji: "🔄" },
];

const diffColors = {
  beginner: { bg: "bg-success/10", border: "border-success/30", text: "text-success" },
  intermediate: { bg: "bg-secondary/10", border: "border-secondary/30", text: "text-secondary" },
  advanced: { bg: "bg-brand-purple/10", border: "border-brand-purple/30", text: "text-brand-purple" },
};

export default function SnippetsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = snippets.filter((s) => {
    if (category !== "all" && s.category !== category) return false;
    if (
      search &&
      !s.title.toLowerCase().includes(search.toLowerCase()) &&
      !s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    )
      return false;
    return true;
  });

  const handleCopy = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenInIDE = (code: string) => {
    localStorage.setItem("activeIDECode", code);
    navigate("/ide");
  };

  return (
    <Layout>
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <FadeInView className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-muted border-2 border-b-4 border-border flex items-center justify-center text-2xl shadow-sm">
              📚
            </div>
            <div>
              <h1 className="text-3xl font-extrabold font-display text-foreground">
                Code Snippet Library
              </h1>
              <p className="text-sm font-semibold text-muted-foreground">
                Reusable Arduino code patterns — copy, paste, and build faster.
              </p>
            </div>
          </div>
        </FadeInView>

        {/* Search & Filters */}
        <FadeInView delay={0.1} className="mb-6">
          <div className="relative mb-4">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search code patterns or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-card border-2 border-b-4 border-border rounded-2xl text-sm font-semibold focus:outline-none focus:border-primary text-foreground transition-all placeholder:text-muted-foreground placeholder:font-bold shadow-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const active = category === c.value;
              return (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all border-2 border-b-4 ${
                    active
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-card border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {c.emoji} {c.label}
                </button>
              );
            })}
          </div>
        </FadeInView>

        {/* Snippets Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((snippet) => {
            const isExpanded = expandedId === snippet.id;
            const diffStyle = diffColors[snippet.difficulty];
            return (
              <motion.div key={snippet.id} variants={staggerItem}>
                <MotionCard
                  className="bg-card border-2 border-b-4 border-border rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:translate-y-[-1px] transition-all"
                  onClick={() => setExpandedId(isExpanded ? null : snippet.id)}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <h3 className="font-extrabold text-sm text-foreground">{snippet.title}</h3>
                        <p className="text-xs font-semibold text-muted-foreground mt-0.5">{snippet.desc}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(snippet.id, snippet.code);
                        }}
                        className="p-2 bg-muted hover:bg-muted/70 border border-border text-muted-foreground rounded-xl transition-all"
                        title="Copy code"
                      >
                        {copiedId === snippet.id ? (
                          <Check size={14} className="text-success" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {snippet.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-muted border border-border text-muted-foreground uppercase tracking-wider"
                        >
                          {t}
                        </span>
                      ))}
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold border uppercase tracking-wider ${diffStyle.bg} ${diffStyle.text} ${diffStyle.border}`}
                      >
                        {snippet.difficulty}
                      </span>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-border"
                        >
                          <div className="relative rounded-2xl overflow-hidden bg-background border border-border">
                            <pre className="text-xs font-mono p-4 overflow-x-auto text-foreground">
                              <code>{snippet.code}</code>
                            </pre>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenInIDE(snippet.code);
                              }}
                              aria-label={`Open ${snippet.title} in IDE`}
                              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm"
                            >
                              <Play size={12} /> Open in IDE
                            </button>
                          </div>
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
            <Code size={48} className="mx-auto mb-3 text-muted-foreground animate-pulse" />
            <h3 className="text-lg font-extrabold text-foreground mb-1">No snippets found</h3>
            <p className="text-sm font-semibold text-muted-foreground">
              Try searching with general keywords like 'led', 'analog', or 'button'.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
