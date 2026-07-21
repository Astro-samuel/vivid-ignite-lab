import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { toast as sonnerToast } from "sonner";
import { ArrowLeft, Clock, Zap, CheckCircle, Settings, Code, Play, Copy, Download, Sparkles, Save, Loader2, XCircle, AlertTriangle, Brain, Eye, RefreshCw, ChevronDown, ChevronUp, BookOpen, Lightbulb, Award, Info, ExternalLink, CheckSquare, Square, Star, MessageCircle, ThumbsUp, Share2, History, RotateCcw, Trash2 } from "lucide-react";
import ExplainCode from "@/components/ExplainCode";
import CodeEditor from "@/components/CodeEditor";
import RequiredLibraries from "@/components/RequiredLibraries";
import ArduinoSetupGuide from "@/components/ArduinoSetupGuide";
import { useArduinoFlasher } from "@/hooks/useArduinoFlasher";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProjects } from "@/hooks/useUserProjects";
import { supabase } from "@/integrations/supabase/client";

import Layout from "@/components/Layout";
import { useNavigate, useParams } from "react-router-dom";

const allProjects = [
  {
    id: 1, emoji: "💡", title: "LED Blink Tutorial",
    desc: "The classic 'Hello World' of Arduino — make an LED blink! Learn the basics of digital output, timing, and circuit fundamentals.",
    difficulty: "beginner", time: "15 mins", xp: 50,
    components: ["Arduino Uno", "LED (Red)", "Resistor (220Ω)", "Breadboard", "Jumper Wires"],
    instructions: [
      "Gather: Arduino Uno, red LED, 220Ω resistor, breadboard, jumper wires",
      "Place LED on breadboard — long leg (anode) and short leg (cathode)",
      "Connect resistor from anode row to pin 13",
      "Connect cathode row to GND",
      "Upload the code via Arduino IDE",
      "LED should blink every second — check Serial Monitor",
      "🧪 Try changing delay values for faster/slower blinking",
      "⚠️ No light? Check LED polarity and resistor wiring",
    ],
    basicCode: `/*
  Learning Goals:
  1. Understand digital output with digitalWrite()
  2. Use delay() for timing
  3. Basic circuit with LED and resistor
*/

// Pin definitions
const int ledPin = 13;    // Digital pin for LED

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("LED Blink Starting...");
}

void loop() {
  digitalWrite(ledPin, HIGH);   // Turn LED on
  delay(1000);                  // Wait 1 second
  digitalWrite(ledPin, LOW);    // Turn LED off
  delay(1000);                  // Wait 1 second
}`,
    optimizedCode: `/*
  Learning Goals:
  1. Understand digital output with digitalWrite()
  2. Use millis() for non-blocking timing
  3. Basic circuit with LED and resistor
*/

// Pin definitions
const int ledPin = 13;

// Variables
unsigned long previousMillis = 0;
const long interval = 1000;
int ledState = LOW;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("LED Blink (Non-blocking) Starting...");
}

void loop() {
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    ledState = (ledState == LOW) ? HIGH : LOW;
    digitalWrite(ledPin, ledState);
    Serial.print("LED State: ");
    Serial.println(ledState ? "ON" : "OFF");
  }
}`,
  },
  {
    id: 2, emoji: "🌡️", title: "Temperature Monitor",
    desc: "Read temperature data from a DHT22 sensor and display it on your computer via Serial Monitor. Learn about analog sensors and data reading.",
    difficulty: "beginner", time: "30 mins", xp: 75,
    components: ["Arduino Uno", "Temperature Sensor (DHT22)", "Resistor (10kΩ)", "Breadboard", "Jumper Wires"],
    instructions: [
      "Gather: Arduino Uno, DHT22 sensor, 10kΩ resistor, breadboard, wires",
      "Wire DHT22: Pin 1→5V, Pin 2→digital pin 2, Pin 4→GND",
      "Add 10kΩ pull-up resistor between DATA and VCC",
      "Install 'DHT sensor library' from Library Manager",
      "Upload code and open Serial Monitor at 9600 baud",
      "You should see temperature and humidity every 2 seconds",
      "🧪 Breathe on the sensor to see humidity spike",
      "⚠️ Seeing 'nan'? Check pull-up resistor and pin 2 connection",
    ],
    basicCode: `/*
  Learning Goals:
  1. Read data from a DHT22 temperature sensor
  2. Use Serial Monitor to display data
  3. Understand pull-up resistors
*/

#include <DHT.h>

const int dhtPin = 2;
DHT dht(dhtPin, DHT22);

void setup() {
  Serial.begin(9600);
  dht.begin();
  Serial.println("Temperature Monitor Starting...");
}

void loop() {
  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();

  Serial.print("Temperature: ");
  Serial.print(temp);
  Serial.print("°C | Humidity: ");
  Serial.print(humidity);
  Serial.println("%");

  delay(2000);
}`,
    optimizedCode: `/*
  Learning Goals:
  1. Read data from a DHT22 temperature sensor
  2. Add error handling for sensor reads
  3. Use non-blocking delays
*/

#include <DHT.h>

const int dhtPin = 2;
DHT dht(dhtPin, DHT22);
unsigned long lastRead = 0;

void setup() {
  Serial.begin(9600);
  dht.begin();
  Serial.println("Temperature Monitor (Optimized) Starting...");
}

void loop() {
  if (millis() - lastRead >= 2000) {
    lastRead = millis();
    float temp = dht.readTemperature();
    float humidity = dht.readHumidity();

    if (isnan(temp) || isnan(humidity)) {
      Serial.println("Error: Failed to read from DHT sensor!");
      return;
    }

    Serial.print("Temp: ");
    Serial.print(temp, 1);
    Serial.print("°C | Humidity: ");
    Serial.print(humidity, 1);
    Serial.println("%");
  }
}`,
  },
  {
    id: 3, emoji: "🤖", title: "Servo Motor Control",
    desc: "Control servo motors for precise angular movements. Learn about PWM signals, the Servo library, and how to create smooth motor control.",
    difficulty: "intermediate", time: "45 mins", xp: 100,
    components: ["Arduino Uno", "Servo Motor (SG90)", "Potentiometer", "Breadboard", "Jumper Wires"],
    instructions: [
      "Gather: Arduino Uno, SG90 servo, 10kΩ potentiometer, breadboard, wires",
      "Connect servo: Red→5V, Brown→GND, Orange→pin 9 (PWM)",
      "Wire potentiometer: outer pins to 5V/GND, middle to A0",
      "Upload code — pot value maps to servo angle (0-180°)",
      "Turn the knob and watch the servo follow",
      "🧪 Try limiting the range with map(val, 0, 1023, 45, 135)",
      "⚠️ Jittery servo? Add a 100μF capacitor near servo power pins",
    ],
    basicCode: `/*
  Learning Goals:
  1. Control a servo motor with the Servo library
  2. Use a potentiometer for analog input
  3. Map analog values to servo angles
*/

#include <Servo.h>

Servo myServo;
const int potPin = A0;
const int servoPin = 9;

void setup() {
  myServo.attach(servoPin);
  Serial.begin(9600);
  Serial.println("Servo Control Starting...");
}

void loop() {
  int potValue = analogRead(potPin);
  int angle = map(potValue, 0, 1023, 0, 180);
  myServo.write(angle);

  Serial.print("Pot: ");
  Serial.print(potValue);
  Serial.print(" | Angle: ");
  Serial.println(angle);

  delay(15);
}`,
    optimizedCode: `/*
  Learning Goals:
  1. Smooth servo movement with acceleration
  2. Deadband filtering on potentiometer
  3. Non-blocking servo updates
*/

#include <Servo.h>

Servo myServo;
const int potPin = A0;
const int servoPin = 9;
int currentAngle = 90;
int targetAngle = 90;

void setup() {
  myServo.attach(servoPin);
  myServo.write(currentAngle);
  Serial.begin(9600);
}

void loop() {
  int potValue = analogRead(potPin);
  targetAngle = map(potValue, 0, 1023, 0, 180);

  // Smooth movement
  if (abs(targetAngle - currentAngle) > 2) {
    currentAngle += (targetAngle > currentAngle) ? 1 : -1;
    myServo.write(currentAngle);
  }

  delay(10);
}`,
  },
  {
    id: 4, emoji: "🌈", title: "RGB LED Mixer",
    desc: "Mix colors with an RGB LED and potentiometers. Learn about PWM color mixing, analog inputs, and creating dynamic lighting effects.",
    difficulty: "beginner", time: "30 mins", xp: 80,
    components: ["Arduino Uno", "RGB LED", "Potentiometer", "Resistor (220Ω)", "Breadboard", "Jumper Wires"],
    instructions: [
      "Gather: Arduino Uno, common-cathode RGB LED, 3× 220Ω resistors, 3× potentiometers, breadboard, wires",
      "Connect RGB LED cathode (longest pin) to GND",
      "Wire each color through a 220Ω resistor: R→pin 9, G→pin 10, B→pin 11",
      "Wire 3 pots: middles to A0, A1, A2 — outers to 5V/GND",
      "Upload code — each pot controls one color channel (0-255)",
      "🧪 Try making purple (255,0,255) or orange (255,165,0)",
      "⚠️ Wrong colors? You may have a common-anode LED — invert values",
    ],
    basicCode: `/*
  Learning Goals:
  1. Use PWM to control RGB LED colors
  2. Read multiple analog inputs
  3. Map values between ranges
*/

const int redPin = 9;
const int greenPin = 10;
const int bluePin = 11;

void setup() {
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int r = map(analogRead(A0), 0, 1023, 0, 255);
  int g = map(analogRead(A1), 0, 1023, 0, 255);
  int b = map(analogRead(A2), 0, 1023, 0, 255);

  analogWrite(redPin, r);
  analogWrite(greenPin, g);
  analogWrite(bluePin, b);

  Serial.print("R:");
  Serial.print(r);
  Serial.print(" G:");
  Serial.print(g);
  Serial.print(" B:");
  Serial.println(b);

  delay(50);
}`,
    optimizedCode: `/*
  Learning Goals:
  1. Smooth color transitions
  2. Color presets and modes
*/

const int redPin = 9;
const int greenPin = 10;
const int bluePin = 11;

int currentR = 0, currentG = 0, currentB = 0;

void setup() {
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
  Serial.begin(9600);
}

void setColor(int r, int g, int b) {
  currentR += (r > currentR) ? 1 : (r < currentR) ? -1 : 0;
  currentG += (g > currentG) ? 1 : (g < currentG) ? -1 : 0;
  currentB += (b > currentB) ? 1 : (b < currentB) ? -1 : 0;
  analogWrite(redPin, currentR);
  analogWrite(greenPin, currentG);
  analogWrite(bluePin, currentB);
}

void loop() {
  int r = map(analogRead(A0), 0, 1023, 0, 255);
  int g = map(analogRead(A1), 0, 1023, 0, 255);
  int b = map(analogRead(A2), 0, 1023, 0, 255);
  setColor(r, g, b);
  delay(10);
}`,
  },
  {
    id: 5, emoji: "📡", title: "Bluetooth Controller",
    desc: "Control Arduino wirelessly via Bluetooth from your phone. Build a remote control system using HC-05 module and serial communication.",
    difficulty: "intermediate", time: "60 mins", xp: 130,
    components: ["Arduino Uno", "HC-05 Bluetooth", "LED (Red)", "LED (Green)", "Resistor (220Ω)", "Breadboard", "Jumper Wires"],
    instructions: [
      "Gather: Arduino Uno, HC-05 Bluetooth, 2× LEDs, 2× 220Ω resistors, breadboard, wires",
      "Wire HC-05: VCC→5V, GND→GND, TX→pin 0, RX→pin 1 (use voltage divider!)",
      "Connect LEDs through resistors to pins 12 and 13",
      "Disconnect HC-05 TX/RX before uploading code",
      "Pair phone with 'HC-05' (PIN: 1234), use a Bluetooth terminal app",
      "Send '1'/'2'/'3'/'4' to toggle LEDs on/off",
      "🧪 Try text commands like 'RED_ON' instead of numbers",
      "⚠️ No response? Check baud rate (9600) and HC-05 LED blink pattern",
    ],
    basicCode: `/*
  Learning Goals:
  1. Serial communication via Bluetooth
  2. Parse incoming commands
  3. Control outputs remotely
*/

const int led1 = 12;
const int led2 = 13;

void setup() {
  Serial.begin(9600);
  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);
  Serial.println("Bluetooth Controller Ready");
}

void loop() {
  if (Serial.available()) {
    char cmd = Serial.read();
    switch(cmd) {
      case '1': digitalWrite(led1, HIGH); Serial.println("LED1 ON"); break;
      case '2': digitalWrite(led1, LOW); Serial.println("LED1 OFF"); break;
      case '3': digitalWrite(led2, HIGH); Serial.println("LED2 ON"); break;
      case '4': digitalWrite(led2, LOW); Serial.println("LED2 OFF"); break;
      default: Serial.println("Unknown command"); break;
    }
  }
}`,
    optimizedCode: `/*
  Optimized with string commands and feedback
*/

const int led1 = 12;
const int led2 = 13;
String inputString = "";

void setup() {
  Serial.begin(9600);
  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);
}

void loop() {
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\\n') {
      inputString.trim();
      processCommand(inputString);
      inputString = "";
    } else {
      inputString += c;
    }
  }
}

void processCommand(String cmd) {
  if (cmd == "LED1_ON") { digitalWrite(led1, HIGH); Serial.println("OK:LED1_ON"); }
  else if (cmd == "LED1_OFF") { digitalWrite(led1, LOW); Serial.println("OK:LED1_OFF"); }
  else if (cmd == "LED2_ON") { digitalWrite(led2, HIGH); Serial.println("OK:LED2_ON"); }
  else if (cmd == "LED2_OFF") { digitalWrite(led2, LOW); Serial.println("OK:LED2_OFF"); }
  else if (cmd == "STATUS") {
    Serial.print("LED1:"); Serial.print(digitalRead(led1));
    Serial.print(" LED2:"); Serial.println(digitalRead(led2));
  }
  else Serial.println("ERR:UNKNOWN");
}`,
  },
  {
    id: 6, emoji: "🔊", title: "Music Synthesizer",
    desc: "Generate tones and melodies using a piezo buzzer. Learn about frequency, tone generation, and how to play simple songs.",
    difficulty: "beginner", time: "25 mins", xp: 70,
    components: ["Arduino Uno", "Buzzer", "Push Button", "Resistor (10kΩ)", "Breadboard", "Jumper Wires"],
    instructions: [
      "Gather: Arduino Uno, piezo buzzer, push button, 10kΩ resistor, breadboard, wires",
      "Connect buzzer: positive→pin 8, negative→GND",
      "Wire button between pin 2 (with pull-down resistor) and 5V",
      "Upload code — press button to play a C major scale",
      "🧪 Try the Mario theme: {660, 660, 0, 660, 0, 520, 660, 0, 784}",
      "⚠️ No sound? Check buzzer polarity and button wiring",
    ],
    basicCode: `/*
  Learning Goals:
  1. Generate tones with tone() function
  2. Define musical notes as frequencies
  3. Play a simple melody
*/

const int buzzerPin = 8;
const int buttonPin = 2;

int melody[] = {262, 294, 330, 349, 392, 440, 494, 523};
int noteDuration = 200;

void setup() {
  pinMode(buttonPin, INPUT);
  Serial.begin(9600);
}

void loop() {
  if (digitalRead(buttonPin) == HIGH) {
    for (int i = 0; i < 8; i++) {
      tone(buzzerPin, melody[i], noteDuration);
      delay(noteDuration + 50);
    }
    noTone(buzzerPin);
  }
}`,
    optimizedCode: `// Optimized version with multiple melodies
const int buzzerPin = 8;
const int buttonPin = 2;
int melodyIndex = 0;

int melody1[] = {262, 294, 330, 349, 392, 440, 494, 523};
int melody2[] = {523, 494, 440, 392, 349, 330, 294, 262};

void setup() {
  pinMode(buttonPin, INPUT);
}

void loop() {
  if (digitalRead(buttonPin) == HIGH) {
    int* mel = (melodyIndex % 2 == 0) ? melody1 : melody2;
    for (int i = 0; i < 8; i++) {
      tone(buzzerPin, mel[i], 180);
      delay(220);
    }
    noTone(buzzerPin);
    melodyIndex++;
    delay(300);
  }
}`,
  },
  {
    id: 7, emoji: "🌱", title: "Plant Watering Bot",
    desc: "Automate plant care with soil moisture sensing. Build a system that waters your plants automatically when the soil gets too dry.",
    difficulty: "intermediate", time: "55 mins", xp: 115,
    components: ["Arduino Uno", "Soil Moisture Sensor", "Relay Module", "Water Pump", "LED (Green)", "LED (Red)", "Resistor (220Ω)", "Breadboard", "Jumper Wires"],
    instructions: [
      "Gather: Arduino Uno, soil moisture sensor, relay module, water pump, 2× LEDs, resistors, breadboard",
      "Connect moisture sensor: VCC→5V, GND→GND, AO→A0",
      "Wire relay: VCC→5V, GND→GND, IN→pin 7",
      "Connect pump through relay NO terminal to power supply",
      "Wire green LED→pin 12, red LED→pin 13 (with resistors)",
      "Upload code — threshold (500) triggers watering",
      "🧪 Add a cooldown timer to prevent over-watering",
      "⚠️ Use separate power for pump if >500mA draw",
    ],
    basicCode: `/*
  Learning Goals:
  1. Read analog soil moisture sensor
  2. Control a relay for the water pump
  3. Use threshold-based automation
*/

const int sensorPin = A0;
const int relayPin = 7;
const int greenLed = 12;
const int redLed = 13;
const int threshold = 500;

void setup() {
  pinMode(relayPin, OUTPUT);
  pinMode(greenLed, OUTPUT);
  pinMode(redLed, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int moisture = analogRead(sensorPin);
  Serial.print("Moisture: ");
  Serial.println(moisture);

  if (moisture > threshold) {
    // Soil is dry - water it
    digitalWrite(relayPin, HIGH);
    digitalWrite(redLed, HIGH);
    digitalWrite(greenLed, LOW);
    Serial.println("Watering...");
  } else {
    // Soil is moist
    digitalWrite(relayPin, LOW);
    digitalWrite(redLed, LOW);
    digitalWrite(greenLed, HIGH);
  }
  delay(1000);
}`,
    optimizedCode: `// Optimized with timed watering and cooldown
const int sensorPin = A0;
const int relayPin = 7;
const int threshold = 500;
unsigned long lastWater = 0;
const long cooldown = 60000; // 1 min cooldown

void setup() {
  pinMode(relayPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int moisture = analogRead(sensorPin);
  bool dry = moisture > threshold;
  bool canWater = millis() - lastWater > cooldown;

  if (dry && canWater) {
    digitalWrite(relayPin, HIGH);
    delay(3000); // Water for 3 seconds
    digitalWrite(relayPin, LOW);
    lastWater = millis();
    Serial.println("Watered for 3s");
  }
  delay(2000);
}`,
  },
  {
    id: 8, emoji: "🔐", title: "Digital Lock System",
    desc: "Build a keypad-based combination lock with LCD feedback. Create a secure access system with multiple user codes and lockout protection.",
    difficulty: "intermediate", time: "70 mins", xp: 140,
    components: ["Arduino Uno", "16x2 LCD", "Push Button", "Buzzer", "LED (Green)", "LED (Red)", "Resistor (220Ω)", "Breadboard", "Jumper Wires"],
    instructions: [
      "Gather: Arduino Uno, I2C LCD, 4× push buttons, buzzer, 2× LEDs, resistors, breadboard",
      "Connect LCD via I2C: SDA→A4, SCL→A5, VCC→5V, GND→GND",
      "Wire 4 buttons to pins 2-5 (using INPUT_PULLUP, no resistors needed)",
      "Connect buzzer→pin 8, green LED→pin 12, red LED→pin 13",
      "Install 'LiquidCrystal_I2C' library, upload code",
      "Enter password '1234' using buttons — LCD shows result",
      "🧪 Add lockout after 3 failed attempts",
      "⚠️ LCD blank? Try I2C address 0x3C instead of 0x27",
    ],
    basicCode: `/*
  Learning Goals:
  1. Use an LCD display for user feedback
  2. Read multiple button inputs
  3. Implement a simple passcode system
*/

#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
const int buttons[] = {2, 3, 4, 5};
const int buzzer = 8;
const int greenLed = 12;
const int redLed = 13;
String code = "";
String password = "1234";

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.print("Enter Code:");
  for (int i = 0; i < 4; i++) pinMode(buttons[i], INPUT_PULLUP);
  pinMode(buzzer, OUTPUT);
  pinMode(greenLed, OUTPUT);
  pinMode(redLed, OUTPUT);
}

void loop() {
  for (int i = 0; i < 4; i++) {
    if (digitalRead(buttons[i]) == LOW) {
      code += String(i + 1);
      lcd.setCursor(code.length() - 1, 1);
      lcd.print("*");
      tone(buzzer, 1000, 100);
      delay(300);
    }
  }

  if (code.length() == 4) {
    if (code == password) {
      lcd.clear();
      lcd.print("Access Granted!");
      digitalWrite(greenLed, HIGH);
    } else {
      lcd.clear();
      lcd.print("Access Denied!");
      digitalWrite(redLed, HIGH);
    }
    delay(2000);
    code = "";
    digitalWrite(greenLed, LOW);
    digitalWrite(redLed, LOW);
    lcd.clear();
    lcd.print("Enter Code:");
  }
}`,
    optimizedCode: `// Optimized with lockout after 3 failed attempts
#include <LiquidCrystal_I2C.h>
LiquidCrystal_I2C lcd(0x27, 16, 2);
const int buttons[] = {2, 3, 4, 5};
String code = "";
String password = "1234";
int attempts = 0;
bool locked = false;
unsigned long lockTime = 0;

void setup() {
  lcd.init(); lcd.backlight();
  lcd.print("Enter Code:");
  for (int i = 0; i < 4; i++) pinMode(buttons[i], INPUT_PULLUP);
}

void loop() {
  if (locked && millis() - lockTime < 30000) {
    lcd.setCursor(0, 1);
    lcd.print("Wait ");
    lcd.print(30 - (millis() - lockTime) / 1000);
    lcd.print("s  ");
    return;
  }
  locked = false;
  // ... button reading logic
}`,
  },
  {
    id: 9, emoji: "🚗", title: "Obstacle Avoidance Car",
    desc: "Build a robot car that avoids obstacles autonomously using ultrasonic sensors and differential motor control.",
    difficulty: "advanced", time: "120 mins", xp: 250,
    components: ["Arduino Uno", "Ultrasonic Sensor (HC-SR04)", "Motor Driver (L298N)", "DC Motor", "Battery Holder", "Breadboard", "Jumper Wires"],
    instructions: [
      "Gather: Arduino Uno, HC-SR04 sensor, L298N driver, 2× DC motors, chassis, battery pack, wires",
      "Mount motors and wheels on chassis, add front caster wheel",
      "Wire L298N: IN1/IN2→pins 5/6, IN3/IN4→pins 7/8",
      "Power L298N from battery pack; connect GND to Arduino GND",
      "Mount HC-SR04 on front: Trig→pin 9, Echo→pin 10",
      "Upload code — robot drives forward, turns when <20cm from obstacle",
      "🧪 Add a servo to scan left/right before turning",
      "⚠️ Test with car lifted first; keep wires clear of wheels",
    ],
    basicCode: `/*
  Learning Goals:
  1. Control DC motors with L298N driver
  2. Measure distance with ultrasonic sensor
  3. Implement obstacle avoidance logic
*/

const int trigPin = 9;
const int echoPin = 10;
const int motor1A = 5, motor1B = 6;
const int motor2A = 7, motor2B = 8;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(motor1A, OUTPUT);
  pinMode(motor1B, OUTPUT);
  pinMode(motor2A, OUTPUT);
  pinMode(motor2B, OUTPUT);
  Serial.begin(9600);
}

long getDistance() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  return pulseIn(echoPin, HIGH) * 0.034 / 2;
}

void forward() {
  digitalWrite(motor1A, HIGH); digitalWrite(motor1B, LOW);
  digitalWrite(motor2A, HIGH); digitalWrite(motor2B, LOW);
}

void turnRight() {
  digitalWrite(motor1A, HIGH); digitalWrite(motor1B, LOW);
  digitalWrite(motor2A, LOW); digitalWrite(motor2B, HIGH);
}

void stopMotors() {
  digitalWrite(motor1A, LOW); digitalWrite(motor1B, LOW);
  digitalWrite(motor2A, LOW); digitalWrite(motor2B, LOW);
}

void loop() {
  long dist = getDistance();
  Serial.print("Distance: ");
  Serial.println(dist);

  if (dist > 20) {
    forward();
  } else {
    stopMotors();
    delay(300);
    turnRight();
    delay(500);
  }
  delay(100);
}`,
    optimizedCode: `// Optimized with servo scanning
// Similar structure but adds a scanning servo for better path finding
const int trigPin = 9;
const int echoPin = 10;

long getDistance() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  return pulseIn(echoPin, HIGH) * 0.034 / 2;
}

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.begin(9600);
}

void loop() {
  long dist = getDistance();
  if (dist > 25) { /* forward */ }
  else if (dist > 15) { /* slow down */ }
  else { /* stop and scan */ }
  delay(50);
}`,
  },
  {
    id: 10, emoji: "🌞", title: "Solar Tracker",
    desc: "Track the sun position using LDR sensors and servos. Build a dual-axis solar tracking system for maximum energy harvesting.",
    difficulty: "advanced", time: "90 mins", xp: 200,
    components: ["Arduino Uno", "Servo Motor (SG90)", "Photoresistor (LDR)", "Resistor (10kΩ)", "Breadboard", "Jumper Wires"],
    instructions: [
      "Gather: Arduino Uno, SG90 servo, 2× LDRs, 2× 10kΩ resistors, breadboard, wires",
      "Build sensor mount with vertical divider between two LDRs",
      "Wire LDR voltage dividers: Left→A0, Right→A1",
      "Connect servo: signal→pin 9, Red→5V, Brown→GND",
      "Upload code — servo tracks toward brighter LDR",
      "🧪 Add a second servo for dual-axis tracking",
      "⚠️ Jittery? Increase deadband threshold or add averaging",
    ],
    basicCode: `/*
  Learning Goals:
  1. Compare two analog sensor values
  2. Proportional servo control
  3. Solar tracking concept
*/

#include <Servo.h>

Servo tracker;
const int ldrLeft = A0;
const int ldrRight = A1;
int pos = 90;

void setup() {
  tracker.attach(9);
  tracker.write(pos);
  Serial.begin(9600);
}

void loop() {
  int left = analogRead(ldrLeft);
  int right = analogRead(ldrRight);
  int diff = left - right;

  if (abs(diff) > 50) {
    if (diff > 0 && pos < 180) pos++;
    if (diff < 0 && pos > 0) pos--;
    tracker.write(pos);
  }

  Serial.print("L:");
  Serial.print(left);
  Serial.print(" R:");
  Serial.print(right);
  Serial.print(" Pos:");
  Serial.println(pos);

  delay(20);
}`,
    optimizedCode: `// Optimized with deadband and averaging
#include <Servo.h>
Servo tracker;
int pos = 90;
int readings[10];
int readIndex = 0;

void setup() {
  tracker.attach(9);
  tracker.write(pos);
}

void loop() {
  int left = analogRead(A0);
  int right = analogRead(A1);
  int diff = left - right;

  if (abs(diff) > 30) {
    pos += (diff > 0) ? 1 : -1;
    pos = constrain(pos, 10, 170);
    tracker.write(pos);
  }
  delay(25);
}`,
  },
  {
    id: 11, emoji: "📊", title: "OLED Display Dashboard",
    desc: "Display sensor data on a tiny OLED screen. Create a real-time dashboard showing temperature, humidity, and system status.",
    difficulty: "intermediate", time: "40 mins", xp: 95,
    components: ["Arduino Uno", "OLED Display (0.96\")", "Temperature Sensor (DHT11)", "Breadboard", "Jumper Wires"],
    instructions: [
      "Gather: Arduino Uno, 0.96\" SSD1306 OLED (I2C), DHT11 sensor, breadboard, wires",
      "Connect OLED: SDA→A4, SCL→A5, VCC→3.3V/5V, GND→GND",
      "Wire DHT11: VCC→5V, GND→GND, DATA→pin 2",
      "Install Adafruit SSD1306, GFX, and DHT libraries",
      "Upload code — dashboard shows temp and humidity",
      "🧪 Add a mini graph plotting temperature history",
      "⚠️ Blank screen? Try I2C address 0x3C; check SDA/SCL",
    ],
    basicCode: `/*
  Learning Goals:
  1. Use I2C OLED display
  2. Display formatted sensor data
  3. Create a simple dashboard layout
*/

#include <Wire.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);
DHT dht(2, DHT11);

void setup() {
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  dht.begin();
  display.clearDisplay();
  display.setTextColor(WHITE);
}

void loop() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("== Dashboard ==");
  display.println();
  display.print("Temp: ");
  display.print(temp);
  display.println(" C");
  display.print("Hum:  ");
  display.print(hum);
  display.println(" %");
  display.display();

  delay(2000);
}`,
    optimizedCode: `// Optimized with graph plotting
#include <Wire.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);
DHT dht(2, DHT11);
float tempHistory[64];
int histIdx = 0;

void setup() {
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  dht.begin();
  for(int i=0;i<64;i++) tempHistory[i]=20;
}

void loop() {
  float temp = dht.readTemperature();
  tempHistory[histIdx % 64] = temp;
  histIdx++;
  // Draw mini graph on bottom half
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0,0);
  display.print("Temp: ");
  display.print(temp,1);
  display.println("C");
  display.display();
  delay(2000);
}`,
  },
  {
    id: 12, emoji: "🎮", title: "Joystick Game",
    desc: "Create a simple game controlled by a joystick module. Build a dot-dodging game on an LED matrix or serial display.",
    difficulty: "beginner", time: "35 mins", xp: 85,
    components: ["Arduino Uno", "LED Matrix 8x8", "Push Button", "Potentiometer", "Breadboard", "Jumper Wires"],
    instructions: [
      "Gather: Arduino Uno, joystick module (or 2 pots + button), 8×8 LED matrix, breadboard, wires",
      "Wire joystick: VRx→A0, VRy→A1, SW→pin 2, VCC→5V, GND→GND",
      "Connect MAX7219 matrix: DIN→pin 11, CS→pin 10, CLK→pin 13",
      "Upload code — move joystick to control player position",
      "Score increases each cycle — survive as long as possible!",
      "🧪 Add obstacles and collision detection for game over",
      "⚠️ Drifting? Calibrate center values and adjust thresholds",
    ],
    basicCode: `/*
  Learning Goals:
  1. Read joystick analog values
  2. Game loop concept
  3. Simple collision detection
*/

const int joyX = A0;
const int joyY = A1;
const int buttonPin = 2;

int playerX = 4, playerY = 4;
int score = 0;

void setup() {
  Serial.begin(9600);
  pinMode(buttonPin, INPUT_PULLUP);
  Serial.println("Joystick Game Ready!");
  Serial.println("Use joystick to move");
}

void loop() {
  int x = analogRead(joyX);
  int y = analogRead(joyY);

  if (x < 300 && playerX > 0) playerX--;
  if (x > 700 && playerX < 7) playerX++;
  if (y < 300 && playerY > 0) playerY--;
  if (y > 700 && playerY < 7) playerY++;

  Serial.print("Player: (");
  Serial.print(playerX);
  Serial.print(",");
  Serial.print(playerY);
  Serial.print(") Score: ");
  Serial.println(score);

  score++;
  delay(200);
}`,
    optimizedCode: `// Optimized with obstacles and game states
const int joyX = A0;
const int joyY = A1;
int px = 4, py = 4;
int obstX = 0, obstY = 0;
int score = 0;
bool gameOver = false;

void setup() {
  Serial.begin(9600);
  randomSeed(analogRead(A2));
  obstX = random(8);
  obstY = random(8);
}

void loop() {
  if (gameOver) {
    Serial.print("GAME OVER! Score: ");
    Serial.println(score);
    delay(3000);
    score = 0; gameOver = false;
    return;
  }

  int x = analogRead(joyX);
  int y = analogRead(joyY);
  if (x < 300 && px > 0) px--;
  if (x > 700 && px < 7) px++;
  if (y < 300 && py > 0) py--;
  if (y > 700 && py < 7) py++;

  if (px == obstX && py == obstY) {
    score += 10;
    obstX = random(8);
    obstY = random(8);
  }

  delay(150);
}`,
  },
  {
    id: 13, emoji: "🚦", title: "Traffic Light Simulator",
    desc: "Build a realistic traffic light sequence with LEDs.",
    difficulty: "beginner", time: "20 mins", xp: 55,
    components: ["LED (Red)", "LED (Green)", "Arduino Uno", "Resistor (220Ω)"],
    instructions: [
      "Gather: Arduino Uno, red LED, green LED, 220Ω resistor ×2, breadboard, jumper wires",
      "Connect red LED anode → 220Ω resistor → pin 8, cathode → GND",
      "Connect green LED anode → 220Ω resistor → pin 9, cathode → GND",
      "Upload the code via Arduino IDE",
      "LEDs alternate red/green every 3 seconds — watch Serial Monitor for state changes",
      "🧪 Try adding a yellow LED and a 3-phase sequence",
      "⚠️ No light? Check LED polarity and resistor placement",
    ],
    basicCode: `/*
  Learning Goals:
  1. Sequence multiple outputs with delay()
  2. Understand basic state timing
  3. Two-LED traffic light logic
*/

const int redPin = 8;
const int greenPin = 9;

void setup() {
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Traffic Light Starting...");
}

void loop() {
  // Red = Stop
  digitalWrite(redPin, HIGH);
  digitalWrite(greenPin, LOW);
  Serial.println("RED - Stop");
  delay(3000);

  // Green = Go
  digitalWrite(redPin, LOW);
  digitalWrite(greenPin, HIGH);
  Serial.println("GREEN - Go");
  delay(3000);
}`,
    optimizedCode: `// Optimized with a non-blocking millis() state machine
const int redPin = 8;
const int greenPin = 9;

enum LightState { RED, GREEN };
LightState state = RED;
unsigned long previousMillis = 0;
const long redDuration = 3000;
const long greenDuration = 3000;

void setup() {
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  Serial.begin(9600);
  digitalWrite(redPin, HIGH);
}

void loop() {
  unsigned long currentMillis = millis();
  long duration = (state == RED) ? redDuration : greenDuration;

  if (currentMillis - previousMillis >= duration) {
    previousMillis = currentMillis;
    if (state == RED) {
      state = GREEN;
      digitalWrite(redPin, LOW);
      digitalWrite(greenPin, HIGH);
      Serial.println("GREEN - Go");
    } else {
      state = RED;
      digitalWrite(greenPin, LOW);
      digitalWrite(redPin, HIGH);
      Serial.println("RED - Stop");
    }
  }
}`,
  },
  {
    id: 14, emoji: "🎹", title: "Piano Keys",
    desc: "Make a mini piano with push buttons and a buzzer.",
    difficulty: "beginner", time: "25 mins", xp: 65,
    components: ["Push Button", "Buzzer", "Arduino Uno", "Breadboard"],
    instructions: [
      "Gather: Arduino Uno, 4× push buttons, piezo buzzer, breadboard, jumper wires",
      "Wire each button between pins 2-5 and GND — internal pull-ups handle the rest",
      "Connect buzzer positive lead to pin 8, negative lead to GND",
      "Upload the code via Arduino IDE",
      "Press each button to hear a different note (C4-F4)",
      "🧪 Add more buttons and notes to build a full octave",
      "⚠️ No sound? Confirm it's a passive (not active) buzzer",
    ],
    basicCode: `/*
  Learning Goals:
  1. Read multiple digital inputs
  2. Generate tones with tone()
  3. Map buttons to musical notes
*/

const int buttonPins[4] = {2, 3, 4, 5};
const int notes[4] = {262, 294, 330, 349}; // C4, D4, E4, F4
const int buzzerPin = 8;

void setup() {
  for (int i = 0; i < 4; i++) {
    pinMode(buttonPins[i], INPUT_PULLUP);
  }
  pinMode(buzzerPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Piano Keys Ready!");
}

void loop() {
  bool anyPressed = false;
  for (int i = 0; i < 4; i++) {
    if (digitalRead(buttonPins[i]) == LOW) {
      tone(buzzerPin, notes[i]);
      anyPressed = true;
    }
  }
  if (!anyPressed) {
    noTone(buzzerPin);
  }
}`,
    optimizedCode: `// Optimized: avoids redundant tone() calls, prints note names
const int buttonPins[4] = {2, 3, 4, 5};
const int notes[4] = {262, 294, 330, 349};
const char* noteNames[4] = {"C4", "D4", "E4", "F4"};
const int buzzerPin = 8;
int lastPlayed = -1;

void setup() {
  for (int i = 0; i < 4; i++) pinMode(buttonPins[i], INPUT_PULLUP);
  pinMode(buzzerPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int pressed = -1;
  for (int i = 0; i < 4; i++) {
    if (digitalRead(buttonPins[i]) == LOW) {
      pressed = i;
      break;
    }
  }

  if (pressed != lastPlayed) {
    if (pressed == -1) {
      noTone(buzzerPin);
    } else {
      tone(buzzerPin, notes[pressed]);
      Serial.println(noteNames[pressed]);
    }
    lastPlayed = pressed;
  }
}`,
  },
  {
    id: 15, emoji: "🌙", title: "Night Light",
    desc: "Auto-on LED when it gets dark using a photoresistor.",
    difficulty: "beginner", time: "20 mins", xp: 55,
    components: ["LED (Red)", "Photoresistor (LDR)", "Arduino Uno", "Resistor (10kΩ)"],
    instructions: [
      "Gather: Arduino Uno, red LED, photoresistor (LDR), 10kΩ resistor, breadboard, wires",
      "Wire LDR between 5V and A0, then a 10kΩ resistor from A0 to GND (voltage divider)",
      "Connect LED anode → pin 9 (PWM), cathode → GND",
      "Upload the code via Arduino IDE",
      "Cover the LDR to simulate darkness — the LED should turn on smoothly",
      "🧪 Adjust the thresholds in the optimized version to match your room's lighting",
      "⚠️ LED flickering at dusk? Increase the hysteresis gap between thresholds",
    ],
    basicCode: `/*
  Learning Goals:
  1. Read analog values from a photoresistor (LDR)
  2. Use a voltage divider circuit
  3. Threshold-based digital output
*/

const int ldrPin = A0;
const int ledPin = 9;
const int darkThreshold = 500; // Adjust based on your environment

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Night Light Starting...");
}

void loop() {
  int lightLevel = analogRead(ldrPin);
  Serial.print("Light Level: ");
  Serial.println(lightLevel);

  if (lightLevel < darkThreshold) {
    digitalWrite(ledPin, HIGH); // Dark — turn LED on
  } else {
    digitalWrite(ledPin, LOW);  // Bright — turn LED off
  }

  delay(200);
}`,
    optimizedCode: `// Optimized with averaging and hysteresis to prevent flicker
const int ldrPin = A0;
const int ledPin = 9;
const int onThreshold = 450;
const int offThreshold = 550; // Hysteresis gap avoids rapid on/off toggling
bool lightOn = false;

int readAverageLight() {
  long total = 0;
  for (int i = 0; i < 8; i++) {
    total += analogRead(ldrPin);
    delay(5);
  }
  return total / 8;
}

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int lightLevel = readAverageLight();

  if (!lightOn && lightLevel < onThreshold) {
    lightOn = true;
  } else if (lightOn && lightLevel > offThreshold) {
    lightOn = false;
  }

  // Smooth fade instead of a hard on/off
  int brightness = lightOn ? map(constrain(lightLevel, 0, onThreshold), 0, onThreshold, 255, 80) : 0;
  analogWrite(ledPin, brightness);

  Serial.print("Light: ");
  Serial.print(lightLevel);
  Serial.print(" | LED: ");
  Serial.println(lightOn ? "ON" : "OFF");
}`,
  },
  {
    id: 16, emoji: "⏱️", title: "Reaction Timer Game",
    desc: "Measure your reaction speed with LEDs and a button.",
    difficulty: "intermediate", time: "40 mins", xp: 90,
    components: ["LED (Red)", "Push Button", "16x2 LCD", "Arduino Uno"],
    instructions: [
      "Gather: Arduino Uno, 16x2 I2C LCD, red LED, push button, breadboard, wires",
      "Wire LCD: SDA→A4, SCL→A5, VCC→5V, GND→GND",
      "Connect LED to pin 9 (with resistor), button between pin 8 and GND",
      "Upload the code via Arduino IDE",
      "Wait for 'GO!', then press the button as fast as you can",
      "🧪 The optimized version tracks your best time and flags false starts",
      "⚠️ LCD showing boxes? Adjust the contrast pot on the I2C backpack",
    ],
    basicCode: `/*
  Learning Goals:
  1. Use an I2C 16x2 LCD
  2. Measure elapsed time with millis()
  3. Random delays with random()
*/

#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
const int ledPin = 9;
const int buttonPin = 8;

void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);
  lcd.init();
  lcd.backlight();
  lcd.print("Reaction Timer");
  Serial.begin(9600);
  randomSeed(analogRead(A0));
  delay(1500);
}

void loop() {
  lcd.clear();
  lcd.print("Get Ready...");
  digitalWrite(ledPin, LOW);
  delay(random(2000, 5000));

  lcd.clear();
  lcd.print("GO!");
  digitalWrite(ledPin, HIGH);
  unsigned long startTime = millis();

  while (digitalRead(buttonPin) == HIGH) {
    // Wait for button press
  }

  unsigned long reactionTime = millis() - startTime;
  digitalWrite(ledPin, LOW);

  lcd.clear();
  lcd.print("Time: ");
  lcd.print(reactionTime);
  lcd.print("ms");
  Serial.print("Reaction time: ");
  Serial.println(reactionTime);

  delay(3000);
}`,
    optimizedCode: `// Optimized with false-start detection and best-score tracking
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
const int ledPin = 9;
const int buttonPin = 8;
unsigned long bestTime = 999999;

void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);
  lcd.init();
  lcd.backlight();
  Serial.begin(9600);
  randomSeed(analogRead(A0));
}

void loop() {
  lcd.clear();
  lcd.print("Get Ready...");
  digitalWrite(ledPin, LOW);
  unsigned long waitTime = random(2000, 5000);
  unsigned long waitStart = millis();

  // Detect a false start during the wait period
  while (millis() - waitStart < waitTime) {
    if (digitalRead(buttonPin) == LOW) {
      lcd.clear();
      lcd.print("Too Soon!");
      delay(2000);
      return;
    }
  }

  lcd.clear();
  lcd.print("GO!");
  digitalWrite(ledPin, HIGH);
  unsigned long startTime = millis();

  while (digitalRead(buttonPin) == HIGH) {
    // Wait for button press
  }

  unsigned long reactionTime = millis() - startTime;
  digitalWrite(ledPin, LOW);
  if (reactionTime < bestTime) bestTime = reactionTime;

  lcd.setCursor(0, 0);
  lcd.print("Time: ");
  lcd.print(reactionTime);
  lcd.print("ms");
  lcd.setCursor(0, 1);
  lcd.print("Best: ");
  lcd.print(bestTime);
  lcd.print("ms");

  delay(3000);
}`,
  },
  {
    id: 17, emoji: "🧭", title: "Digital Compass",
    desc: "Build a compass using an I2C magnetometer module.",
    difficulty: "intermediate", time: "50 mins", xp: 110,
    components: ["OLED Display (0.96\")", "Arduino Uno", "Breadboard", "Jumper Wires"],
    instructions: [
      "Gather: Arduino Uno, HMC5883L/QMC5883L magnetometer, 0.96\" OLED, breadboard, wires",
      "Wire both I2C devices: SDA→A4, SCL→A5, VCC→5V, GND→GND (shared bus)",
      "Upload the code via Arduino IDE",
      "Rotate the sensor flat and level — the heading should update in real time",
      "🧪 Run the calibration routine in the optimized version for better accuracy",
      "⚠️ Heading jumps around? Keep the sensor away from motors, speakers, and metal",
      "⚠️ Nothing on I2C? Run an I2C scanner sketch to confirm the sensor's address",
    ],
    basicCode: `/*
  Learning Goals:
  1. I2C communication with a magnetometer (HMC5883L)
  2. Convert raw magnetic field readings to a heading angle
  3. Display real-time data on an OLED
*/

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);
#define HMC5883L_ADDR 0x1E

void setup() {
  Serial.begin(9600);
  Wire.begin();
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();

  // Configure HMC5883L: continuous measurement mode
  Wire.beginTransmission(HMC5883L_ADDR);
  Wire.write(0x02);
  Wire.write(0x00);
  Wire.endTransmission();
}

void loop() {
  int16_t x, y, z;
  Wire.beginTransmission(HMC5883L_ADDR);
  Wire.write(0x03); // Start at register 3 (X MSB)
  Wire.endTransmission();
  Wire.requestFrom(HMC5883L_ADDR, 6);

  if (Wire.available() >= 6) {
    x = Wire.read() << 8 | Wire.read();
    z = Wire.read() << 8 | Wire.read();
    y = Wire.read() << 8 | Wire.read();

    float heading = atan2(y, x);
    if (heading < 0) heading += 2 * PI;
    float headingDeg = heading * 180 / PI;

    Serial.print("Heading: ");
    Serial.println(headingDeg);

    display.clearDisplay();
    display.setTextSize(2);
    display.setTextColor(WHITE);
    display.setCursor(0, 20);
    display.print(headingDeg, 0);
    display.println(" deg");
    display.display();
  }

  delay(200);
}`,
    optimizedCode: `// Optimized with calibration offsets and cardinal direction labels
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);
#define HMC5883L_ADDR 0x1E

// Calibrate these by rotating the sensor 360° and recording min/max
float xOffset = 0, yOffset = 0;

const char* directionFromHeading(float deg) {
  const char* dirs[] = {"N", "NE", "E", "SE", "S", "SW", "W", "NW"};
  int index = (int)((deg + 22.5) / 45) % 8;
  return dirs[index];
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);

  Wire.beginTransmission(HMC5883L_ADDR);
  Wire.write(0x02);
  Wire.write(0x00);
  Wire.endTransmission();
}

void loop() {
  int16_t x, y, z;
  Wire.beginTransmission(HMC5883L_ADDR);
  Wire.write(0x03);
  Wire.endTransmission();
  Wire.requestFrom(HMC5883L_ADDR, 6);

  if (Wire.available() >= 6) {
    x = Wire.read() << 8 | Wire.read();
    z = Wire.read() << 8 | Wire.read();
    y = Wire.read() << 8 | Wire.read();

    float heading = atan2(y - yOffset, x - xOffset);
    if (heading < 0) heading += 2 * PI;
    float headingDeg = heading * 180 / PI;

    display.clearDisplay();
    display.setTextSize(2);
    display.setTextColor(WHITE);
    display.setCursor(0, 10);
    display.print(headingDeg, 0);
    display.println(" deg");
    display.setTextSize(3);
    display.setCursor(30, 35);
    display.println(directionFromHeading(headingDeg));
    display.display();

    Serial.print(headingDeg);
    Serial.print(" deg - ");
    Serial.println(directionFromHeading(headingDeg));
  }

  delay(200);
}`,
  },
  {
    id: 18, emoji: "📻", title: "IR Remote Decoder",
    desc: "Capture and decode signals from any IR remote control.",
    difficulty: "intermediate", time: "35 mins", xp: 85,
    components: ["IR Sensor", "Arduino Uno", "Breadboard", "Jumper Wires"],
    instructions: [
      "Gather: Arduino Uno, IR receiver module (e.g. VS1838B), breadboard, jumper wires",
      "Wire IR receiver: OUT→pin 11, VCC→5V, GND→GND",
      "Install the 'IRremote' library from Library Manager",
      "Upload the code via Arduino IDE and open Serial Monitor at 9600 baud",
      "Point any remote at the sensor and press buttons — codes print to Serial",
      "🧪 Copy the printed hex codes into handleCommand() to map real buttons",
      "⚠️ No signal? Most receivers need the flat side facing the remote",
    ],
    basicCode: `/*
  Learning Goals:
  1. Receive and decode infrared signals
  2. Use the IRremote library
  3. Map remote codes to actions
*/

#include <IRremote.hpp>

const int irPin = 11;

void setup() {
  Serial.begin(9600);
  IrReceiver.begin(irPin, ENABLE_LED_FEEDBACK);
  Serial.println("IR Receiver Ready. Point a remote and press a button.");
}

void loop() {
  if (IrReceiver.decode()) {
    Serial.print("Code received: 0x");
    Serial.println(IrReceiver.decodedIRData.decodedRawData, HEX);
    IrReceiver.resume();
  }
}`,
    optimizedCode: `// Optimized with named button mapping and repeat filtering
#include <IRremote.hpp>

const int irPin = 11;
unsigned long lastCode = 0;
unsigned long lastReceiveTime = 0;

void handleCommand(unsigned long code) {
  // Replace these with the actual codes printed by your remote
  switch (code) {
    case 0xFF18E7: Serial.println("Button: UP"); break;
    case 0xFF4AB5: Serial.println("Button: DOWN"); break;
    case 0xFF10EF: Serial.println("Button: LEFT"); break;
    case 0xFF5AA5: Serial.println("Button: RIGHT"); break;
    case 0xFF38C7: Serial.println("Button: OK"); break;
    default:
      Serial.print("Unknown code: 0x");
      Serial.println(code, HEX);
  }
}

void setup() {
  Serial.begin(9600);
  IrReceiver.begin(irPin, ENABLE_LED_FEEDBACK);
}

void loop() {
  if (IrReceiver.decode()) {
    unsigned long code = IrReceiver.decodedIRData.decodedRawData;
    // Ignore repeat codes fired faster than 200ms (held button)
    if (code != 0 && millis() - lastReceiveTime > 200) {
      handleCommand(code);
      lastCode = code;
      lastReceiveTime = millis();
    }
    IrReceiver.resume();
  }
}`,
  },
  {
    id: 19, emoji: "🏠", title: "Smart Home Hub",
    desc: "Control lights and fans via WiFi with an ESP8266 shield.",
    difficulty: "advanced", time: "100 mins", xp: 220,
    components: ["ESP8266", "Relay Module", "LED (Red)", "Arduino Uno"],
    instructions: [
      "Gather: ESP8266 module (e.g. NodeMCU), relay module, red LED, breadboard, jumper wires",
      "This sketch runs directly on the ESP8266 — select 'NodeMCU 1.0' as your board",
      "Wire relay IN→D1, LED→D2 (with resistor), VCC/GND to the ESP8266's 3.3V/GND",
      "Set your WiFi ssid/password at the top of the sketch, then upload",
      "Open Serial Monitor to find the ESP8266's IP address once connected",
      "🧪 Visit the printed IP in a browser to control the relay and LED remotely",
      "⚠️ Won't connect? ESP8266 only supports 2.4GHz WiFi networks",
    ],
    basicCode: `/*
  Learning Goals:
  1. Run a simple WiFi web server on ESP8266
  2. Control a relay and LED remotely via HTTP
  3. Basic home automation concepts

  Note: This sketch runs directly on the ESP8266 module
  (select "Generic ESP8266" or "NodeMCU" as your board).
*/

#include <ESP8266WiFi.h>

const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

const int relayPin = 5;  // D1 on NodeMCU
const int ledPin = 4;    // D2 on NodeMCU

WiFiServer server(80);

void setup() {
  Serial.begin(9600);
  pinMode(relayPin, OUTPUT);
  pinMode(ledPin, OUTPUT);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected! IP address: ");
  Serial.println(WiFi.localIP());
  server.begin();
}

void loop() {
  WiFiClient client = server.available();
  if (!client) return;

  String request = client.readStringUntil('\\r');
  client.flush();

  if (request.indexOf("/relay/on") != -1) digitalWrite(relayPin, HIGH);
  if (request.indexOf("/relay/off") != -1) digitalWrite(relayPin, LOW);
  if (request.indexOf("/led/on") != -1) digitalWrite(ledPin, HIGH);
  if (request.indexOf("/led/off") != -1) digitalWrite(ledPin, LOW);

  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/plain");
  client.println();
  client.println("OK");
  client.stop();
}`,
    optimizedCode: `// Optimized: serves an HTML control page instead of raw text responses
#include <ESP8266WiFi.h>

const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

const int relayPin = 5;
const int ledPin = 4;
bool relayState = false;
bool ledState = false;

WiFiServer server(80);

void handleRequest(String request) {
  if (request.indexOf("/relay/on") != -1) { relayState = true; digitalWrite(relayPin, HIGH); }
  if (request.indexOf("/relay/off") != -1) { relayState = false; digitalWrite(relayPin, LOW); }
  if (request.indexOf("/led/on") != -1) { ledState = true; digitalWrite(ledPin, HIGH); }
  if (request.indexOf("/led/off") != -1) { ledState = false; digitalWrite(ledPin, LOW); }
}

void setup() {
  Serial.begin(9600);
  pinMode(relayPin, OUTPUT);
  pinMode(ledPin, OUTPUT);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  Serial.println(WiFi.localIP());
  server.begin();
}

void loop() {
  WiFiClient client = server.available();
  if (!client) return;

  String request = client.readStringUntil('\\r');
  client.flush();
  handleRequest(request);

  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/html");
  client.println();
  client.println("<html><body style='font-family:sans-serif'>");
  client.println("<h2>Smart Home Hub</h2>");
  client.print("<p>Relay: "); client.print(relayState ? "ON" : "OFF"); client.println("</p>");
  client.println("<a href='/relay/on'><button>Relay ON</button></a> ");
  client.println("<a href='/relay/off'><button>Relay OFF</button></a><br><br>");
  client.print("<p>LED: "); client.print(ledState ? "ON" : "OFF"); client.println("</p>");
  client.println("<a href='/led/on'><button>LED ON</button></a> ");
  client.println("<a href='/led/off'><button>LED OFF</button></a>");
  client.println("</body></html>");
  client.stop();
}`,
  },
  {
    id: 20, emoji: "🤖", title: "Line Following Robot",
    desc: "Build a robot that follows a black line on the floor.",
    difficulty: "advanced", time: "110 mins", xp: 230,
    components: ["IR Sensor", "Motor Driver (L298N)", "DC Motor", "Arduino Uno"],
    instructions: [
      "Gather: Arduino Uno, 2× IR line sensors, L298N motor driver, 2× DC motors + wheels, chassis",
      "Wire both IR sensors' outputs to pins 2 and 3",
      "Wire L298N: IN1-IN4→pins 8-11, ENA/ENB→pins 5/6, motors to OUT1-OUT4",
      "Power the L298N from a separate battery pack (not through the Arduino)",
      "Upload the code and place the robot on a black line on a light surface",
      "🧪 Tune baseSpeed/turnSpeed in the optimized version for smoother tracking",
      "⚠️ Robot jerky or stalling? Check the L298N has its own adequate power supply",
    ],
    basicCode: `/*
  Learning Goals:
  1. Read IR line sensors for line detection
  2. Control 2 DC motors via L298N H-bridge
  3. Basic differential steering logic
*/

const int leftSensor = 2;
const int rightSensor = 3;

const int leftMotorIN1 = 8;
const int leftMotorIN2 = 9;
const int rightMotorIN1 = 10;
const int rightMotorIN2 = 11;

void setup() {
  pinMode(leftSensor, INPUT);
  pinMode(rightSensor, INPUT);
  pinMode(leftMotorIN1, OUTPUT);
  pinMode(leftMotorIN2, OUTPUT);
  pinMode(rightMotorIN1, OUTPUT);
  pinMode(rightMotorIN2, OUTPUT);
  Serial.begin(9600);
}

void forward() {
  digitalWrite(leftMotorIN1, HIGH); digitalWrite(leftMotorIN2, LOW);
  digitalWrite(rightMotorIN1, HIGH); digitalWrite(rightMotorIN2, LOW);
}

void turnLeft() {
  digitalWrite(leftMotorIN1, LOW); digitalWrite(leftMotorIN2, LOW);
  digitalWrite(rightMotorIN1, HIGH); digitalWrite(rightMotorIN2, LOW);
}

void turnRight() {
  digitalWrite(leftMotorIN1, HIGH); digitalWrite(leftMotorIN2, LOW);
  digitalWrite(rightMotorIN1, LOW); digitalWrite(rightMotorIN2, LOW);
}

void stopMotors() {
  digitalWrite(leftMotorIN1, LOW); digitalWrite(leftMotorIN2, LOW);
  digitalWrite(rightMotorIN1, LOW); digitalWrite(rightMotorIN2, LOW);
}

void loop() {
  // Sensors read HIGH over the black line, LOW over the light surface
  bool onLineLeft = digitalRead(leftSensor);
  bool onLineRight = digitalRead(rightSensor);

  if (onLineLeft && onLineRight) {
    forward();
  } else if (onLineLeft && !onLineRight) {
    turnLeft();
  } else if (!onLineLeft && onLineRight) {
    turnRight();
  } else {
    stopMotors();
  }
}`,
    optimizedCode: `// Optimized with PWM speed control for smoother turns
const int leftSensor = 2;
const int rightSensor = 3;

const int leftMotorIN1 = 8;
const int leftMotorIN2 = 9;
const int leftEnable = 5;   // PWM
const int rightMotorIN1 = 10;
const int rightMotorIN2 = 11;
const int rightEnable = 6;  // PWM

const int baseSpeed = 180;
const int turnSpeed = 100;

void setup() {
  pinMode(leftSensor, INPUT);
  pinMode(rightSensor, INPUT);
  pinMode(leftMotorIN1, OUTPUT);
  pinMode(leftMotorIN2, OUTPUT);
  pinMode(rightMotorIN1, OUTPUT);
  pinMode(rightMotorIN2, OUTPUT);
  pinMode(leftEnable, OUTPUT);
  pinMode(rightEnable, OUTPUT);
  Serial.begin(9600);
}

void drive(int leftSpeed, int rightSpeed) {
  digitalWrite(leftMotorIN1, HIGH); digitalWrite(leftMotorIN2, LOW);
  digitalWrite(rightMotorIN1, HIGH); digitalWrite(rightMotorIN2, LOW);
  analogWrite(leftEnable, leftSpeed);
  analogWrite(rightEnable, rightSpeed);
}

void loop() {
  bool onLineLeft = digitalRead(leftSensor);
  bool onLineRight = digitalRead(rightSensor);

  if (onLineLeft && onLineRight) {
    drive(baseSpeed, baseSpeed);
  } else if (onLineLeft && !onLineRight) {
    drive(turnSpeed, baseSpeed);
  } else if (!onLineLeft && onLineRight) {
    drive(baseSpeed, turnSpeed);
  } else {
    drive(0, 0);
  }
}`,
  },
  {
    id: 21, emoji: "📡", title: "Weather Station",
    desc: "Log temperature, humidity, and pressure to an SD card.",
    difficulty: "advanced", time: "95 mins", xp: 210,
    components: ["BMP180 (Pressure)", "SD Card Module", "Arduino Uno", "Breadboard"],
    instructions: [
      "Gather: Arduino Uno, BMP180 sensor, SD card module, SD card, breadboard, wires",
      "Wire BMP180: SDA→A4, SCL→A5, VCC→5V, GND→GND",
      "Wire SD module: CS→pin 10, MOSI→11, MISO→12, SCK→13, VCC→5V, GND→GND",
      "Install 'Adafruit BMP085' and 'SD' libraries, then upload",
      "Open Serial Monitor to see live readings — data also logs to weather.csv",
      "🧪 Pull the SD card and open the CSV in a spreadsheet to graph trends",
      "⚠️ 'SD card init failed'? Reformat the card as FAT16/FAT32",
    ],
    basicCode: `/*
  Learning Goals:
  1. Read temperature and pressure from a BMP180 sensor (I2C)
  2. Log data to an SD card
  3. Combine multiple I2C/SPI peripherals
*/

#include <Wire.h>
#include <Adafruit_BMP085.h>
#include <SPI.h>
#include <SD.h>

Adafruit_BMP085 bmp;
const int chipSelect = 10;

void setup() {
  Serial.begin(9600);

  if (!bmp.begin()) {
    Serial.println("BMP180 not found!");
    while (1);
  }

  if (!SD.begin(chipSelect)) {
    Serial.println("SD card init failed!");
    while (1);
  }
  Serial.println("Weather Station Ready!");
}

void loop() {
  float temperature = bmp.readTemperature();
  float pressure = bmp.readPressure() / 100.0F; // Convert to hPa

  Serial.print("Temp: "); Serial.print(temperature); Serial.print(" C, ");
  Serial.print("Pressure: "); Serial.print(pressure); Serial.println(" hPa");

  File dataFile = SD.open("weather.csv", FILE_WRITE);
  if (dataFile) {
    dataFile.print(millis());
    dataFile.print(",");
    dataFile.print(temperature);
    dataFile.print(",");
    dataFile.println(pressure);
    dataFile.close();
  }

  delay(5000);
}`,
    optimizedCode: `// Optimized with altitude calculation and logging error recovery
#include <Wire.h>
#include <Adafruit_BMP085.h>
#include <SPI.h>
#include <SD.h>

Adafruit_BMP085 bmp;
const int chipSelect = 10;
const float seaLevelPressure = 1013.25; // hPa, adjust for your location
bool sdReady = false;

void setup() {
  Serial.begin(9600);

  if (!bmp.begin()) {
    Serial.println("BMP180 not found!");
    while (1);
  }

  sdReady = SD.begin(chipSelect);
  if (!sdReady) Serial.println("SD card unavailable — logging to Serial only.");
  Serial.println("timestamp_ms,temp_C,pressure_hPa,altitude_m");
}

void loop() {
  float temperature = bmp.readTemperature();
  float pressure = bmp.readPressure() / 100.0F;
  float altitude = 44330.0 * (1.0 - pow(pressure / seaLevelPressure, 0.1903));

  String row = String(millis()) + "," + String(temperature) + "," + String(pressure) + "," + String(altitude);
  Serial.println(row);

  if (sdReady) {
    File dataFile = SD.open("weather.csv", FILE_WRITE);
    if (dataFile) {
      dataFile.println(row);
      dataFile.close();
    } else {
      Serial.println("Warning: could not write to SD card.");
    }
  }

  delay(5000);
}`,
  },
  {
    id: 22, emoji: "🦾", title: "Robotic Arm Controller",
    desc: "Control a 4-DOF robotic arm with potentiometers.",
    difficulty: "advanced", time: "130 mins", xp: 260,
    components: ["Servo Motor (SG90)", "Potentiometer", "Arduino Mega", "Breadboard"],
    instructions: [
      "Gather: Arduino Mega, 4× SG90 servos, 4× potentiometers, breadboard, jumper wires",
      "Wire servos to pins 3, 5, 6, 9 (all PWM-capable on the Mega)",
      "Wire each potentiometer's wiper to A0-A3, outer legs to 5V and GND",
      "Power servos from a separate 5V supply if using more than 2 simultaneously",
      "Upload the code — each pot now directly controls one joint",
      "🧪 Try the smoothed version so movements ease instead of snapping",
      "⚠️ Servos twitching? Add a large capacitor across the servo power rails",
    ],
    basicCode: `/*
  Learning Goals:
  1. Control multiple servos simultaneously
  2. Map potentiometer input to servo angle
  3. Basic 4-DOF robotic arm kinematics (direct joint control)
*/

#include <Servo.h>

Servo baseServo, shoulderServo, elbowServo, gripperServo;

const int basePot = A0;
const int shoulderPot = A1;
const int elbowPot = A2;
const int gripperPot = A3;

void setup() {
  baseServo.attach(3);
  shoulderServo.attach(5);
  elbowServo.attach(6);
  gripperServo.attach(9);
  Serial.begin(9600);
}

void loop() {
  int baseAngle = map(analogRead(basePot), 0, 1023, 0, 180);
  int shoulderAngle = map(analogRead(shoulderPot), 0, 1023, 0, 180);
  int elbowAngle = map(analogRead(elbowPot), 0, 1023, 0, 180);
  int gripperAngle = map(analogRead(gripperPot), 0, 1023, 0, 180);

  baseServo.write(baseAngle);
  shoulderServo.write(shoulderAngle);
  elbowServo.write(elbowAngle);
  gripperServo.write(gripperAngle);

  Serial.print("Base:"); Serial.print(baseAngle);
  Serial.print(" Shoulder:"); Serial.print(shoulderAngle);
  Serial.print(" Elbow:"); Serial.print(elbowAngle);
  Serial.print(" Gripper:"); Serial.println(gripperAngle);

  delay(50);
}`,
    optimizedCode: `// Optimized with smoothed motion — servos ease toward target instead of jumping
#include <Servo.h>

Servo baseServo, shoulderServo, elbowServo, gripperServo;

const int basePot = A0;
const int shoulderPot = A1;
const int elbowPot = A2;
const int gripperPot = A3;

float currentBase = 90, currentShoulder = 90, currentElbow = 90, currentGripper = 90;
const float smoothing = 0.1; // Lower = smoother but slower response

float smoothMove(float current, int targetRaw) {
  int target = map(targetRaw, 0, 1023, 0, 180);
  return current + (target - current) * smoothing;
}

void setup() {
  baseServo.attach(3);
  shoulderServo.attach(5);
  elbowServo.attach(6);
  gripperServo.attach(9);
  Serial.begin(9600);
}

void loop() {
  currentBase = smoothMove(currentBase, analogRead(basePot));
  currentShoulder = smoothMove(currentShoulder, analogRead(shoulderPot));
  currentElbow = smoothMove(currentElbow, analogRead(elbowPot));
  currentGripper = smoothMove(currentGripper, analogRead(gripperPot));

  baseServo.write((int)currentBase);
  shoulderServo.write((int)currentShoulder);
  elbowServo.write((int)currentElbow);
  gripperServo.write((int)currentGripper);

  delay(15);
}`,
  },
  {
    id: 23, emoji: "🔋", title: "Battery Monitor System",
    desc: "Monitor and display battery voltage and health status.",
    difficulty: "advanced", time: "80 mins", xp: 190,
    components: ["OLED Display (0.96\")", "Arduino Uno", "Resistor (10kΩ)", "Breadboard"],
    instructions: [
      "Gather: Arduino Uno, 0.96\" OLED, 2× 10kΩ resistors, breadboard, wires",
      "Build a voltage divider: battery+ → R1(10k) → A0 → R2(10k) → GND",
      "Wire OLED: SDA→A4, SCL→A5, VCC→5V, GND→GND",
      "Upload the code — never connect a battery above 5V directly to any Arduino pin",
      "Voltage and percentage should update on the OLED every second",
      "🧪 Adjust maxVoltage/minVoltage to match your specific battery chemistry",
      "⚠️ Readings unstable? The averaging in the optimized version smooths this out",
    ],
    basicCode: `/*
  Learning Goals:
  1. Measure voltage beyond 5V using a resistor voltage divider
  2. Read and calibrate analog input
  3. Display real-time data on OLED
*/

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);
const int voltagePin = A0;

// Voltage divider: R1 (10k) from battery+ to A0, R2 (10k) from A0 to GND
const float r1 = 10000.0;
const float r2 = 10000.0;
const float refVoltage = 5.0;

void setup() {
  Serial.begin(9600);
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
}

void loop() {
  int raw = analogRead(voltagePin);
  float measuredVoltage = (raw / 1023.0) * refVoltage;
  float batteryVoltage = measuredVoltage * ((r1 + r2) / r2);

  Serial.print("Battery Voltage: ");
  Serial.println(batteryVoltage);

  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(WHITE);
  display.setCursor(0, 20);
  display.print(batteryVoltage, 2);
  display.println("V");
  display.display();

  delay(1000);
}`,
    optimizedCode: `// Optimized with battery percentage estimate, averaging, and low-battery warning
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);
const int voltagePin = A0;

const float r1 = 10000.0;
const float r2 = 10000.0;
const float refVoltage = 5.0;
const float maxVoltage = 12.6; // Full charge (e.g. 3S LiPo)
const float minVoltage = 9.0;  // Empty

float readAveragedVoltage() {
  long total = 0;
  for (int i = 0; i < 10; i++) {
    total += analogRead(voltagePin);
    delay(2);
  }
  float raw = total / 10.0;
  float measuredVoltage = (raw / 1023.0) * refVoltage;
  return measuredVoltage * ((r1 + r2) / r2);
}

void setup() {
  Serial.begin(9600);
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
}

void loop() {
  float batteryVoltage = readAveragedVoltage();
  int percentage = constrain(map(batteryVoltage * 100, minVoltage * 100, maxVoltage * 100, 0, 100), 0, 100);

  Serial.print(batteryVoltage);
  Serial.print("V (");
  Serial.print(percentage);
  Serial.println("%)");

  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(WHITE);
  display.setCursor(0, 10);
  display.print(batteryVoltage, 2);
  display.println("V");
  display.setCursor(0, 35);
  display.print(percentage);
  display.println("%");

  if (percentage < 15) {
    display.setCursor(0, 55);
    display.println("LOW BATTERY!");
  }
  display.display();

  delay(1000);
}`,
  },
  {
    id: 24, emoji: "🎲", title: "Electronic Dice",
    desc: "Roll a digital dice with LEDs and a push button.",
    difficulty: "beginner", time: "25 mins", xp: 60,
    components: ["LED (Red)", "Push Button", "Arduino Uno", "Resistor (220Ω)"],
    instructions: [
      "Gather: Arduino Uno, red LED, push button, 220Ω resistor, breadboard, wires",
      "Connect LED anode → 220Ω resistor → pin 9, cathode → GND",
      "Connect button between pin 2 and GND (internal pull-up handles the rest)",
      "Upload the code via Arduino IDE",
      "Press the button — the LED blinks 1-6 times to show your roll",
      "🧪 Try the rolling-animation version for a suspenseful flicker before the result",
      "⚠️ Same number every time? Confirm A0 is left floating (unconnected) for good randomSeed()",
    ],
    basicCode: `/*
  Learning Goals:
  1. Generate pseudo-random numbers with random()
  2. Debounce a push button
  3. Represent a value using LED blink counts
*/

const int buttonPin = 2;
const int ledPin = 9;

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  randomSeed(analogRead(A0));
  Serial.println("Press the button to roll the dice!");
}

void loop() {
  if (digitalRead(buttonPin) == LOW) {
    delay(50); // Simple debounce
    int roll = random(1, 7); // 1 to 6
    Serial.print("You rolled: ");
    Serial.println(roll);

    for (int i = 0; i < roll; i++) {
      digitalWrite(ledPin, HIGH);
      delay(200);
      digitalWrite(ledPin, LOW);
      delay(200);
    }

    while (digitalRead(buttonPin) == LOW) {
      // Wait for button release
    }
  }
}`,
    optimizedCode: `// Optimized with a rolling animation before the final result
const int buttonPin = 2;
const int ledPin = 9;

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  randomSeed(analogRead(A0));
}

void loop() {
  if (digitalRead(buttonPin) == LOW) {
    delay(50);

    // Rolling animation — rapid flicker for suspense
    unsigned long rollStart = millis();
    while (millis() - rollStart < 1000) {
      digitalWrite(ledPin, HIGH);
      delay(40);
      digitalWrite(ledPin, LOW);
      delay(40);
    }

    int roll = random(1, 7);
    Serial.print("You rolled: ");
    Serial.println(roll);

    delay(300);
    for (int i = 0; i < roll; i++) {
      digitalWrite(ledPin, HIGH);
      delay(250);
      digitalWrite(ledPin, LOW);
      delay(250);
    }

    while (digitalRead(buttonPin) == LOW) {
      // Wait for release
    }
  }
}`,
  },
  {
    id: 25, emoji: "📢", title: "Clap Switch",
    desc: "Toggle an LED by clapping using a sound sensor.",
    difficulty: "beginner", time: "30 mins", xp: 70,
    components: ["Sound Sensor", "LED (Red)", "Arduino Uno", "Breadboard"],
    instructions: [
      "Gather: Arduino Uno, sound sensor module (e.g. KY-038), red LED, breadboard, wires",
      "Wire sound sensor: OUT→pin 2, VCC→5V, GND→GND",
      "Connect LED to pin 9 (with resistor), cathode to GND",
      "Upload the code and adjust the sensor's onboard sensitivity potentiometer",
      "Clap near the sensor — the LED should toggle on/off",
      "🧪 Try the double-clap version so accidental noise doesn't trigger it",
      "⚠️ Too sensitive or not sensitive enough? Turn the tiny blue pot on the sensor board",
    ],
    basicCode: `/*
  Learning Goals:
  1. Read a digital sound sensor
  2. Toggle state on an event (not just level)
  3. Simple edge detection
*/

const int soundPin = 2;
const int ledPin = 9;
bool ledState = false;

void setup() {
  pinMode(soundPin, INPUT);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Clap to toggle the LED!");
}

void loop() {
  if (digitalRead(soundPin) == HIGH) {
    ledState = !ledState;
    digitalWrite(ledPin, ledState);
    Serial.println(ledState ? "LED ON" : "LED OFF");
    delay(500); // Prevent one clap from triggering multiple toggles
  }
}`,
    optimizedCode: `// Optimized with double-clap detection (two claps within 600ms = toggle)
const int soundPin = 2;
const int ledPin = 9;
bool ledState = false;
unsigned long firstClapTime = 0;
bool waitingForSecondClap = false;
const unsigned long clapWindow = 600;

void setup() {
  pinMode(soundPin, INPUT);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Clap twice quickly to toggle the LED!");
}

void loop() {
  if (digitalRead(soundPin) == HIGH) {
    unsigned long now = millis();

    if (!waitingForSecondClap) {
      firstClapTime = now;
      waitingForSecondClap = true;
    } else if (now - firstClapTime < clapWindow) {
      ledState = !ledState;
      digitalWrite(ledPin, ledState);
      Serial.println(ledState ? "LED ON" : "LED OFF");
      waitingForSecondClap = false;
    }
    delay(200); // Debounce each individual clap
  }

  // Reset if second clap never comes
  if (waitingForSecondClap && millis() - firstClapTime > clapWindow) {
    waitingForSecondClap = false;
  }
}`,
  },
  {
    id: 26, emoji: "🔔", title: "Motion Detection Alarm",
    desc: "Detect movement with a PIR sensor and trigger an alarm.",
    difficulty: "intermediate", time: "40 mins", xp: 95,
    components: ["PIR Sensor", "Buzzer", "LED (Red)", "Arduino Uno"],
    instructions: [
      "Gather: Arduino Uno, PIR motion sensor, buzzer, red LED, breadboard, wires",
      "Wire PIR: OUT→pin 2, VCC→5V, GND→GND",
      "Connect buzzer to pin 8, LED to pin 9 (with resistor)",
      "Upload the code — wait the full 30s warm-up before testing (PIR sensors need this)",
      "Walk in front of the sensor — buzzer and LED should activate",
      "🧪 Send 'd'/'a' over Serial to disarm/arm in the optimized version",
      "⚠️ False triggers? Keep the PIR away from heaters, windows, and direct sunlight",
    ],
    basicCode: `/*
  Learning Goals:
  1. Read a PIR motion sensor
  2. Trigger multiple outputs (buzzer + LED) on an event
  3. Handle sensor warm-up time
*/

const int pirPin = 2;
const int buzzerPin = 8;
const int ledPin = 9;

void setup() {
  pinMode(pirPin, INPUT);
  pinMode(buzzerPin, OUTPUT);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("PIR warming up...");
  delay(30000); // PIR sensors need ~30s to stabilize
  Serial.println("Motion Alarm Armed!");
}

void loop() {
  if (digitalRead(pirPin) == HIGH) {
    Serial.println("Motion detected!");
    digitalWrite(ledPin, HIGH);
    tone(buzzerPin, 1000);
    delay(2000);
    digitalWrite(ledPin, LOW);
    noTone(buzzerPin);
  }
}`,
    optimizedCode: `// Optimized with a non-blocking alarm and Serial arm/disarm control
const int pirPin = 2;
const int buzzerPin = 8;
const int ledPin = 9;

bool armed = true;
bool alarmActive = false;
unsigned long alarmStart = 0;
const unsigned long alarmDuration = 2000;

void setup() {
  pinMode(pirPin, INPUT);
  pinMode(buzzerPin, OUTPUT);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("PIR warming up...");
  delay(30000);
  Serial.println("Motion Alarm Armed! Send 'd' to disarm, 'a' to arm.");
}

void loop() {
  if (Serial.available()) {
    char cmd = Serial.read();
    if (cmd == 'd') { armed = false; Serial.println("Disarmed"); }
    if (cmd == 'a') { armed = true; Serial.println("Armed"); }
  }

  if (armed && !alarmActive && digitalRead(pirPin) == HIGH) {
    Serial.println("Motion detected!");
    alarmActive = true;
    alarmStart = millis();
    digitalWrite(ledPin, HIGH);
    tone(buzzerPin, 1000);
  }

  if (alarmActive && millis() - alarmStart >= alarmDuration) {
    digitalWrite(ledPin, LOW);
    noTone(buzzerPin);
    alarmActive = false;
  }
}`,
  },
  {
    id: 27, emoji: "🎯", title: "Laser Tripwire",
    desc: "Create a laser security tripwire with alarms.",
    difficulty: "intermediate", time: "45 mins", xp: 100,
    components: ["Laser Module", "Photoresistor (LDR)", "Buzzer", "Arduino Uno"],
    instructions: [
      "Gather: Arduino Uno, laser module, photoresistor (LDR), buzzer, breadboard, wires",
      "Mount the laser and LDR facing each other across the 'tripwire' gap",
      "Wire laser→pin 8, LDR between 5V and A0 (with a 10kΩ pull-down to GND), buzzer→pin 9",
      "Upload the code and let it calibrate against the unobstructed beam",
      "Walk through the beam — the buzzer should sound and stay latched",
      "🧪 Add a reset button so the optimized version's alarm needs a manual clear",
      "⚠️ False alarms? Re-run calibration after finalizing the laser/LDR alignment",
    ],
    basicCode: `/*
  Learning Goals:
  1. Detect a laser beam interruption using an LDR
  2. Threshold-based event triggering
  3. Basic security system logic
*/

const int laserPin = 8;
const int ldrPin = A0;
const int buzzerPin = 9;
const int threshold = 500; // Calibrate: value when beam hits LDR directly

void setup() {
  pinMode(laserPin, OUTPUT);
  pinMode(buzzerPin, OUTPUT);
  digitalWrite(laserPin, HIGH); // Laser always on
  Serial.begin(9600);
  Serial.println("Tripwire Armed!");
}

void loop() {
  int lightLevel = analogRead(ldrPin);
  Serial.println(lightLevel);

  if (lightLevel < threshold) {
    // Beam broken — light level dropped
    tone(buzzerPin, 1000);
    Serial.println("ALARM! Beam broken!");
  } else {
    noTone(buzzerPin);
  }

  delay(100);
}`,
    optimizedCode: `// Optimized with an auto-calibration step and a latching alarm
const int laserPin = 8;
const int ldrPin = A0;
const int buzzerPin = 9;
const int resetButton = 2;

int baselineLight = 0;
int triggerMargin = 150; // How far below baseline counts as "broken"
bool alarmLatched = false;

int calibrateBaseline() {
  long total = 0;
  for (int i = 0; i < 20; i++) {
    total += analogRead(ldrPin);
    delay(50);
  }
  return total / 20;
}

void setup() {
  pinMode(laserPin, OUTPUT);
  pinMode(buzzerPin, OUTPUT);
  pinMode(resetButton, INPUT_PULLUP);
  digitalWrite(laserPin, HIGH);
  Serial.begin(9600);

  Serial.println("Calibrating... keep the beam aligned and unobstructed.");
  baselineLight = calibrateBaseline();
  Serial.print("Baseline: ");
  Serial.println(baselineLight);
  Serial.println("Tripwire Armed!");
}

void loop() {
  if (digitalRead(resetButton) == LOW) {
    alarmLatched = false;
    noTone(buzzerPin);
    Serial.println("Alarm reset.");
    delay(300);
  }

  int lightLevel = analogRead(ldrPin);

  if (!alarmLatched && lightLevel < (baselineLight - triggerMargin)) {
    alarmLatched = true;
    Serial.println("ALARM! Beam broken!");
  }

  if (alarmLatched) {
    tone(buzzerPin, 1000);
  }

  delay(100);
}`,
  },
  {
    id: 28, emoji: "🚁", title: "Ultrasonic Radar Scanner",
    desc: "Build a scanning radar display using an ultrasonic sensor and servo.",
    difficulty: "advanced", time: "90 mins", xp: 200,
    components: ["Ultrasonic Sensor (HC-SR04)", "Servo Motor (SG90)", "Arduino Uno", "Breadboard"],
    instructions: [
      "Gather: Arduino Uno, HC-SR04 ultrasonic sensor, SG90 servo, breadboard, wires",
      "Mount the ultrasonic sensor on top of the servo horn",
      "Wire HC-SR04: Trig→pin 9, Echo→pin 10, VCC→5V, GND→GND; Servo signal→pin 6",
      "Upload the code and open Serial Monitor (or Serial Plotter) at 9600 baud",
      "The servo sweeps 0-180° printing 'angle,distance' pairs as it scans",
      "🧪 Feed the Serial output into a Processing sketch for a live radar display",
      "⚠️ Erratic readings? The optimized version's median filtering rejects echo noise",
    ],
    basicCode: `/*
  Learning Goals:
  1. Sweep a servo through a range of angles
  2. Measure distance with an ultrasonic sensor at each angle
  3. Output structured data for visualization
*/

#include <Servo.h>

Servo radarServo;
const int trigPin = 9;
const int echoPin = 10;

long readDistanceCM() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  return duration * 0.034 / 2;
}

void setup() {
  radarServo.attach(6);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.begin(9600);
}

void loop() {
  for (int angle = 0; angle <= 180; angle += 2) {
    radarServo.write(angle);
    delay(30);
    long distance = readDistanceCM();
    Serial.print(angle);
    Serial.print(",");
    Serial.println(distance);
  }

  for (int angle = 180; angle >= 0; angle -= 2) {
    radarServo.write(angle);
    delay(30);
    long distance = readDistanceCM();
    Serial.print(angle);
    Serial.print(",");
    Serial.println(distance);
  }
}`,
    optimizedCode: `// Optimized with noise-filtered readings and a max range cutoff
#include <Servo.h>

Servo radarServo;
const int trigPin = 9;
const int echoPin = 10;
const int maxRange = 200; // cm — readings beyond this are treated as "no object"

long readDistanceOnce() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 30000); // 30ms timeout ≈ 5m max
  if (duration == 0) return maxRange;
  long distance = duration * 0.034 / 2;
  return distance > maxRange ? maxRange : distance;
}

long readDistanceFiltered() {
  long a = readDistanceOnce();
  long b = readDistanceOnce();
  long c = readDistanceOnce();
  // Return the median of 3 readings to reject spikes
  return max(min(a, b), min(max(a, b), c));
}

void scanSweep(int start, int end, int step) {
  for (int angle = start; step > 0 ? angle <= end : angle >= end; angle += step) {
    radarServo.write(angle);
    delay(25);
    long distance = readDistanceFiltered();
    Serial.print(angle);
    Serial.print(",");
    Serial.println(distance);
  }
}

void setup() {
  radarServo.attach(6);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.begin(9600);
}

void loop() {
  scanSweep(0, 180, 2);
  scanSweep(180, 0, -2);
}`,
  },
  {
    id: 29, emoji: "🎵", title: "Theremin Synthesizer",
    desc: "Create a distance-based musical instrument.",
    difficulty: "advanced", time: "75 mins", xp: 175,
    components: ["Ultrasonic Sensor (HC-SR04)", "Buzzer", "Arduino Uno", "LED (Red)"],
    instructions: [
      "Gather: Arduino Uno, HC-SR04 ultrasonic sensor, buzzer, red LED, breadboard, wires",
      "Wire HC-SR04: Trig→pin 9, Echo→pin 10, VCC→5V, GND→GND",
      "Connect buzzer to pin 8, LED to pin 11 (PWM) for the optimized version",
      "Upload the code and wave your hand 0-50cm from the sensor",
      "Pitch should rise as your hand gets closer, drop as it moves away",
      "🧪 Try the smoothed version — it avoids the warbly pitch of raw readings",
      "⚠️ No sound at the far end? That's expected — distances beyond 50cm are silent by design",
    ],
    basicCode: `/*
  Learning Goals:
  1. Map ultrasonic distance readings to audio frequency
  2. Real-time sound synthesis with tone()
  3. Visual feedback with an LED
*/

const int trigPin = 9;
const int echoPin = 10;
const int buzzerPin = 8;
const int ledPin = 13;

long readDistanceCM() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 30000);
  return duration * 0.034 / 2;
}

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  long distance = readDistanceCM();

  if (distance > 0 && distance < 50) {
    int frequency = map(distance, 0, 50, 2000, 200);
    tone(buzzerPin, frequency);
    digitalWrite(ledPin, HIGH);
    Serial.print("Distance: ");
    Serial.print(distance);
    Serial.print("cm -> Freq: ");
    Serial.println(frequency);
  } else {
    noTone(buzzerPin);
    digitalWrite(ledPin, LOW);
  }

  delay(50);
}`,
    optimizedCode: `// Optimized with smoothed pitch (avoids warbling) and PWM LED brightness tied to distance
const int trigPin = 9;
const int echoPin = 10;
const int buzzerPin = 8;
const int ledPin = 11; // Must be a PWM pin for analogWrite

int smoothedDistance = 25;
const float smoothingFactor = 0.3;

long readDistanceCM() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 30000);
  if (duration == 0) return -1;
  return duration * 0.034 / 2;
}

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  long rawDistance = readDistanceCM();

  if (rawDistance > 0 && rawDistance < 50) {
    smoothedDistance = smoothedDistance + (rawDistance - smoothedDistance) * smoothingFactor;
    int frequency = map(smoothedDistance, 0, 50, 2000, 200);
    int brightness = map(smoothedDistance, 0, 50, 255, 20);

    tone(buzzerPin, frequency);
    analogWrite(ledPin, brightness);
  } else {
    noTone(buzzerPin);
    analogWrite(ledPin, 0);
  }

  delay(30);
}`,
  },
  {
    id: 30, emoji: "📟", title: "GPS Tracker",
    desc: "Build a GPS location tracker with OLED display.",
    difficulty: "advanced", time: "100 mins", xp: 220,
    components: ["GPS Module", "OLED Display (0.96\")", "Arduino Uno", "Breadboard"],
    instructions: [
      "Gather: Arduino Uno, GPS module (e.g. NEO-6M), 0.96\" OLED, breadboard, wires",
      "Wire GPS: TX→pin 4, RX→pin 3, VCC→5V, GND→GND",
      "Wire OLED: SDA→A4, SCL→A5, VCC→5V, GND→GND",
      "Install 'TinyGPS++' library, then upload the code",
      "Take the module outdoors — first fix can take 30-60 seconds",
      "🧪 The optimized version adds speed, altitude, and satellite count",
      "⚠️ No fix indoors? GPS needs a clear line of sight to the sky",
    ],
    basicCode: `/*
  Learning Goals:
  1. Parse NMEA GPS data with TinyGPS++
  2. Communicate with a GPS module via SoftwareSerial
  3. Display live coordinates on an OLED
*/

#include <SoftwareSerial.h>
#include <TinyGPS++.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

SoftwareSerial gpsSerial(4, 3); // RX, TX
TinyGPSPlus gps;
Adafruit_SSD1306 display(128, 64, &Wire, -1);

void setup() {
  Serial.begin(9600);
  gpsSerial.begin(9600);
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.setTextColor(WHITE);
}

void loop() {
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  if (gps.location.isUpdated()) {
    Serial.print("Lat: "); Serial.print(gps.location.lat(), 6);
    Serial.print(" Lng: "); Serial.println(gps.location.lng(), 6);

    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.println("GPS Tracker");
    display.setCursor(0, 20);
    display.print("Lat: "); display.println(gps.location.lat(), 6);
    display.setCursor(0, 35);
    display.print("Lng: "); display.println(gps.location.lng(), 6);
    display.display();
  }
}`,
    optimizedCode: `// Optimized with satellite count, speed, altitude, and a "searching" state
#include <SoftwareSerial.h>
#include <TinyGPS++.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

SoftwareSerial gpsSerial(4, 3);
TinyGPSPlus gps;
Adafruit_SSD1306 display(128, 64, &Wire, -1);

void setup() {
  Serial.begin(9600);
  gpsSerial.begin(9600);
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.setTextColor(WHITE);
}

void loop() {
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);

  if (!gps.location.isValid()) {
    display.println("Searching for GPS fix...");
    display.print("Satellites: ");
    display.println(gps.satellites.value());
  } else {
    display.print("Lat: "); display.println(gps.location.lat(), 6);
    display.print("Lng: "); display.println(gps.location.lng(), 6);
    display.print("Alt: "); display.print(gps.altitude.meters(), 1); display.println("m");
    display.print("Speed: "); display.print(gps.speed.kmph(), 1); display.println("km/h");
    display.print("Sats: "); display.println(gps.satellites.value());

    Serial.print("Lat: "); Serial.print(gps.location.lat(), 6);
    Serial.print(" Lng: "); Serial.print(gps.location.lng(), 6);
    Serial.print(" Speed: "); Serial.println(gps.speed.kmph());
  }

  display.display();
  delay(500);
}`,
  },
  // ── Recommendation-pool projects (Generate page / Dashboard "What Can I Make?") ──
  // These use a separate id range (101-110, 201-210, 301-308) from the catalog above.
  {
    id: 101, emoji: "💡", title: "Smart LED Mood Lamp",
    desc: "Build a responsive LED lamp that changes color based on ambient light levels using a photoresistor.",
    difficulty: "beginner", time: "30 mins", xp: 75,
    components: ["LED", "Photoresistor", "Arduino Uno", "220Ω Resistor"],
    instructions: [
      "Gather: Arduino Uno, LED, photoresistor, 220Ω resistor, breadboard, wires",
      "Wire LDR between 5V and A0, with a 220Ω resistor from A0 to GND",
      "Connect LED anode → pin 9 (PWM), cathode → GND",
      "Upload the code via Arduino IDE",
      "Dim the room — the LED should brighten smoothly as it gets darker",
      "🧪 Try the smoothed version for gentle mood-lighting transitions",
      "⚠️ LED stuck at max/min? Check the LDR wiring forms a proper voltage divider",
    ],
    basicCode: `/*
  Learning Goals:
  1. Read ambient light with a photoresistor
  2. Control LED brightness with PWM (analogWrite)
  3. Build simple ambient-reactive lighting
*/

const int ldrPin = A0;
const int ledPin = 9;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Mood Lamp Starting...");
}

void loop() {
  int lightLevel = analogRead(ldrPin);
  int brightness = map(lightLevel, 0, 1023, 255, 0); // Darker room = brighter lamp
  analogWrite(ledPin, brightness);

  Serial.print("Light: ");
  Serial.print(lightLevel);
  Serial.print(" | Brightness: ");
  Serial.println(brightness);

  delay(100);
}`,
    optimizedCode: `// Optimized with smoothed brightness transitions (no sudden jumps)
const int ldrPin = A0;
const int ledPin = 9;
float currentBrightness = 0;
const float smoothing = 0.05;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int lightLevel = analogRead(ldrPin);
  int targetBrightness = map(lightLevel, 0, 1023, 255, 0);

  currentBrightness += (targetBrightness - currentBrightness) * smoothing;
  analogWrite(ledPin, (int)currentBrightness);

  Serial.print("Light: ");
  Serial.print(lightLevel);
  Serial.print(" | Brightness: ");
  Serial.println((int)currentBrightness);

  delay(20);
}`,
  },
  {
    id: 102, emoji: "🌱", title: "Smart Plant Watering System",
    desc: "Automate plant care with a soil moisture sensor that triggers a water pump when plants need watering.",
    difficulty: "beginner", time: "45 mins", xp: 100,
    components: ["Soil Moisture Sensor", "Water Pump", "Relay Module", "Arduino Uno"],
    instructions: [
      "Gather: Arduino Uno, soil moisture sensor, relay module, water pump, tubing, breadboard, wires",
      "Wire moisture sensor: AO→A0, VCC→5V, GND→GND",
      "Wire relay: IN→pin 7, VCC→5V, GND→GND; pump wired through the relay's NO/COM terminals",
      "Power the pump from a separate supply matching its voltage rating",
      "Upload the code and insert the sensor into dry vs wet soil to find your threshold",
      "🧪 Add the cooldown version so it won't overwater on repeated dry readings",
      "⚠️ Pump not triggering? Check the relay module's trigger polarity (some are active-LOW)",
    ],
    basicCode: `/*
  Learning Goals:
  1. Read a soil moisture sensor
  2. Control a water pump through a relay
  3. Threshold-based automation
*/

const int moisturePin = A0;
const int relayPin = 7;
const int dryThreshold = 500; // Lower = wetter; calibrate for your soil/sensor

void setup() {
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, LOW); // Pump off
  Serial.begin(9600);
  Serial.println("Plant Watering Bot Ready!");
}

void loop() {
  int moisture = analogRead(moisturePin);
  Serial.print("Moisture: ");
  Serial.println(moisture);

  if (moisture > dryThreshold) {
    Serial.println("Soil is dry — watering...");
    digitalWrite(relayPin, HIGH);
    delay(3000); // Water for 3 seconds
    digitalWrite(relayPin, LOW);
  }

  delay(60000); // Check once per minute
}`,
    optimizedCode: `// Optimized with a watering cooldown and averaged sensor readings
const int moisturePin = A0;
const int relayPin = 7;
const int dryThreshold = 500;
const unsigned long cooldownPeriod = 3600000UL; // 1 hour between waterings
unsigned long lastWatered = 0;

int readAverageMoisture() {
  long total = 0;
  for (int i = 0; i < 10; i++) {
    total += analogRead(moisturePin);
    delay(10);
  }
  return total / 10;
}

void setup() {
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, LOW);
  Serial.begin(9600);
}

void loop() {
  int moisture = readAverageMoisture();
  Serial.print("Moisture: ");
  Serial.println(moisture);

  bool cooldownExpired = (millis() - lastWatered) > cooldownPeriod;

  if (moisture > dryThreshold && cooldownExpired) {
    Serial.println("Soil is dry — watering...");
    digitalWrite(relayPin, HIGH);
    delay(3000);
    digitalWrite(relayPin, LOW);
    lastWatered = millis();
  }

  delay(60000);
}`,
  },
  {
    id: 103, emoji: "🎮", title: "Joystick-Controlled LED Matrix",
    desc: "Use a joystick to draw and animate patterns on an 8x8 LED matrix display.",
    difficulty: "beginner", time: "40 mins", xp: 90,
    components: ["8x8 LED Matrix", "MAX7219", "Joystick Module", "Arduino Uno"],
    instructions: [
      "Gather: Arduino Uno, joystick module, MAX7219 8x8 LED matrix, breadboard, wires",
      "Wire joystick: VRx→A0, VRy→A1, SW→pin 2, VCC→5V, GND→GND",
      "Wire matrix: DIN→pin 11, CLK→pin 13, CS→pin 10, VCC→5V, GND→GND",
      "Install the 'LedControl' library, then upload the code",
      "Move the joystick to move the lit pixel around the grid",
      "🧪 Try the trail version — it lets you draw persistent patterns, cleared with the button",
      "⚠️ Nothing lights up? Double-check DIN/CLK/CS aren't swapped",
    ],
    basicCode: `/*
  Learning Goals:
  1. Read joystick analog + button input
  2. Drive an 8x8 LED matrix via MAX7219 (LedControl library)
  3. Map continuous input to a discrete grid position
*/

#include <LedControl.h>

LedControl lc = LedControl(11, 13, 10, 1); // DIN, CLK, CS, #devices
const int joyX = A0;
const int joyY = A1;

int posX = 4, posY = 4;

void setup() {
  lc.shutdown(0, false);
  lc.setIntensity(0, 8);
  lc.clearDisplay(0);
  Serial.begin(9600);
}

void loop() {
  int x = analogRead(joyX);
  int y = analogRead(joyY);

  lc.setLed(0, posY, posX, false); // Clear old position

  if (x < 300 && posX > 0) posX--;
  if (x > 700 && posX < 7) posX++;
  if (y < 300 && posY > 0) posY--;
  if (y > 700 && posY < 7) posY++;

  lc.setLed(0, posY, posX, true); // Draw new position
  delay(100);
}`,
    optimizedCode: `// Optimized: leaves a persistent trail so you can draw patterns
#include <LedControl.h>

LedControl lc = LedControl(11, 13, 10, 1);
const int joyX = A0;
const int joyY = A1;
const int clearButton = 2;

int posX = 4, posY = 4;
bool grid[8][8] = {false};

void setup() {
  lc.shutdown(0, false);
  lc.setIntensity(0, 8);
  lc.clearDisplay(0);
  pinMode(clearButton, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  if (digitalRead(clearButton) == LOW) {
    lc.clearDisplay(0);
    memset(grid, false, sizeof(grid));
    delay(300);
  }

  int x = analogRead(joyX);
  int y = analogRead(joyY);

  if (x < 300 && posX > 0) posX--;
  if (x > 700 && posX < 7) posX++;
  if (y < 300 && posY > 0) posY--;
  if (y > 700 && posY < 7) posY++;

  grid[posY][posX] = true;
  lc.setLed(0, posY, posX, true);
  delay(100);
}`,
  },
  {
    id: 104, emoji: "🚦", title: "Traffic Light Controller",
    desc: "Simulate a real traffic light sequence with red, yellow, and green LEDs and timed delays.",
    difficulty: "beginner", time: "20 mins", xp: 55,
    components: ["LED", "Arduino Uno", "220Ω Resistor", "Breadboard"],
    instructions: [
      "Gather: Arduino Uno, red/yellow/green LEDs, 220Ω resistor ×3, breadboard, wires",
      "Wire red→pin 8, yellow→pin 9, green→pin 10, each through a 220Ω resistor to GND",
      "Upload the code via Arduino IDE",
      "Lights should cycle Red→Green→Yellow→Red with real traffic-light timing",
      "🧪 Try the non-blocking state-machine version for cleaner, extensible timing logic",
      "⚠️ No light? Check LED polarity and resistor placement",
      "⚠️ Wrong colors lighting? Confirm each LED's pin matches its resistor's wiring",
    ],
    basicCode: `/*
  Learning Goals:
  1. Sequence three outputs with delay()
  2. Understand real-world traffic light timing
  3. State-based program flow
*/

const int redPin = 8;
const int yellowPin = 9;
const int greenPin = 10;

void setup() {
  pinMode(redPin, OUTPUT);
  pinMode(yellowPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(redPin, HIGH);
  Serial.println("RED");
  delay(4000);
  digitalWrite(redPin, LOW);

  digitalWrite(greenPin, HIGH);
  Serial.println("GREEN");
  delay(4000);
  digitalWrite(greenPin, LOW);

  digitalWrite(yellowPin, HIGH);
  Serial.println("YELLOW");
  delay(1500);
  digitalWrite(yellowPin, LOW);
}`,
    optimizedCode: `// Optimized with a non-blocking millis() state machine
const int redPin = 8;
const int yellowPin = 9;
const int greenPin = 10;

enum State { RED, GREEN, YELLOW };
State state = RED;
unsigned long previousMillis = 0;

void setPhase(State s) {
  digitalWrite(redPin, s == RED);
  digitalWrite(yellowPin, s == YELLOW);
  digitalWrite(greenPin, s == GREEN);
}

void setup() {
  pinMode(redPin, OUTPUT);
  pinMode(yellowPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  Serial.begin(9600);
  setPhase(RED);
}

void loop() {
  unsigned long now = millis();
  unsigned long duration = (state == RED) ? 4000 : (state == GREEN) ? 4000 : 1500;

  if (now - previousMillis >= duration) {
    previousMillis = now;
    if (state == RED) state = GREEN;
    else if (state == GREEN) state = YELLOW;
    else state = RED;
    setPhase(state);
    Serial.println(state == RED ? "RED" : state == GREEN ? "GREEN" : "YELLOW");
  }
}`,
  },
  {
    id: 105, emoji: "🎹", title: "Button Piano",
    desc: "Create a mini piano using push buttons mapped to musical notes on a piezo buzzer.",
    difficulty: "beginner", time: "25 mins", xp: 65,
    components: ["Push Button", "Buzzer", "Arduino Uno", "Breadboard"],
    instructions: [
      "Gather: Arduino Uno, 4× push buttons, piezo buzzer, breadboard, jumper wires",
      "Wire each button between pins 2-5 and GND — internal pull-ups handle the rest",
      "Connect buzzer positive lead to pin 8, negative lead to GND",
      "Upload the code via Arduino IDE",
      "Press each button to hear a different note (C4-F4)",
      "🧪 Add more buttons and notes to build a full octave",
      "⚠️ No sound? Confirm it's a passive (not active) buzzer",
    ],
    basicCode: `/*
  Learning Goals:
  1. Read multiple digital inputs
  2. Generate tones with tone()
  3. Map buttons to musical notes
*/

const int buttonPins[4] = {2, 3, 4, 5};
const int notes[4] = {262, 294, 330, 349}; // C4, D4, E4, F4
const int buzzerPin = 8;

void setup() {
  for (int i = 0; i < 4; i++) {
    pinMode(buttonPins[i], INPUT_PULLUP);
  }
  pinMode(buzzerPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Piano Keys Ready!");
}

void loop() {
  bool anyPressed = false;
  for (int i = 0; i < 4; i++) {
    if (digitalRead(buttonPins[i]) == LOW) {
      tone(buzzerPin, notes[i]);
      anyPressed = true;
    }
  }
  if (!anyPressed) {
    noTone(buzzerPin);
  }
}`,
    optimizedCode: `// Optimized: avoids redundant tone() calls, prints note names
const int buttonPins[4] = {2, 3, 4, 5};
const int notes[4] = {262, 294, 330, 349};
const char* noteNames[4] = {"C4", "D4", "E4", "F4"};
const int buzzerPin = 8;
int lastPlayed = -1;

void setup() {
  for (int i = 0; i < 4; i++) pinMode(buttonPins[i], INPUT_PULLUP);
  pinMode(buzzerPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int pressed = -1;
  for (int i = 0; i < 4; i++) {
    if (digitalRead(buttonPins[i]) == LOW) {
      pressed = i;
      break;
    }
  }

  if (pressed != lastPlayed) {
    if (pressed == -1) {
      noTone(buzzerPin);
    } else {
      tone(buzzerPin, notes[pressed]);
      Serial.println(noteNames[pressed]);
    }
    lastPlayed = pressed;
  }
}`,
  },
  {
    id: 106, emoji: "🌙", title: "Automatic Night Light",
    desc: "An LED that turns on automatically when ambient light drops below a threshold.",
    difficulty: "beginner", time: "20 mins", xp: 55,
    components: ["LED", "Photoresistor", "Arduino Uno", "10kΩ Resistor"],
    instructions: [
      "Gather: Arduino Uno, LED, photoresistor, 10kΩ resistor, breadboard, wires",
      "Wire LDR between 5V and A0, then a 10kΩ resistor from A0 to GND (voltage divider)",
      "Connect LED anode → pin 9 (PWM), cathode → GND",
      "Upload the code via Arduino IDE",
      "Cover the LDR to simulate darkness — the LED should turn on smoothly",
      "🧪 Adjust the thresholds in the optimized version to match your room's lighting",
      "⚠️ LED flickering at dusk? Increase the hysteresis gap between thresholds",
    ],
    basicCode: `/*
  Learning Goals:
  1. Read analog values from a photoresistor (LDR)
  2. Use a voltage divider circuit
  3. Threshold-based digital output
*/

const int ldrPin = A0;
const int ledPin = 9;
const int darkThreshold = 500; // Adjust based on your environment

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Night Light Starting...");
}

void loop() {
  int lightLevel = analogRead(ldrPin);
  Serial.print("Light Level: ");
  Serial.println(lightLevel);

  if (lightLevel < darkThreshold) {
    digitalWrite(ledPin, HIGH); // Dark — turn LED on
  } else {
    digitalWrite(ledPin, LOW);  // Bright — turn LED off
  }

  delay(200);
}`,
    optimizedCode: `// Optimized with averaging and hysteresis to prevent flicker
const int ldrPin = A0;
const int ledPin = 9;
const int onThreshold = 450;
const int offThreshold = 550; // Hysteresis gap avoids rapid on/off toggling
bool lightOn = false;

int readAverageLight() {
  long total = 0;
  for (int i = 0; i < 8; i++) {
    total += analogRead(ldrPin);
    delay(5);
  }
  return total / 8;
}

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int lightLevel = readAverageLight();

  if (!lightOn && lightLevel < onThreshold) {
    lightOn = true;
  } else if (lightOn && lightLevel > offThreshold) {
    lightOn = false;
  }

  int brightness = lightOn ? map(constrain(lightLevel, 0, onThreshold), 0, onThreshold, 255, 80) : 0;
  analogWrite(ledPin, brightness);

  Serial.print("Light: ");
  Serial.print(lightLevel);
  Serial.print(" | LED: ");
  Serial.println(lightOn ? "ON" : "OFF");
}`,
  },
  {
    id: 107, emoji: "🎲", title: "Electronic Dice",
    desc: "Press a button to roll a virtual die displayed on 7 LEDs arranged in a dice pattern.",
    difficulty: "beginner", time: "25 mins", xp: 60,
    components: ["LED", "Push Button", "Arduino Uno", "220Ω Resistor"],
    instructions: [
      "Gather: Arduino Uno, red LED, push button, 220Ω resistor, breadboard, wires",
      "Connect LED anode → 220Ω resistor → pin 9, cathode → GND",
      "Connect button between pin 2 and GND (internal pull-up handles the rest)",
      "Upload the code via Arduino IDE",
      "Press the button — the LED blinks 1-6 times to show your roll",
      "🧪 Try the rolling-animation version for a suspenseful flicker before the result",
      "⚠️ Same number every time? Confirm A0 is left floating (unconnected) for good randomSeed()",
    ],
    basicCode: `/*
  Learning Goals:
  1. Generate pseudo-random numbers with random()
  2. Debounce a push button
  3. Represent a value using LED blink counts
*/

const int buttonPin = 2;
const int ledPin = 9;

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  randomSeed(analogRead(A0));
  Serial.println("Press the button to roll the dice!");
}

void loop() {
  if (digitalRead(buttonPin) == LOW) {
    delay(50); // Simple debounce
    int roll = random(1, 7); // 1 to 6
    Serial.print("You rolled: ");
    Serial.println(roll);

    for (int i = 0; i < roll; i++) {
      digitalWrite(ledPin, HIGH);
      delay(200);
      digitalWrite(ledPin, LOW);
      delay(200);
    }

    while (digitalRead(buttonPin) == LOW) {
      // Wait for button release
    }
  }
}`,
    optimizedCode: `// Optimized with a rolling animation before the final result
const int buttonPin = 2;
const int ledPin = 9;

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  randomSeed(analogRead(A0));
}

void loop() {
  if (digitalRead(buttonPin) == LOW) {
    delay(50);

    unsigned long rollStart = millis();
    while (millis() - rollStart < 1000) {
      digitalWrite(ledPin, HIGH);
      delay(40);
      digitalWrite(ledPin, LOW);
      delay(40);
    }

    int roll = random(1, 7);
    Serial.print("You rolled: ");
    Serial.println(roll);

    delay(300);
    for (int i = 0; i < roll; i++) {
      digitalWrite(ledPin, HIGH);
      delay(250);
      digitalWrite(ledPin, LOW);
      delay(250);
    }

    while (digitalRead(buttonPin) == LOW) {
      // Wait for release
    }
  }
}`,
  },
  {
    id: 108, emoji: "⏰", title: "Countdown Timer",
    desc: "Build a countdown timer with a 7-segment display and buzzer alert.",
    difficulty: "beginner", time: "30 mins", xp: 70,
    components: ["7-Segment Display", "Buzzer", "Push Button", "Arduino Uno"],
    instructions: [
      "Gather: Arduino Uno, common-cathode 7-segment display, buzzer, push button, breadboard, wires",
      "Wire segments a-g to pins 2-8 (through current-limiting resistors if not built into your display)",
      "Connect the display's common cathode pin(s) to GND",
      "Wire button between pin 9 and GND, buzzer to pin 10",
      "Upload the code and press the button to start a 9-to-0 countdown",
      "🧪 Try the non-blocking version so the button stays responsive mid-countdown",
      "⚠️ Wrong/garbled digits? Your display may be common-anode — invert the digit patterns",
    ],
    basicCode: `/*
  Learning Goals:
  1. Drive a 7-segment display directly (no driver IC)
  2. Implement a simple countdown using delay()
  3. Trigger a buzzer alert at zero
*/

// Segments a-g mapped to pins (common cathode 7-segment display)
const int segPins[7] = {2, 3, 4, 5, 6, 7, 8}; // a,b,c,d,e,f,g
const int buttonPin = 9;
const int buzzerPin = 10;

// Segment patterns for digits 0-9 (1 = segment on)
const byte digits[10][7] = {
  {1,1,1,1,1,1,0}, // 0
  {0,1,1,0,0,0,0}, // 1
  {1,1,0,1,1,0,1}, // 2
  {1,1,1,1,0,0,1}, // 3
  {0,1,1,0,0,1,1}, // 4
  {1,0,1,1,0,1,1}, // 5
  {1,0,1,1,1,1,1}, // 6
  {1,1,1,0,0,0,0}, // 7
  {1,1,1,1,1,1,1}, // 8
  {1,1,1,1,0,1,1}, // 9
};

void displayDigit(int d) {
  for (int i = 0; i < 7; i++) {
    digitalWrite(segPins[i], digits[d][i]);
  }
}

void setup() {
  for (int i = 0; i < 7; i++) pinMode(segPins[i], OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(buzzerPin, OUTPUT);
  Serial.begin(9600);
  displayDigit(0);
}

void loop() {
  if (digitalRead(buttonPin) == LOW) {
    delay(50); // Debounce
    for (int i = 9; i >= 0; i--) {
      displayDigit(i);
      Serial.println(i);
      delay(1000);
    }
    tone(buzzerPin, 1000);
    delay(1000);
    noTone(buzzerPin);
  }
}`,
    optimizedCode: `// Optimized with a non-blocking countdown (button still responsive during the count)
const int segPins[7] = {2, 3, 4, 5, 6, 7, 8};
const int buttonPin = 9;
const int buzzerPin = 10;

const byte digits[10][7] = {
  {1,1,1,1,1,1,0}, {0,1,1,0,0,0,0}, {1,1,0,1,1,0,1}, {1,1,1,1,0,0,1}, {0,1,1,0,0,1,1},
  {1,0,1,1,0,1,1}, {1,0,1,1,1,1,1}, {1,1,1,0,0,0,0}, {1,1,1,1,1,1,1}, {1,1,1,1,0,1,1},
};

bool counting = false;
int currentCount = 0;
unsigned long lastTick = 0;

void displayDigit(int d) {
  for (int i = 0; i < 7; i++) digitalWrite(segPins[i], digits[d][i]);
}

void setup() {
  for (int i = 0; i < 7; i++) pinMode(segPins[i], OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(buzzerPin, OUTPUT);
  Serial.begin(9600);
  displayDigit(0);
}

void loop() {
  if (!counting && digitalRead(buttonPin) == LOW) {
    delay(50);
    counting = true;
    currentCount = 9;
    displayDigit(currentCount);
    lastTick = millis();
  }

  if (counting && millis() - lastTick >= 1000) {
    lastTick = millis();
    currentCount--;
    if (currentCount >= 0) {
      displayDigit(currentCount);
      Serial.println(currentCount);
    }
    if (currentCount == 0) {
      tone(buzzerPin, 1000, 1000);
      counting = false;
    }
  }
}`,
  },
  {
    id: 109, emoji: "🌈", title: "Rainbow LED Fader",
    desc: "Smoothly cycle through all rainbow colors on an RGB LED using PWM.",
    difficulty: "beginner", time: "25 mins", xp: 65,
    components: ["RGB LED", "Arduino Uno", "220Ω Resistor", "Breadboard"],
    instructions: [
      "Gather: Arduino Uno, common-cathode RGB LED, 220Ω resistor ×3, breadboard, wires",
      "Wire each color pin (R,G,B) through its own 220Ω resistor to pins 9, 10, 11",
      "Connect the LED's common cathode leg to GND",
      "Upload the code via Arduino IDE",
      "The LED should smoothly cycle through the color spectrum",
      "🧪 Try the HSV version for a more even, continuous rainbow",
      "⚠️ Colors look wrong/inverted? You may have a common-ANODE LED — wire common leg to 5V and invert PWM values",
    ],
    basicCode: `/*
  Learning Goals:
  1. Mix RGB channels with PWM (analogWrite)
  2. Smooth color transitions using loops
  3. Common-cathode RGB LED wiring
*/

const int redPin = 9;
const int greenPin = 10;
const int bluePin = 11;

void setColor(int r, int g, int b) {
  analogWrite(redPin, r);
  analogWrite(greenPin, g);
  analogWrite(bluePin, b);
}

void setup() {
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
}

void loop() {
  for (int i = 0; i <= 255; i++) {
    setColor(255 - i, i, 0);
    delay(5);
  }
  for (int i = 0; i <= 255; i++) {
    setColor(0, 255 - i, i);
    delay(5);
  }
  for (int i = 0; i <= 255; i++) {
    setColor(i, 0, 255 - i);
    delay(5);
  }
}`,
    optimizedCode: `// Optimized with HSV-to-RGB conversion for a true smooth rainbow cycle
const int redPin = 9;
const int greenPin = 10;
const int bluePin = 11;

void setColor(int r, int g, int b) {
  analogWrite(redPin, r);
  analogWrite(greenPin, g);
  analogWrite(bluePin, b);
}

void hueToRGB(int hue, int &r, int &g, int &b) {
  int region = hue / 60;
  int remainder = (hue % 60) * 255 / 60;

  switch (region) {
    case 0: r = 255; g = remainder; b = 0; break;
    case 1: r = 255 - remainder; g = 255; b = 0; break;
    case 2: r = 0; g = 255; b = remainder; break;
    case 3: r = 0; g = 255 - remainder; b = 255; break;
    case 4: r = remainder; g = 0; b = 255; break;
    default: r = 255; g = 0; b = 255 - remainder; break;
  }
}

void setup() {
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
}

void loop() {
  static int hue = 0;
  int r, g, b;
  hueToRGB(hue, r, g, b);
  setColor(r, g, b);
  hue = (hue + 1) % 360;
  delay(15);
}`,
  },
  {
    id: 110, emoji: "📢", title: "Clap Switch",
    desc: "Toggle an LED on/off by clapping, using a sound sensor module.",
    difficulty: "beginner", time: "30 mins", xp: 70,
    components: ["Sound Sensor", "LED", "Arduino Uno", "Relay Module"],
    instructions: [
      "Gather: Arduino Uno, sound sensor module (e.g. KY-038), LED, breadboard, wires",
      "Wire sound sensor: OUT→pin 2, VCC→5V, GND→GND",
      "Connect LED to pin 9 (with resistor), cathode to GND",
      "Upload the code and adjust the sensor's onboard sensitivity potentiometer",
      "Clap near the sensor — the LED should toggle on/off",
      "🧪 Try the double-clap version so accidental noise doesn't trigger it",
      "⚠️ Too sensitive or not sensitive enough? Turn the tiny blue pot on the sensor board",
    ],
    basicCode: `/*
  Learning Goals:
  1. Read a digital sound sensor
  2. Toggle state on an event (not just level)
  3. Simple edge detection
*/

const int soundPin = 2;
const int ledPin = 9;
bool ledState = false;

void setup() {
  pinMode(soundPin, INPUT);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Clap to toggle the LED!");
}

void loop() {
  if (digitalRead(soundPin) == HIGH) {
    ledState = !ledState;
    digitalWrite(ledPin, ledState);
    Serial.println(ledState ? "LED ON" : "LED OFF");
    delay(500); // Prevent one clap from triggering multiple toggles
  }
}`,
    optimizedCode: `// Optimized with double-clap detection (two claps within 600ms = toggle)
const int soundPin = 2;
const int ledPin = 9;
bool ledState = false;
unsigned long firstClapTime = 0;
bool waitingForSecondClap = false;
const unsigned long clapWindow = 600;

void setup() {
  pinMode(soundPin, INPUT);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Clap twice quickly to toggle the LED!");
}

void loop() {
  if (digitalRead(soundPin) == HIGH) {
    unsigned long now = millis();

    if (!waitingForSecondClap) {
      firstClapTime = now;
      waitingForSecondClap = true;
    } else if (now - firstClapTime < clapWindow) {
      ledState = !ledState;
      digitalWrite(ledPin, ledState);
      Serial.println(ledState ? "LED ON" : "LED OFF");
      waitingForSecondClap = false;
    }
    delay(200);
  }

  if (waitingForSecondClap && millis() - firstClapTime > clapWindow) {
    waitingForSecondClap = false;
  }
}`,
  },
  {
    id: 201, emoji: "🌡️", title: "Weather Station Dashboard",
    desc: "Monitor temperature, humidity, and pressure with sensor data displayed on an OLED screen.",
    difficulty: "intermediate", time: "60 mins", xp: 150,
    components: ["DHT22", "BMP180", "OLED Display", "Arduino Uno"],
    instructions: [
      "Gather: Arduino Uno, DHT22, BMP180, 0.96\" OLED, breadboard, wires",
      "Wire DHT22 DATA→pin 2, VCC→5V, GND→GND",
      "Wire BMP180 and OLED on the shared I2C bus: SDA→A4, SCL→A5, VCC→5V, GND→GND",
      "Install 'DHT sensor library' and 'Adafruit BMP085' libraries, then upload",
      "The OLED should show live temperature, humidity, and pressure",
      "🧪 Add the trend-arrow version to see if pressure is rising or falling",
      "⚠️ 'nan' readings? Add a 10kΩ pull-up resistor between DHT22 DATA and VCC",
    ],
    basicCode: `/*
  Learning Goals:
  1. Combine two I2C/digital sensors (DHT22 + BMP180)
  2. Display multiple readings on an OLED
  3. Organize a small sensor dashboard
*/

#include <DHT.h>
#include <Wire.h>
#include <Adafruit_BMP085.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define DHTPIN 2
DHT dht(DHTPIN, DHT22);
Adafruit_BMP085 bmp;
Adafruit_SSD1306 display(128, 64, &Wire, -1);

void setup() {
  Serial.begin(9600);
  dht.begin();
  bmp.begin();
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.setTextColor(WHITE);
}

void loop() {
  float humidity = dht.readHumidity();
  float temp = dht.readTemperature();
  float pressure = bmp.readPressure() / 100.0F;

  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("Weather Dashboard");
  display.print("Temp: "); display.print(temp); display.println(" C");
  display.print("Humidity: "); display.print(humidity); display.println(" %");
  display.print("Pressure: "); display.print(pressure); display.println(" hPa");
  display.display();

  Serial.print(temp); Serial.print(",");
  Serial.print(humidity); Serial.print(",");
  Serial.println(pressure);

  delay(2000);
}`,
    optimizedCode: `// Optimized with sensor error handling and a pressure trend indicator
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_BMP085.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define DHTPIN 2
DHT dht(DHTPIN, DHT22);
Adafruit_BMP085 bmp;
Adafruit_SSD1306 display(128, 64, &Wire, -1);
float lastPressure = 0;

void setup() {
  Serial.begin(9600);
  dht.begin();
  if (!bmp.begin()) Serial.println("BMP180 not found!");
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.setTextColor(WHITE);
}

void loop() {
  float humidity = dht.readHumidity();
  float temp = dht.readTemperature();
  float pressure = bmp.readPressure() / 100.0F;

  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("Weather Dashboard");

  if (isnan(humidity) || isnan(temp)) {
    display.println("DHT22 read error!");
  } else {
    display.print("Temp: "); display.print(temp); display.println(" C");
    display.print("Humidity: "); display.print(humidity); display.println(" %");
  }

  display.print("Pressure: "); display.print(pressure); display.print(" hPa ");
  if (lastPressure != 0) {
    display.println(pressure > lastPressure ? "^" : pressure < lastPressure ? "v" : "-");
  }
  display.display();

  lastPressure = pressure;
  delay(2000);
}`,
  },
  {
    id: 202, emoji: "🔐", title: "RFID Door Lock",
    desc: "Create a secure door lock using RFID tags and a servo motor with LCD feedback.",
    difficulty: "intermediate", time: "60 mins", xp: 140,
    components: ["RFID RC522", "Servo Motor", "LCD 16x2", "Arduino Uno"],
    instructions: [
      "Gather: Arduino Uno, MFRC522 RFID module, SG90 servo, 16x2 I2C LCD, breadboard, wires",
      "Wire RFID (SPI): SDA→10, SCK→13, MOSI→11, MISO→12, RST→9, 3.3V→3.3V, GND→GND",
      "Wire servo signal→pin 6, LCD SDA→A4/SCL→A5, both powered from 5V/GND",
      "Install 'MFRC522' and 'LiquidCrystal_I2C' libraries, then upload",
      "Scan a card, read its UID from Serial Monitor, and paste it into allowedUID[]",
      "🧪 Re-upload with your real UID(s), then test Access Granted/Denied",
      "⚠️ RFID module is 3.3V only — never connect it to 5V or you may damage it",
    ],
    basicCode: `/*
  Learning Goals:
  1. Read RFID tags with the MFRC522 module (SPI)
  2. Compare scanned tag UIDs against an allowed list
  3. Actuate a servo as a lock mechanism
*/

#include <SPI.h>
#include <MFRC522.h>
#include <Servo.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define SS_PIN 10
#define RST_PIN 9
MFRC522 rfid(SS_PIN, RST_PIN);
Servo lockServo;
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Replace with your own tag's UID (print it from Serial Monitor first)
byte allowedUID[4] = {0xDE, 0xAD, 0xBE, 0xEF};

void setup() {
  Serial.begin(9600);
  SPI.begin();
  rfid.PCD_Init();
  lockServo.attach(6);
  lockServo.write(0); // Locked position
  lcd.init();
  lcd.backlight();
  lcd.print("Scan your card");
}

bool checkUID() {
  for (byte i = 0; i < 4; i++) {
    if (rfid.uid.uidByte[i] != allowedUID[i]) return false;
  }
  return true;
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;

  Serial.print("UID: ");
  for (byte i = 0; i < rfid.uid.size; i++) {
    Serial.print(rfid.uid.uidByte[i], HEX);
    Serial.print(" ");
  }
  Serial.println();

  lcd.clear();
  if (checkUID()) {
    lcd.print("Access Granted");
    lockServo.write(90); // Unlock
    delay(3000);
    lockServo.write(0); // Re-lock
  } else {
    lcd.print("Access Denied");
    delay(1500);
  }
  lcd.clear();
  lcd.print("Scan your card");

  rfid.PICC_HaltA();
}`,
    optimizedCode: `// Optimized with multiple allowed tags and audible feedback
#include <SPI.h>
#include <MFRC522.h>
#include <Servo.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define SS_PIN 10
#define RST_PIN 9
MFRC522 rfid(SS_PIN, RST_PIN);
Servo lockServo;
LiquidCrystal_I2C lcd(0x27, 16, 2);
const int buzzerPin = 7;

const byte allowedUIDs[2][4] = {
  {0xDE, 0xAD, 0xBE, 0xEF},
  {0x12, 0x34, 0x56, 0x78},
};

bool checkUID() {
  for (int u = 0; u < 2; u++) {
    bool match = true;
    for (byte i = 0; i < 4; i++) {
      if (rfid.uid.uidByte[i] != allowedUIDs[u][i]) { match = false; break; }
    }
    if (match) return true;
  }
  return false;
}

void setup() {
  Serial.begin(9600);
  SPI.begin();
  rfid.PCD_Init();
  lockServo.attach(6);
  lockServo.write(0);
  pinMode(buzzerPin, OUTPUT);
  lcd.init();
  lcd.backlight();
  lcd.print("Scan your card");
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;

  lcd.clear();
  if (checkUID()) {
    lcd.print("Access Granted");
    tone(buzzerPin, 1500, 200);
    lockServo.write(90);
    delay(3000);
    lockServo.write(0);
  } else {
    lcd.print("Access Denied");
    tone(buzzerPin, 300, 500);
    delay(1500);
  }
  lcd.clear();
  lcd.print("Scan your card");
  rfid.PICC_HaltA();
}`,
  },
  {
    id: 203, emoji: "🤖", title: "Line-Following Robot",
    desc: "Program a robot that autonomously follows a black line using IR sensors and differential motor control.",
    difficulty: "intermediate", time: "90 mins", xp: 200,
    components: ["IR Sensors", "Motor Driver L298N", "DC Motors", "Arduino Uno"],
    instructions: [
      "Gather: Arduino Uno, 2× IR line sensors, L298N motor driver, 2× DC motors + wheels, chassis",
      "Wire both IR sensors' outputs to pins 2 and 3",
      "Wire L298N: IN1-IN4→pins 8-11, ENA/ENB→pins 5/6, motors to OUT1-OUT4",
      "Power the L298N from a separate battery pack (not through the Arduino)",
      "Upload the code and place the robot on a black line on a light surface",
      "🧪 Tune baseSpeed/turnSpeed in the optimized version for smoother tracking",
      "⚠️ Robot jerky or stalling? Check the L298N has its own adequate power supply",
    ],
    basicCode: `/*
  Learning Goals:
  1. Read IR line sensors for line detection
  2. Control 2 DC motors via L298N H-bridge
  3. Basic differential steering logic
*/

const int leftSensor = 2;
const int rightSensor = 3;

const int leftMotorIN1 = 8;
const int leftMotorIN2 = 9;
const int rightMotorIN1 = 10;
const int rightMotorIN2 = 11;

void setup() {
  pinMode(leftSensor, INPUT);
  pinMode(rightSensor, INPUT);
  pinMode(leftMotorIN1, OUTPUT);
  pinMode(leftMotorIN2, OUTPUT);
  pinMode(rightMotorIN1, OUTPUT);
  pinMode(rightMotorIN2, OUTPUT);
  Serial.begin(9600);
}

void forward() {
  digitalWrite(leftMotorIN1, HIGH); digitalWrite(leftMotorIN2, LOW);
  digitalWrite(rightMotorIN1, HIGH); digitalWrite(rightMotorIN2, LOW);
}

void turnLeft() {
  digitalWrite(leftMotorIN1, LOW); digitalWrite(leftMotorIN2, LOW);
  digitalWrite(rightMotorIN1, HIGH); digitalWrite(rightMotorIN2, LOW);
}

void turnRight() {
  digitalWrite(leftMotorIN1, HIGH); digitalWrite(leftMotorIN2, LOW);
  digitalWrite(rightMotorIN1, LOW); digitalWrite(rightMotorIN2, LOW);
}

void stopMotors() {
  digitalWrite(leftMotorIN1, LOW); digitalWrite(leftMotorIN2, LOW);
  digitalWrite(rightMotorIN1, LOW); digitalWrite(rightMotorIN2, LOW);
}

void loop() {
  bool onLineLeft = digitalRead(leftSensor);
  bool onLineRight = digitalRead(rightSensor);

  if (onLineLeft && onLineRight) {
    forward();
  } else if (onLineLeft && !onLineRight) {
    turnLeft();
  } else if (!onLineLeft && onLineRight) {
    turnRight();
  } else {
    stopMotors();
  }
}`,
    optimizedCode: `// Optimized with PWM speed control for smoother turns
const int leftSensor = 2;
const int rightSensor = 3;

const int leftMotorIN1 = 8;
const int leftMotorIN2 = 9;
const int leftEnable = 5;
const int rightMotorIN1 = 10;
const int rightMotorIN2 = 11;
const int rightEnable = 6;

const int baseSpeed = 180;
const int turnSpeed = 100;

void setup() {
  pinMode(leftSensor, INPUT);
  pinMode(rightSensor, INPUT);
  pinMode(leftMotorIN1, OUTPUT);
  pinMode(leftMotorIN2, OUTPUT);
  pinMode(rightMotorIN1, OUTPUT);
  pinMode(rightMotorIN2, OUTPUT);
  pinMode(leftEnable, OUTPUT);
  pinMode(rightEnable, OUTPUT);
  Serial.begin(9600);
}

void drive(int leftSpeed, int rightSpeed) {
  digitalWrite(leftMotorIN1, HIGH); digitalWrite(leftMotorIN2, LOW);
  digitalWrite(rightMotorIN1, HIGH); digitalWrite(rightMotorIN2, LOW);
  analogWrite(leftEnable, leftSpeed);
  analogWrite(rightEnable, rightSpeed);
}

void loop() {
  bool onLineLeft = digitalRead(leftSensor);
  bool onLineRight = digitalRead(rightSensor);

  if (onLineLeft && onLineRight) {
    drive(baseSpeed, baseSpeed);
  } else if (onLineLeft && !onLineRight) {
    drive(turnSpeed, baseSpeed);
  } else if (!onLineLeft && onLineRight) {
    drive(baseSpeed, turnSpeed);
  } else {
    drive(0, 0);
  }
}`,
  },
  {
    id: 204, emoji: "📻", title: "IR Remote Decoder",
    desc: "Capture and decode infrared signals from any TV remote control.",
    difficulty: "intermediate", time: "35 mins", xp: 85,
    components: ["IR Receiver", "Arduino Uno", "Breadboard", "Jumper Wires"],
    instructions: [
      "Gather: Arduino Uno, IR receiver module (e.g. VS1838B), breadboard, jumper wires",
      "Wire IR receiver: OUT→pin 11, VCC→5V, GND→GND",
      "Install the 'IRremote' library from Library Manager",
      "Upload the code via Arduino IDE and open Serial Monitor at 9600 baud",
      "Point any remote at the sensor and press buttons — codes print to Serial",
      "🧪 Copy the printed hex codes into handleCommand() to map real buttons",
      "⚠️ No signal? Most receivers need the flat side facing the remote",
    ],
    basicCode: `/*
  Learning Goals:
  1. Receive and decode infrared signals
  2. Use the IRremote library
  3. Map remote codes to actions
*/

#include <IRremote.hpp>

const int irPin = 11;

void setup() {
  Serial.begin(9600);
  IrReceiver.begin(irPin, ENABLE_LED_FEEDBACK);
  Serial.println("IR Receiver Ready. Point a remote and press a button.");
}

void loop() {
  if (IrReceiver.decode()) {
    Serial.print("Code received: 0x");
    Serial.println(IrReceiver.decodedIRData.decodedRawData, HEX);
    IrReceiver.resume();
  }
}`,
    optimizedCode: `// Optimized with named button mapping and repeat filtering
#include <IRremote.hpp>

const int irPin = 11;
unsigned long lastCode = 0;
unsigned long lastReceiveTime = 0;

void handleCommand(unsigned long code) {
  switch (code) {
    case 0xFF18E7: Serial.println("Button: UP"); break;
    case 0xFF4AB5: Serial.println("Button: DOWN"); break;
    case 0xFF10EF: Serial.println("Button: LEFT"); break;
    case 0xFF5AA5: Serial.println("Button: RIGHT"); break;
    case 0xFF38C7: Serial.println("Button: OK"); break;
    default:
      Serial.print("Unknown code: 0x");
      Serial.println(code, HEX);
  }
}

void setup() {
  Serial.begin(9600);
  IrReceiver.begin(irPin, ENABLE_LED_FEEDBACK);
}

void loop() {
  if (IrReceiver.decode()) {
    unsigned long code = IrReceiver.decodedIRData.decodedRawData;
    if (code != 0 && millis() - lastReceiveTime > 200) {
      handleCommand(code);
      lastCode = code;
      lastReceiveTime = millis();
    }
    IrReceiver.resume();
  }
}`,
  },
  {
    id: 205, emoji: "⏱️", title: "Reaction Time Game",
    desc: "Test your reflexes — press the button as fast as possible when the LED lights up.",
    difficulty: "intermediate", time: "40 mins", xp: 90,
    components: ["LED", "Push Button", "LCD 16x2", "Arduino Uno"],
    instructions: [
      "Gather: Arduino Uno, 16x2 I2C LCD, red LED, push button, breadboard, wires",
      "Wire LCD: SDA→A4, SCL→A5, VCC→5V, GND→GND",
      "Connect LED to pin 9 (with resistor), button between pin 8 and GND",
      "Upload the code via Arduino IDE",
      "Wait for 'GO!', then press the button as fast as you can",
      "🧪 The optimized version tracks your best time and flags false starts",
      "⚠️ LCD showing boxes? Adjust the contrast pot on the I2C backpack",
    ],
    basicCode: `/*
  Learning Goals:
  1. Use an I2C 16x2 LCD
  2. Measure elapsed time with millis()
  3. Random delays with random()
*/

#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
const int ledPin = 9;
const int buttonPin = 8;

void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);
  lcd.init();
  lcd.backlight();
  lcd.print("Reaction Timer");
  Serial.begin(9600);
  randomSeed(analogRead(A0));
  delay(1500);
}

void loop() {
  lcd.clear();
  lcd.print("Get Ready...");
  digitalWrite(ledPin, LOW);
  delay(random(2000, 5000));

  lcd.clear();
  lcd.print("GO!");
  digitalWrite(ledPin, HIGH);
  unsigned long startTime = millis();

  while (digitalRead(buttonPin) == HIGH) {
    // Wait for button press
  }

  unsigned long reactionTime = millis() - startTime;
  digitalWrite(ledPin, LOW);

  lcd.clear();
  lcd.print("Time: ");
  lcd.print(reactionTime);
  lcd.print("ms");
  Serial.print("Reaction time: ");
  Serial.println(reactionTime);

  delay(3000);
}`,
    optimizedCode: `// Optimized with false-start detection and best-score tracking
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
const int ledPin = 9;
const int buttonPin = 8;
unsigned long bestTime = 999999;

void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);
  lcd.init();
  lcd.backlight();
  Serial.begin(9600);
  randomSeed(analogRead(A0));
}

void loop() {
  lcd.clear();
  lcd.print("Get Ready...");
  digitalWrite(ledPin, LOW);
  unsigned long waitTime = random(2000, 5000);
  unsigned long waitStart = millis();

  while (millis() - waitStart < waitTime) {
    if (digitalRead(buttonPin) == LOW) {
      lcd.clear();
      lcd.print("Too Soon!");
      delay(2000);
      return;
    }
  }

  lcd.clear();
  lcd.print("GO!");
  digitalWrite(ledPin, HIGH);
  unsigned long startTime = millis();

  while (digitalRead(buttonPin) == HIGH) {
    // Wait for button press
  }

  unsigned long reactionTime = millis() - startTime;
  digitalWrite(ledPin, LOW);
  if (reactionTime < bestTime) bestTime = reactionTime;

  lcd.setCursor(0, 0);
  lcd.print("Time: ");
  lcd.print(reactionTime);
  lcd.print("ms");
  lcd.setCursor(0, 1);
  lcd.print("Best: ");
  lcd.print(bestTime);
  lcd.print("ms");

  delay(3000);
}`,
  },
  {
    id: 206, emoji: "🧭", title: "Digital Compass",
    desc: "Build a compass using an I2C magnetometer and display heading on an OLED.",
    difficulty: "intermediate", time: "50 mins", xp: 110,
    components: ["HMC5883L", "OLED Display", "Arduino Uno", "Breadboard"],
    instructions: [
      "Gather: Arduino Uno, HMC5883L magnetometer, 0.96\" OLED, breadboard, wires",
      "Wire both I2C devices: SDA→A4, SCL→A5, VCC→5V, GND→GND (shared bus)",
      "Upload the code via Arduino IDE",
      "Rotate the sensor flat and level — the heading should update in real time",
      "🧪 Run the calibration routine in the optimized version for better accuracy",
      "⚠️ Heading jumps around? Keep the sensor away from motors, speakers, and metal",
      "⚠️ Nothing on I2C? Run an I2C scanner sketch to confirm the sensor's address",
    ],
    basicCode: `/*
  Learning Goals:
  1. I2C communication with a magnetometer (HMC5883L)
  2. Convert raw magnetic field readings to a heading angle
  3. Display real-time data on an OLED
*/

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);
#define HMC5883L_ADDR 0x1E

void setup() {
  Serial.begin(9600);
  Wire.begin();
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();

  Wire.beginTransmission(HMC5883L_ADDR);
  Wire.write(0x02);
  Wire.write(0x00);
  Wire.endTransmission();
}

void loop() {
  int16_t x, y, z;
  Wire.beginTransmission(HMC5883L_ADDR);
  Wire.write(0x03);
  Wire.endTransmission();
  Wire.requestFrom(HMC5883L_ADDR, 6);

  if (Wire.available() >= 6) {
    x = Wire.read() << 8 | Wire.read();
    z = Wire.read() << 8 | Wire.read();
    y = Wire.read() << 8 | Wire.read();

    float heading = atan2(y, x);
    if (heading < 0) heading += 2 * PI;
    float headingDeg = heading * 180 / PI;

    Serial.print("Heading: ");
    Serial.println(headingDeg);

    display.clearDisplay();
    display.setTextSize(2);
    display.setTextColor(WHITE);
    display.setCursor(0, 20);
    display.print(headingDeg, 0);
    display.println(" deg");
    display.display();
  }

  delay(200);
}`,
    optimizedCode: `// Optimized with calibration offsets and cardinal direction labels
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);
#define HMC5883L_ADDR 0x1E

float xOffset = 0, yOffset = 0;

const char* directionFromHeading(float deg) {
  const char* dirs[] = {"N", "NE", "E", "SE", "S", "SW", "W", "NW"};
  int index = (int)((deg + 22.5) / 45) % 8;
  return dirs[index];
}

void setup() {
  Serial.begin(9600);
  Wire.begin();
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);

  Wire.beginTransmission(HMC5883L_ADDR);
  Wire.write(0x02);
  Wire.write(0x00);
  Wire.endTransmission();
}

void loop() {
  int16_t x, y, z;
  Wire.beginTransmission(HMC5883L_ADDR);
  Wire.write(0x03);
  Wire.endTransmission();
  Wire.requestFrom(HMC5883L_ADDR, 6);

  if (Wire.available() >= 6) {
    x = Wire.read() << 8 | Wire.read();
    z = Wire.read() << 8 | Wire.read();
    y = Wire.read() << 8 | Wire.read();

    float heading = atan2(y - yOffset, x - xOffset);
    if (heading < 0) heading += 2 * PI;
    float headingDeg = heading * 180 / PI;

    display.clearDisplay();
    display.setTextSize(2);
    display.setTextColor(WHITE);
    display.setCursor(0, 10);
    display.print(headingDeg, 0);
    display.println(" deg");
    display.setTextSize(3);
    display.setCursor(30, 35);
    display.println(directionFromHeading(headingDeg));
    display.display();

    Serial.print(headingDeg);
    Serial.print(" deg - ");
    Serial.println(directionFromHeading(headingDeg));
  }

  delay(200);
}`,
  },
  {
    id: 207, emoji: "🎯", title: "Laser Tripwire Alarm",
    desc: "Create a security beam — when the laser is broken, an alarm buzzer sounds.",
    difficulty: "intermediate", time: "45 mins", xp: 100,
    components: ["Laser Module", "Photoresistor", "Buzzer", "Arduino Uno"],
    instructions: [
      "Gather: Arduino Uno, laser module, photoresistor (LDR), buzzer, breadboard, wires",
      "Mount the laser and LDR facing each other across the 'tripwire' gap",
      "Wire laser→pin 8, LDR between 5V and A0 (with a 10kΩ pull-down to GND), buzzer→pin 9",
      "Upload the code and let it calibrate against the unobstructed beam",
      "Walk through the beam — the buzzer should sound and stay latched",
      "🧪 Add a reset button so the optimized version's alarm needs a manual clear",
      "⚠️ False alarms? Re-run calibration after finalizing the laser/LDR alignment",
    ],
    basicCode: `/*
  Learning Goals:
  1. Detect a laser beam interruption using an LDR
  2. Threshold-based event triggering
  3. Basic security system logic
*/

const int laserPin = 8;
const int ldrPin = A0;
const int buzzerPin = 9;
const int threshold = 500;

void setup() {
  pinMode(laserPin, OUTPUT);
  pinMode(buzzerPin, OUTPUT);
  digitalWrite(laserPin, HIGH);
  Serial.begin(9600);
  Serial.println("Tripwire Armed!");
}

void loop() {
  int lightLevel = analogRead(ldrPin);
  Serial.println(lightLevel);

  if (lightLevel < threshold) {
    tone(buzzerPin, 1000);
    Serial.println("ALARM! Beam broken!");
  } else {
    noTone(buzzerPin);
  }

  delay(100);
}`,
    optimizedCode: `// Optimized with an auto-calibration step and a latching alarm
const int laserPin = 8;
const int ldrPin = A0;
const int buzzerPin = 9;
const int resetButton = 2;

int baselineLight = 0;
int triggerMargin = 150;
bool alarmLatched = false;

int calibrateBaseline() {
  long total = 0;
  for (int i = 0; i < 20; i++) {
    total += analogRead(ldrPin);
    delay(50);
  }
  return total / 20;
}

void setup() {
  pinMode(laserPin, OUTPUT);
  pinMode(buzzerPin, OUTPUT);
  pinMode(resetButton, INPUT_PULLUP);
  digitalWrite(laserPin, HIGH);
  Serial.begin(9600);

  baselineLight = calibrateBaseline();
  Serial.print("Baseline: ");
  Serial.println(baselineLight);
  Serial.println("Tripwire Armed!");
}

void loop() {
  if (digitalRead(resetButton) == LOW) {
    alarmLatched = false;
    noTone(buzzerPin);
    Serial.println("Alarm reset.");
    delay(300);
  }

  int lightLevel = analogRead(ldrPin);

  if (!alarmLatched && lightLevel < (baselineLight - triggerMargin)) {
    alarmLatched = true;
    Serial.println("ALARM! Beam broken!");
  }

  if (alarmLatched) {
    tone(buzzerPin, 1000);
  }

  delay(100);
}`,
  },
  {
    id: 208, emoji: "📊", title: "Data Logger to SD Card",
    desc: "Log sensor readings to an SD card with timestamps for offline analysis.",
    difficulty: "intermediate", time: "55 mins", xp: 120,
    components: ["SD Card Module", "DHT11", "Arduino Uno", "Breadboard"],
    instructions: [
      "Gather: Arduino Uno, DHT11 sensor, SD card module, SD card, breadboard, wires",
      "Wire DHT11: DATA→pin 2, VCC→5V, GND→GND",
      "Wire SD module: CS→pin 10, MOSI→11, MISO→12, SCK→13, VCC→5V, GND→GND",
      "Install 'DHT sensor library' and 'SD' library, then upload",
      "Data logs to log.csv every 5 seconds — pull the card to review it",
      "🧪 Add the header-row version so your CSV opens cleanly in a spreadsheet",
      "⚠️ 'SD card init failed'? Reformat the card as FAT16/FAT32",
    ],
    basicCode: `/*
  Learning Goals:
  1. Read a DHT11 temperature/humidity sensor
  2. Log timestamped data to an SD card
  3. Basic file I/O with the SD library
*/

#include <DHT.h>
#include <SPI.h>
#include <SD.h>

#define DHTPIN 2
DHT dht(DHTPIN, DHT11);
const int chipSelect = 10;

void setup() {
  Serial.begin(9600);
  dht.begin();

  if (!SD.begin(chipSelect)) {
    Serial.println("SD card init failed!");
    while (1);
  }
  Serial.println("Data Logger Ready!");
}

void loop() {
  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();

  Serial.print("Temp: "); Serial.print(temp);
  Serial.print(" Humidity: "); Serial.println(humidity);

  File dataFile = SD.open("log.csv", FILE_WRITE);
  if (dataFile) {
    dataFile.print(millis());
    dataFile.print(",");
    dataFile.print(temp);
    dataFile.print(",");
    dataFile.println(humidity);
    dataFile.close();
  }

  delay(5000);
}`,
    optimizedCode: `// Optimized: writes a CSV header once and skips invalid sensor readings
#include <DHT.h>
#include <SPI.h>
#include <SD.h>

#define DHTPIN 2
DHT dht(DHTPIN, DHT11);
const int chipSelect = 10;

void setup() {
  Serial.begin(9600);
  dht.begin();

  if (!SD.begin(chipSelect)) {
    Serial.println("SD card init failed!");
    while (1);
  }

  if (!SD.exists("log.csv")) {
    File dataFile = SD.open("log.csv", FILE_WRITE);
    if (dataFile) {
      dataFile.println("timestamp_ms,temp_C,humidity_pct");
      dataFile.close();
    }
  }
  Serial.println("Data Logger Ready!");
}

void loop() {
  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(temp) || isnan(humidity)) {
    Serial.println("Sensor read failed, skipping.");
    delay(5000);
    return;
  }

  String row = String(millis()) + "," + String(temp) + "," + String(humidity);
  Serial.println(row);

  File dataFile = SD.open("log.csv", FILE_WRITE);
  if (dataFile) {
    dataFile.println(row);
    dataFile.close();
  } else {
    Serial.println("Warning: could not write to SD card.");
  }

  delay(5000);
}`,
  },
  {
    id: 209, emoji: "🔔", title: "Motion Detection Alarm",
    desc: "Detect movement with a PIR sensor and trigger a buzzer and LED alert.",
    difficulty: "intermediate", time: "40 mins", xp: 95,
    components: ["PIR Sensor", "Buzzer", "LED", "Arduino Uno"],
    instructions: [
      "Gather: Arduino Uno, PIR motion sensor, buzzer, red LED, breadboard, wires",
      "Wire PIR: OUT→pin 2, VCC→5V, GND→GND",
      "Connect buzzer to pin 8, LED to pin 9 (with resistor)",
      "Upload the code — wait the full 30s warm-up before testing (PIR sensors need this)",
      "Walk in front of the sensor — buzzer and LED should activate",
      "🧪 Send 'd'/'a' over Serial to disarm/arm in the optimized version",
      "⚠️ False triggers? Keep the PIR away from heaters, windows, and direct sunlight",
    ],
    basicCode: `/*
  Learning Goals:
  1. Read a PIR motion sensor
  2. Trigger multiple outputs (buzzer + LED) on an event
  3. Handle sensor warm-up time
*/

const int pirPin = 2;
const int buzzerPin = 8;
const int ledPin = 9;

void setup() {
  pinMode(pirPin, INPUT);
  pinMode(buzzerPin, OUTPUT);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("PIR warming up...");
  delay(30000);
  Serial.println("Motion Alarm Armed!");
}

void loop() {
  if (digitalRead(pirPin) == HIGH) {
    Serial.println("Motion detected!");
    digitalWrite(ledPin, HIGH);
    tone(buzzerPin, 1000);
    delay(2000);
    digitalWrite(ledPin, LOW);
    noTone(buzzerPin);
  }
}`,
    optimizedCode: `// Optimized with a non-blocking alarm and Serial arm/disarm control
const int pirPin = 2;
const int buzzerPin = 8;
const int ledPin = 9;

bool armed = true;
bool alarmActive = false;
unsigned long alarmStart = 0;
const unsigned long alarmDuration = 2000;

void setup() {
  pinMode(pirPin, INPUT);
  pinMode(buzzerPin, OUTPUT);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("PIR warming up...");
  delay(30000);
  Serial.println("Motion Alarm Armed! Send 'd' to disarm, 'a' to arm.");
}

void loop() {
  if (Serial.available()) {
    char cmd = Serial.read();
    if (cmd == 'd') { armed = false; Serial.println("Disarmed"); }
    if (cmd == 'a') { armed = true; Serial.println("Armed"); }
  }

  if (armed && !alarmActive && digitalRead(pirPin) == HIGH) {
    Serial.println("Motion detected!");
    alarmActive = true;
    alarmStart = millis();
    digitalWrite(ledPin, HIGH);
    tone(buzzerPin, 1000);
  }

  if (alarmActive && millis() - alarmStart >= alarmDuration) {
    digitalWrite(ledPin, LOW);
    noTone(buzzerPin);
    alarmActive = false;
  }
}`,
  },
  {
    id: 210, emoji: "🖥️", title: "Serial LCD Menu System",
    desc: "Build a navigable menu system on an LCD using rotary encoder input.",
    difficulty: "intermediate", time: "50 mins", xp: 105,
    components: ["LCD 16x2", "Rotary Encoder", "Arduino Uno", "Breadboard"],
    instructions: [
      "Gather: Arduino Uno, 16x2 I2C LCD, rotary encoder module (e.g. KY-040), breadboard, wires",
      "Wire encoder: CLK→pin 2, DT→pin 3, SW→pin 4, +→5V, GND→GND",
      "Wire LCD: SDA→A4, SCL→A5, VCC→5V, GND→GND",
      "Install 'LiquidCrystal_I2C' library, then upload the code",
      "Turn the encoder to scroll the menu, press it to select",
      "🧪 Try the scrolling two-line version for menus longer than 4 items",
      "⚠️ Menu skips items erratically? Add a small delay/debounce between reads",
    ],
    basicCode: `/*
  Learning Goals:
  1. Read a rotary encoder's rotation direction
  2. Build a scrollable menu on an LCD
  3. Use encoder click to "select" a menu item
*/

#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
const int clkPin = 2;
const int dtPin = 3;
const int swPin = 4;

const char* menuItems[4] = {"Start Project", "Settings", "About", "Exit"};
int menuIndex = 0;
int lastClkState;

void setup() {
  pinMode(clkPin, INPUT);
  pinMode(dtPin, INPUT);
  pinMode(swPin, INPUT_PULLUP);
  lcd.init();
  lcd.backlight();
  lastClkState = digitalRead(clkPin);
  showMenu();
  Serial.begin(9600);
}

void showMenu() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("> ");
  lcd.print(menuItems[menuIndex]);
}

void loop() {
  int clkState = digitalRead(clkPin);
  if (clkState != lastClkState) {
    if (digitalRead(dtPin) != clkState) {
      menuIndex = (menuIndex + 1) % 4;
    } else {
      menuIndex = (menuIndex - 1 + 4) % 4;
    }
    showMenu();
  }
  lastClkState = clkState;

  if (digitalRead(swPin) == LOW) {
    lcd.setCursor(0, 1);
    lcd.print("Selected!       ");
    Serial.println(menuItems[menuIndex]);
    delay(300);
  }
}`,
    optimizedCode: `// Optimized with debouncing and a scrolling two-line window
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
const int clkPin = 2;
const int dtPin = 3;
const int swPin = 4;

const char* menuItems[6] = {"Start Project", "Settings", "About", "WiFi Setup", "Brightness", "Exit"};
const int menuCount = 6;
int menuIndex = 0;
int lastClkState;
unsigned long lastMove = 0;

void showMenu() {
  lcd.clear();
  for (int row = 0; row < 2; row++) {
    int itemIdx = (menuIndex + row) % menuCount;
    lcd.setCursor(0, row);
    lcd.print(row == 0 ? "> " : "  ");
    lcd.print(menuItems[itemIdx]);
  }
}

void setup() {
  pinMode(clkPin, INPUT);
  pinMode(dtPin, INPUT);
  pinMode(swPin, INPUT_PULLUP);
  lcd.init();
  lcd.backlight();
  lastClkState = digitalRead(clkPin);
  showMenu();
  Serial.begin(9600);
}

void loop() {
  int clkState = digitalRead(clkPin);
  if (clkState != lastClkState && millis() - lastMove > 5) {
    if (digitalRead(dtPin) != clkState) {
      menuIndex = (menuIndex + 1) % menuCount;
    } else {
      menuIndex = (menuIndex - 1 + menuCount) % menuCount;
    }
    showMenu();
    lastMove = millis();
  }
  lastClkState = clkState;

  if (digitalRead(swPin) == LOW) {
    Serial.print("Selected: ");
    Serial.println(menuItems[menuIndex]);
    delay(300);
  }
}`,
  },
  {
    id: 301, emoji: "🔊", title: "Theremin Music Synthesizer",
    desc: "Build a touchless instrument using ultrasonic distance to generate musical tones.",
    difficulty: "advanced", time: "75 mins", xp: 175,
    components: ["HC-SR04", "Piezo Buzzer", "Arduino Uno", "LED Strip"],
    instructions: [
      "Gather: Arduino Uno, HC-SR04 ultrasonic sensor, buzzer, LED (or strip), breadboard, wires",
      "Wire HC-SR04: Trig→pin 9, Echo→pin 10, VCC→5V, GND→GND",
      "Connect buzzer to pin 8, LED to pin 11 (PWM) for the optimized version",
      "Upload the code and wave your hand 0-50cm from the sensor",
      "Pitch should rise as your hand gets closer, drop as it moves away",
      "🧪 Try the smoothed version — it avoids the warbly pitch of raw readings",
      "⚠️ No sound at the far end? That's expected — distances beyond 50cm are silent by design",
    ],
    basicCode: `/*
  Learning Goals:
  1. Map ultrasonic distance readings to audio frequency
  2. Real-time sound synthesis with tone()
  3. Visual feedback with an LED
*/

const int trigPin = 9;
const int echoPin = 10;
const int buzzerPin = 8;
const int ledPin = 13;

long readDistanceCM() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 30000);
  return duration * 0.034 / 2;
}

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  long distance = readDistanceCM();

  if (distance > 0 && distance < 50) {
    int frequency = map(distance, 0, 50, 2000, 200);
    tone(buzzerPin, frequency);
    digitalWrite(ledPin, HIGH);
    Serial.print("Distance: ");
    Serial.print(distance);
    Serial.print("cm -> Freq: ");
    Serial.println(frequency);
  } else {
    noTone(buzzerPin);
    digitalWrite(ledPin, LOW);
  }

  delay(50);
}`,
    optimizedCode: `// Optimized with smoothed pitch (avoids warbling) and PWM LED brightness tied to distance
const int trigPin = 9;
const int echoPin = 10;
const int buzzerPin = 8;
const int ledPin = 11;

int smoothedDistance = 25;
const float smoothingFactor = 0.3;

long readDistanceCM() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 30000);
  if (duration == 0) return -1;
  return duration * 0.034 / 2;
}

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  long rawDistance = readDistanceCM();

  if (rawDistance > 0 && rawDistance < 50) {
    smoothedDistance = smoothedDistance + (rawDistance - smoothedDistance) * smoothingFactor;
    int frequency = map(smoothedDistance, 0, 50, 2000, 200);
    int brightness = map(smoothedDistance, 0, 50, 255, 20);

    tone(buzzerPin, frequency);
    analogWrite(ledPin, brightness);
  } else {
    noTone(buzzerPin);
    analogWrite(ledPin, 0);
  }

  delay(30);
}`,
  },
  {
    id: 302, emoji: "📡", title: "Wireless Sensor Network",
    desc: "Build a multi-node sensor network using NRF24L01 radio modules.",
    difficulty: "advanced", time: "120 mins", xp: 250,
    components: ["NRF24L01", "DHT11", "Arduino Nano", "OLED Display"],
    instructions: [
      "Gather: 2× Arduino Nano, 2× NRF24L01 modules, DHT11, 0.96\" OLED, breadboard, wires",
      "Wire both NRF24L01s identically: CE→9, CSN→10, SCK/MOSI/MISO→SPI pins, VCC→3.3V (NOT 5V), GND→GND",
      "On the sensor node: wire DHT11 DATA→pin 2",
      "On the base station: wire OLED SDA→A4, SCL→A5",
      "Install the 'RF24' library, then flash each sketch to its matching board",
      "🧪 Power both nodes and watch live readings appear on the base station's OLED",
      "⚠️ No signal? NRF24L01 needs a stable 3.3V supply — a decoupling capacitor across VCC/GND often fixes dropouts",
    ],
    basicCode: `/*
  Learning Goals:
  1. Wireless communication between Arduino boards using NRF24L01
  2. Structuring sensor data into a packet
  3. This is the SENSOR NODE — flash this to your remote/transmitting board
*/

#include <SPI.h>
#include <RF24.h>
#include <DHT.h>

RF24 radio(9, 10); // CE, CSN
const byte address[6] = "00001";

#define DHTPIN 2
DHT dht(DHTPIN, DHT11);

struct SensorData {
  float temperature;
  float humidity;
};

void setup() {
  Serial.begin(9600);
  dht.begin();
  radio.begin();
  radio.openWritingPipe(address);
  radio.setPALevel(RF24_PA_LOW);
  radio.stopListening();
}

void loop() {
  SensorData data;
  data.temperature = dht.readTemperature();
  data.humidity = dht.readHumidity();

  radio.write(&data, sizeof(data));

  Serial.print("Sent - Temp: ");
  Serial.print(data.temperature);
  Serial.print(" Humidity: ");
  Serial.println(data.humidity);

  delay(2000);
}`,
    optimizedCode: `// This is the BASE STATION — flash this to the board with the OLED
// Optimized with a "last seen" timeout so you know if a node goes offline
#include <SPI.h>
#include <RF24.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

RF24 radio(9, 10);
const byte address[6] = "00001";
Adafruit_SSD1306 display(128, 64, &Wire, -1);

struct SensorData {
  float temperature;
  float humidity;
};

unsigned long lastReceived = 0;
SensorData latestData = {0, 0};

void setup() {
  Serial.begin(9600);
  radio.begin();
  radio.openReadingPipe(0, address);
  radio.setPALevel(RF24_PA_LOW);
  radio.startListening();
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.setTextColor(WHITE);
}

void loop() {
  if (radio.available()) {
    radio.read(&latestData, sizeof(latestData));
    lastReceived = millis();
  }

  bool nodeOnline = (millis() - lastReceived) < 10000;

  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("Sensor Network");
  if (nodeOnline) {
    display.print("Temp: "); display.print(latestData.temperature); display.println(" C");
    display.print("Humidity: "); display.print(latestData.humidity); display.println(" %");
  } else {
    display.println("Node offline!");
  }
  display.display();
}`,
  },
  {
    id: 303, emoji: "🏠", title: "Smart Home Controller",
    desc: "Control lights and fans via WiFi using an ESP8266 shield and a web interface.",
    difficulty: "advanced", time: "100 mins", xp: 220,
    components: ["ESP8266", "Relay Module", "LED", "Arduino Uno"],
    instructions: [
      "Gather: ESP8266 module (e.g. NodeMCU), relay module, LED, breadboard, jumper wires",
      "This sketch runs directly on the ESP8266 — select 'NodeMCU 1.0' as your board",
      "Wire relay IN→D1, LED→D2 (with resistor), VCC/GND to the ESP8266's 3.3V/GND",
      "Set your WiFi ssid/password at the top of the sketch, then upload",
      "Open Serial Monitor to find the ESP8266's IP address once connected",
      "🧪 Visit the printed IP in a browser to control the relay and LED remotely",
      "⚠️ Won't connect? ESP8266 only supports 2.4GHz WiFi networks",
    ],
    basicCode: `/*
  Learning Goals:
  1. Run a simple WiFi web server on ESP8266
  2. Control a relay and LED remotely via HTTP
  3. Basic home automation concepts

  Note: This sketch runs directly on the ESP8266 module
  (select "Generic ESP8266" or "NodeMCU" as your board).
*/

#include <ESP8266WiFi.h>

const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

const int relayPin = 5;
const int ledPin = 4;

WiFiServer server(80);

void setup() {
  Serial.begin(9600);
  pinMode(relayPin, OUTPUT);
  pinMode(ledPin, OUTPUT);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected! IP address: ");
  Serial.println(WiFi.localIP());
  server.begin();
}

void loop() {
  WiFiClient client = server.available();
  if (!client) return;

  String request = client.readStringUntil('\\r');
  client.flush();

  if (request.indexOf("/relay/on") != -1) digitalWrite(relayPin, HIGH);
  if (request.indexOf("/relay/off") != -1) digitalWrite(relayPin, LOW);
  if (request.indexOf("/led/on") != -1) digitalWrite(ledPin, HIGH);
  if (request.indexOf("/led/off") != -1) digitalWrite(ledPin, LOW);

  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/plain");
  client.println();
  client.println("OK");
  client.stop();
}`,
    optimizedCode: `// Optimized: serves an HTML control page instead of raw text responses
#include <ESP8266WiFi.h>

const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

const int relayPin = 5;
const int ledPin = 4;
bool relayState = false;
bool ledState = false;

WiFiServer server(80);

void handleRequest(String request) {
  if (request.indexOf("/relay/on") != -1) { relayState = true; digitalWrite(relayPin, HIGH); }
  if (request.indexOf("/relay/off") != -1) { relayState = false; digitalWrite(relayPin, LOW); }
  if (request.indexOf("/led/on") != -1) { ledState = true; digitalWrite(ledPin, HIGH); }
  if (request.indexOf("/led/off") != -1) { ledState = false; digitalWrite(ledPin, LOW); }
}

void setup() {
  Serial.begin(9600);
  pinMode(relayPin, OUTPUT);
  pinMode(ledPin, OUTPUT);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  Serial.println(WiFi.localIP());
  server.begin();
}

void loop() {
  WiFiClient client = server.available();
  if (!client) return;

  String request = client.readStringUntil('\\r');
  client.flush();
  handleRequest(request);

  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/html");
  client.println();
  client.println("<html><body style='font-family:sans-serif'>");
  client.println("<h2>Smart Home Hub</h2>");
  client.print("<p>Relay: "); client.print(relayState ? "ON" : "OFF"); client.println("</p>");
  client.println("<a href='/relay/on'><button>Relay ON</button></a> ");
  client.println("<a href='/relay/off'><button>Relay OFF</button></a><br><br>");
  client.print("<p>LED: "); client.print(ledState ? "ON" : "OFF"); client.println("</p>");
  client.println("<a href='/led/on'><button>LED ON</button></a> ");
  client.println("<a href='/led/off'><button>LED OFF</button></a>");
  client.println("</body></html>");
  client.stop();
}`,
  },
  {
    id: 304, emoji: "🦾", title: "Robotic Arm with Inverse Kinematics",
    desc: "Control a multi-servo robotic arm with calculated joint angles for precise positioning.",
    difficulty: "advanced", time: "130 mins", xp: 260,
    components: ["Servo Motor", "Joystick Module", "Arduino Mega", "Breadboard"],
    instructions: [
      "Gather: Arduino Mega, 4× SG90 servos, 2× joystick modules, push button, breadboard, wires",
      "Wire servos: base→3, shoulder→5, elbow→6, gripper→9",
      "Wire the primary joystick VRx→A0, VRy→A1; a second joystick/pot for base→A2",
      "Wire the gripper button to pin 22 (Mega has plenty of extra digital pins)",
      "Upload the code — move the joystick to drive the arm's calculated reach position",
      "🧪 Try the smoothed + base-rotation version for full 3D reach",
      "⚠️ Arm reaching wrong spots? Re-measure your actual servo arm lengths and update upperArmLength/foreArmLength",
    ],
    basicCode: `/*
  Learning Goals:
  1. Basic 2-link inverse kinematics (trig-based)
  2. Convert a joystick's X/Y target into joint angles
  3. Coordinate multiple servos from calculated angles
*/

#include <Servo.h>

Servo baseServo, shoulderServo, elbowServo, gripperServo;

const int joyX = A0;
const int joyY = A1;
const int gripperButton = 22;

const float upperArmLength = 10.0; // cm
const float foreArmLength = 10.0;  // cm

void setup() {
  baseServo.attach(3);
  shoulderServo.attach(5);
  elbowServo.attach(6);
  gripperServo.attach(9);
  pinMode(gripperButton, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  float targetX = map(analogRead(joyX), 0, 1023, -10, 10);
  float targetY = map(analogRead(joyY), 0, 1023, 5, 20);

  float dist = sqrt(targetX * targetX + targetY * targetY);
  dist = constrain(dist, 0.1, upperArmLength + foreArmLength - 0.1);

  float cosElbow = (dist * dist - upperArmLength * upperArmLength - foreArmLength * foreArmLength)
                    / (2 * upperArmLength * foreArmLength);
  float elbowAngle = acos(constrain(cosElbow, -1, 1)) * 180 / PI;

  float shoulderAngle = (atan2(targetY, targetX) -
                          atan2(foreArmLength * sin(radians(elbowAngle)),
                                upperArmLength + foreArmLength * cos(radians(elbowAngle))))
                         * 180 / PI;

  shoulderServo.write(constrain(shoulderAngle, 0, 180));
  elbowServo.write(constrain(elbowAngle, 0, 180));

  if (digitalRead(gripperButton) == LOW) {
    gripperServo.write(30);
  } else {
    gripperServo.write(90);
  }

  Serial.print("Shoulder: "); Serial.print(shoulderAngle);
  Serial.print(" Elbow: "); Serial.println(elbowAngle);

  delay(50);
}`,
    optimizedCode: `// Optimized with base rotation and smoothed joint motion
#include <Servo.h>

Servo baseServo, shoulderServo, elbowServo, gripperServo;

const int joyX = A0;
const int joyY = A1;
const int baseAxis = A2;
const int gripperButton = 22;

const float upperArmLength = 10.0;
const float foreArmLength = 10.0;

float currentShoulder = 90, currentElbow = 90, currentBase = 90;
const float smoothing = 0.15;

void setup() {
  baseServo.attach(3);
  shoulderServo.attach(5);
  elbowServo.attach(6);
  gripperServo.attach(9);
  pinMode(gripperButton, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  float targetX = map(analogRead(joyX), 0, 1023, -10, 10);
  float targetY = map(analogRead(joyY), 0, 1023, 5, 20);
  int targetBase = map(analogRead(baseAxis), 0, 1023, 0, 180);

  float dist = constrain(sqrt(targetX * targetX + targetY * targetY), 0.1, upperArmLength + foreArmLength - 0.1);
  float cosElbow = (dist * dist - upperArmLength * upperArmLength - foreArmLength * foreArmLength)
                    / (2 * upperArmLength * foreArmLength);
  float targetElbow = acos(constrain(cosElbow, -1, 1)) * 180 / PI;
  float targetShoulder = (atan2(targetY, targetX) -
                           atan2(foreArmLength * sin(radians(targetElbow)),
                                 upperArmLength + foreArmLength * cos(radians(targetElbow))))
                          * 180 / PI;

  currentShoulder += (constrain(targetShoulder, 0, 180) - currentShoulder) * smoothing;
  currentElbow += (constrain(targetElbow, 0, 180) - currentElbow) * smoothing;
  currentBase += (targetBase - currentBase) * smoothing;

  shoulderServo.write((int)currentShoulder);
  elbowServo.write((int)currentElbow);
  baseServo.write((int)currentBase);
  gripperServo.write(digitalRead(gripperButton) == LOW ? 30 : 90);

  delay(20);
}`,
  },
  {
    id: 305, emoji: "🚁", title: "Ultrasonic Radar Scanner",
    desc: "Sweep an ultrasonic sensor on a servo and display a radar-style map on Processing.",
    difficulty: "advanced", time: "90 mins", xp: 200,
    components: ["HC-SR04", "Servo Motor", "Arduino Uno", "Breadboard"],
    instructions: [
      "Gather: Arduino Uno, HC-SR04 ultrasonic sensor, SG90 servo, breadboard, wires",
      "Mount the ultrasonic sensor on top of the servo horn",
      "Wire HC-SR04: Trig→pin 9, Echo→pin 10, VCC→5V, GND→GND; Servo signal→pin 6",
      "Upload the code and open Serial Monitor (or Serial Plotter) at 9600 baud",
      "The servo sweeps 0-180° printing 'angle,distance' pairs as it scans",
      "🧪 Feed the Serial output into a Processing sketch for a live radar display",
      "⚠️ Erratic readings? The optimized version's median filtering rejects echo noise",
    ],
    basicCode: `/*
  Learning Goals:
  1. Sweep a servo through a range of angles
  2. Measure distance with an ultrasonic sensor at each angle
  3. Output structured data for visualization
*/

#include <Servo.h>

Servo radarServo;
const int trigPin = 9;
const int echoPin = 10;

long readDistanceCM() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  return duration * 0.034 / 2;
}

void setup() {
  radarServo.attach(6);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.begin(9600);
}

void loop() {
  for (int angle = 0; angle <= 180; angle += 2) {
    radarServo.write(angle);
    delay(30);
    long distance = readDistanceCM();
    Serial.print(angle);
    Serial.print(",");
    Serial.println(distance);
  }

  for (int angle = 180; angle >= 0; angle -= 2) {
    radarServo.write(angle);
    delay(30);
    long distance = readDistanceCM();
    Serial.print(angle);
    Serial.print(",");
    Serial.println(distance);
  }
}`,
    optimizedCode: `// Optimized with noise-filtered readings and a max range cutoff
#include <Servo.h>

Servo radarServo;
const int trigPin = 9;
const int echoPin = 10;
const int maxRange = 200;

long readDistanceOnce() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 30000);
  if (duration == 0) return maxRange;
  long distance = duration * 0.034 / 2;
  return distance > maxRange ? maxRange : distance;
}

long readDistanceFiltered() {
  long a = readDistanceOnce();
  long b = readDistanceOnce();
  long c = readDistanceOnce();
  return max(min(a, b), min(max(a, b), c));
}

void scanSweep(int start, int end, int step) {
  for (int angle = start; step > 0 ? angle <= end : angle >= end; angle += step) {
    radarServo.write(angle);
    delay(25);
    long distance = readDistanceFiltered();
    Serial.print(angle);
    Serial.print(",");
    Serial.println(distance);
  }
}

void setup() {
  radarServo.attach(6);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.begin(9600);
}

void loop() {
  scanSweep(0, 180, 2);
  scanSweep(180, 0, -2);
}`,
  },
  {
    id: 306, emoji: "🎵", title: "Audio Spectrum Analyzer",
    desc: "Visualize audio frequencies on an LED matrix using FFT analysis.",
    difficulty: "advanced", time: "80 mins", xp: 185,
    components: ["Microphone Module", "8x8 LED Matrix", "MAX7219", "Arduino Uno"],
    instructions: [
      "Gather: Arduino Uno, analog microphone module, MAX7219 8x8 matrix, breadboard, wires",
      "Wire microphone: OUT→A0, VCC→5V, GND→GND",
      "Wire matrix: DIN→11, CLK→13, CS→10, VCC→5V, GND→GND",
      "Install the 'arduinoFFT' and 'LedControl' libraries, then upload",
      "Play music or speak near the mic — bars should react to different frequencies",
      "🧪 Try the peak-hold version for a classic VU-meter look",
      "⚠️ No response? Most electret mic modules need their onboard gain trimmer adjusted",
    ],
    basicCode: `/*
  Learning Goals:
  1. Sample audio with an analog microphone module
  2. Run a Fast Fourier Transform (FFT) to extract frequency bands
  3. Visualize frequency bins on an 8x8 LED matrix
*/

#include <arduinoFFT.h>
#include <LedControl.h>

#define SAMPLES 64
#define SAMPLING_FREQUENCY 5000

double vReal[SAMPLES];
double vImag[SAMPLES];
arduinoFFT FFT = arduinoFFT(vReal, vImag, SAMPLES, SAMPLING_FREQUENCY);

const int micPin = A0;
LedControl lc = LedControl(11, 13, 10, 1);

void setup() {
  lc.shutdown(0, false);
  lc.setIntensity(0, 8);
  lc.clearDisplay(0);
  Serial.begin(9600);
}

void sampleAudio() {
  for (int i = 0; i < SAMPLES; i++) {
    vReal[i] = analogRead(micPin);
    vImag[i] = 0;
    delayMicroseconds(1000000 / SAMPLING_FREQUENCY);
  }
}

void loop() {
  sampleAudio();
  FFT.Windowing(FFT_WIN_TYP_HAMMING, FFT_FORWARD);
  FFT.Compute(FFT_FORWARD);
  FFT.ComplexToMagnitude();

  lc.clearDisplay(0);
  for (int col = 0; col < 8; col++) {
    int bin = 2 + col * 2;
    int magnitude = constrain(map(vReal[bin], 0, 4000, 0, 8), 0, 8);
    for (int row = 0; row < magnitude; row++) {
      lc.setLed(0, 7 - row, col, true);
    }
  }
}`,
    optimizedCode: `// Optimized with peak-hold decay for a smoother VU-meter look
#include <arduinoFFT.h>
#include <LedControl.h>

#define SAMPLES 64
#define SAMPLING_FREQUENCY 5000

double vReal[SAMPLES];
double vImag[SAMPLES];
arduinoFFT FFT = arduinoFFT(vReal, vImag, SAMPLES, SAMPLING_FREQUENCY);

const int micPin = A0;
LedControl lc = LedControl(11, 13, 10, 1);
int peaks[8] = {0};

void setup() {
  lc.shutdown(0, false);
  lc.setIntensity(0, 8);
  lc.clearDisplay(0);
  Serial.begin(9600);
}

void sampleAudio() {
  for (int i = 0; i < SAMPLES; i++) {
    vReal[i] = analogRead(micPin);
    vImag[i] = 0;
    delayMicroseconds(1000000 / SAMPLING_FREQUENCY);
  }
}

void loop() {
  sampleAudio();
  FFT.Windowing(FFT_WIN_TYP_HAMMING, FFT_FORWARD);
  FFT.Compute(FFT_FORWARD);
  FFT.ComplexToMagnitude();

  lc.clearDisplay(0);
  for (int col = 0; col < 8; col++) {
    int bin = 2 + col * 2;
    int magnitude = constrain(map(vReal[bin], 0, 4000, 0, 8), 0, 8);

    if (magnitude >= peaks[col]) {
      peaks[col] = magnitude;
    } else {
      peaks[col] = max(0, peaks[col] - 1);
    }

    for (int row = 0; row < magnitude; row++) {
      lc.setLed(0, 7 - row, col, true);
    }
    if (peaks[col] < 8) lc.setLed(0, 7 - peaks[col], col, true);
  }
}`,
  },
  {
    id: 307, emoji: "⚡", title: "Power Consumption Monitor",
    desc: "Measure voltage and current with INA219 and display real-time power graphs on OLED.",
    difficulty: "advanced", time: "85 mins", xp: 190,
    components: ["INA219", "OLED Display", "Arduino Uno", "Breadboard"],
    instructions: [
      "Gather: Arduino Uno, INA219 power sensor breakout, 0.96\" OLED, breadboard, wires",
      "Wire INA219 in series with your load's power line: VIN+ → source, VIN− → load",
      "Wire INA219 I2C: SDA→A4, SCL→A5, VCC→5V, GND→GND — same for OLED",
      "Install 'Adafruit INA219' library, then upload",
      "OLED should show live voltage, current, and power draw",
      "🧪 Add the energy-tracking version to see cumulative mWh used over time",
      "⚠️ Readings at zero? Double-check current flows THROUGH the INA219, not around it",
    ],
    basicCode: `/*
  Learning Goals:
  1. Measure voltage and current with an INA219 (I2C)
  2. Calculate real-time power (P = V × I)
  3. Display live readings on an OLED
*/

#include <Wire.h>
#include <Adafruit_INA219.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_INA219 ina219;
Adafruit_SSD1306 display(128, 64, &Wire, -1);

void setup() {
  Serial.begin(9600);
  ina219.begin();
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.setTextColor(WHITE);
}

void loop() {
  float busVoltage = ina219.getBusVoltage_V();
  float current_mA = ina219.getCurrent_mA();
  float power_mW = busVoltage * current_mA;

  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("Power Monitor");
  display.print("V: "); display.print(busVoltage); display.println(" V");
  display.print("I: "); display.print(current_mA); display.println(" mA");
  display.print("P: "); display.print(power_mW); display.println(" mW");
  display.display();

  Serial.print(busVoltage); Serial.print("V, ");
  Serial.print(current_mA); Serial.println("mA");

  delay(1000);
}`,
    optimizedCode: `// Optimized with cumulative energy usage tracking (mWh)
#include <Wire.h>
#include <Adafruit_INA219.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_INA219 ina219;
Adafruit_SSD1306 display(128, 64, &Wire, -1);
double totalEnergy_mWh = 0;
unsigned long lastSample = 0;

void setup() {
  Serial.begin(9600);
  ina219.begin();
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.setTextColor(WHITE);
  lastSample = millis();
}

void loop() {
  float busVoltage = ina219.getBusVoltage_V();
  float current_mA = ina219.getCurrent_mA();
  float power_mW = busVoltage * current_mA;

  unsigned long now = millis();
  double hoursElapsed = (now - lastSample) / 3600000.0;
  totalEnergy_mWh += power_mW * hoursElapsed;
  lastSample = now;

  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("Power Monitor");
  display.print("V: "); display.print(busVoltage); display.println(" V");
  display.print("I: "); display.print(current_mA); display.println(" mA");
  display.print("P: "); display.print(power_mW); display.println(" mW");
  display.print("E: "); display.print(totalEnergy_mWh); display.println(" mWh");
  display.display();

  delay(1000);
}`,
  },
  {
    id: 308, emoji: "🤖", title: "Gesture-Controlled Robot",
    desc: "Control a robot using hand gestures detected by an accelerometer on a glove.",
    difficulty: "advanced", time: "110 mins", xp: 240,
    components: ["MPU6050", "Motor Driver L298N", "DC Motors", "Arduino Uno"],
    instructions: [
      "Gather: Arduino Uno, MPU6050 module, L298N motor driver, 2× DC motors + wheels, chassis",
      "Wire MPU6050: SDA→A4, SCL→A5, VCC→5V, GND→GND (worn on the controlling hand/glove)",
      "Wire L298N: IN1-IN4→pins 8-11, motors to OUT1-OUT4",
      "Power the L298N and motors from a separate battery pack",
      "Upload the code and tilt the MPU6050 forward/back/left/right to drive the robot",
      "🧪 Try the PWM-speed version so gentler tilts drive slower, sharper tilts drive faster",
      "⚠️ Robot driving backwards from expected? Swap that side's IN1/IN2 wiring",
    ],
    basicCode: `/*
  Learning Goals:
  1. Read tilt data from an MPU6050 accelerometer (I2C)
  2. Map tilt angles to robot movement commands
  3. Drive motors via an L298N based on gesture input
*/

#include <Wire.h>
#include <MPU6050.h>

MPU6050 mpu;

const int leftIN1 = 8;
const int leftIN2 = 9;
const int rightIN1 = 10;
const int rightIN2 = 11;

void setup() {
  Wire.begin();
  mpu.initialize();
  pinMode(leftIN1, OUTPUT);
  pinMode(leftIN2, OUTPUT);
  pinMode(rightIN1, OUTPUT);
  pinMode(rightIN2, OUTPUT);
  Serial.begin(9600);
}

void drive(bool l1, bool l2, bool r1, bool r2) {
  digitalWrite(leftIN1, l1); digitalWrite(leftIN2, l2);
  digitalWrite(rightIN1, r1); digitalWrite(rightIN2, r2);
}

void loop() {
  int16_t ax, ay, az;
  mpu.getAcceleration(&ax, &ay, &az);

  if (ay < -8000) {
    drive(HIGH, LOW, HIGH, LOW);
    Serial.println("Forward");
  } else if (ay > 8000) {
    drive(LOW, HIGH, LOW, HIGH);
    Serial.println("Reverse");
  } else if (ax < -8000) {
    drive(LOW, HIGH, HIGH, LOW);
    Serial.println("Left");
  } else if (ax > 8000) {
    drive(HIGH, LOW, LOW, HIGH);
    Serial.println("Right");
  } else {
    drive(LOW, LOW, LOW, LOW);
  }

  delay(100);
}`,
    optimizedCode: `// Optimized with a smoothing filter and tilt-proportional speed via PWM
#include <Wire.h>
#include <MPU6050.h>

MPU6050 mpu;

const int leftIN1 = 8;
const int leftIN2 = 9;
const int leftEnable = 5;
const int rightIN1 = 10;
const int rightIN2 = 11;
const int rightEnable = 6;

float smoothAx = 0, smoothAy = 0;
const float smoothing = 0.2;

void setup() {
  Wire.begin();
  mpu.initialize();
  pinMode(leftIN1, OUTPUT); pinMode(leftIN2, OUTPUT); pinMode(leftEnable, OUTPUT);
  pinMode(rightIN1, OUTPUT); pinMode(rightIN2, OUTPUT); pinMode(rightEnable, OUTPUT);
  Serial.begin(9600);
}

void drive(bool l1, bool l2, bool r1, bool r2, int speed) {
  digitalWrite(leftIN1, l1); digitalWrite(leftIN2, l2);
  digitalWrite(rightIN1, r1); digitalWrite(rightIN2, r2);
  analogWrite(leftEnable, speed);
  analogWrite(rightEnable, speed);
}

void loop() {
  int16_t ax, ay, az;
  mpu.getAcceleration(&ax, &ay, &az);

  smoothAx += (ax - smoothAx) * smoothing;
  smoothAy += (ay - smoothAy) * smoothing;

  int speed = constrain(map(abs(smoothAy), 8000, 16000, 120, 255), 120, 255);

  if (smoothAy < -8000) {
    drive(HIGH, LOW, HIGH, LOW, speed);
  } else if (smoothAy > 8000) {
    drive(LOW, HIGH, LOW, HIGH, speed);
  } else if (smoothAx < -8000) {
    drive(LOW, HIGH, HIGH, LOW, 180);
  } else if (smoothAx > 8000) {
    drive(HIGH, LOW, LOW, HIGH, 180);
  } else {
    drive(LOW, LOW, LOW, LOW, 0);
  }

  delay(50);
}`,
  },
];

// Wokwi project IDs mapping — every project gets a simulator
const getWokwiUrl = (_id: number) => "https://wokwi.com/projects/new/arduino-uno";

type ActiveTab = "instructions" | "code" | "simulate";
type CodeMode = "basic" | "optimized";

export default function ProjectDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const projectId = parseInt(id || "1");

  const buildFallbackProject = (source: any) => ({
    id: source.id,
    emoji: source.emoji || "🔧",
    title: source.title,
    desc: source.description || source.desc || "A custom Arduino project.",
    difficulty: source.difficulty || "beginner",
    time: source.time || "30 mins",
    xp: source.xp || 75,
    components: source.components || ["Arduino Uno"],
    instructions: [
      "Review the project components and gather your materials",
      "Wire up the circuit following the pin assignments in the code",
      "Read through the starter code and understand each section",
      "Fill in the TODO sections and test your implementation",
    ],
    basicCode: `/*
  🎯 Project: ${source.title}

  Goal: ${source.description || source.desc || "Complete this project"}

  📦 Components: ${(source.components || ["Arduino Uno"]).join(", ")}

  🧩 Write your implementation below!
*/

void setup() {
  Serial.begin(9600);
  // TODO: Initialize your pins and components
  Serial.println("${source.title} Starting...");
}

void loop() {
  // TODO: Add your main project logic here

  delay(100);
}`,
    optimizedCode: `// Optimized version coming soon!
// Complete the basic version first.

void setup() {
  Serial.begin(9600);
}

void loop() {
  delay(100);
}`,
  });

  // Check if this project has active local data (Generate/Catalog/Think Bigger/Dashboard)
  const generatedProject = (() => {
    try {
      const stored = localStorage.getItem("activeGeneratedProject");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.id === projectId) {
          // Cache for future visits
          try { localStorage.setItem(`projectCache_${projectId}`, stored); } catch {}
          return parsed;
        }
      }
    } catch {}
    return null;
  })();

  // Fallback: check project cache
  const cachedProject = (() => {
    try {
      const cached = localStorage.getItem(`projectCache_${projectId}`);
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  })();

  // Fallback lookup from saved dashboard projects by ID
  const savedProjectById = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem("savedProjects") || "[]");
      return saved.find((p: any) => p.id === projectId) || null;
    } catch {
      return null;
    }
  })();

  const project = (() => {
    if (generatedProject) {
      const byTitle = allProjects.find(
        (p) => p.title.toLowerCase() === generatedProject.title?.toLowerCase()
      );
      if (byTitle) return byTitle;
      return buildFallbackProject(generatedProject);
    }

    const exactCatalogMatch = allProjects.find((p) => p.id === projectId);
    if (exactCatalogMatch) return exactCatalogMatch;

    if (savedProjectById) return buildFallbackProject(savedProjectById);

    // Try cached project data
    if (cachedProject) return buildFallbackProject(cachedProject);

    return allProjects[0];
  })();

  const { user } = useAuth();
  const { saveProject, isProjectSaved, updateProgress, completeProject, deleteProject, projects: userDbProjects } = useUserProjects();

  // Load saved progress from DB
  const dbProject = userDbProjects.find(p => p.project_id === projectId);

  const [activeTab, setActiveTab] = useState<ActiveTab>("instructions");
  const [simExpanded, setSimExpanded] = useState(false);
  const [codeMode, setCodeMode] = useState<CodeMode>("basic");
  const [showSolution, setShowSolution] = useState(false);
  const [saved, setSaved] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [copyToast, setCopyToast] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<boolean[]>(new Array(project.instructions.length).fill(false));
  const [expandedComponents, setExpandedComponents] = useState<Record<string, boolean>>({});
  const [activeNote, setActiveNote] = useState<Record<number, string>>({});
  const [showConceptDetails, setShowConceptDetails] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 80) + 20);
  const [shareToast, setShareToast] = useState(false);
  const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);
  const [simulatorPassed, setSimulatorPassed] = useState(false);
  const [codePassed, setCodePassed] = useState(false);
  const [completionAwarded, setCompletionAwarded] = useState(false);

  // Sync saved state and checked steps from DB
  useEffect(() => {
    setSaved(isProjectSaved(projectId));
    if (dbProject) {
      if (dbProject.checked_steps?.length > 0) setCheckedSteps(dbProject.checked_steps);
      if (dbProject.notes && Object.keys(dbProject.notes).length > 0) {
        const parsed: Record<number, string> = {};
        Object.entries(dbProject.notes).forEach(([k, v]) => { parsed[Number(k)] = v; });
        setActiveNote(parsed);
      }
      if (dbProject.status === "completed") {
        setCompleted(true);
        setCompletionAwarded(true);
      }
    }
  }, [dbProject, isProjectSaved, projectId]);

  // AUTO-COMPLETION CHECK: All steps done + code compiled + simulator passed
  const allStepsCompleted = checkedSteps.length > 0 && checkedSteps.every(Boolean);
  
  useEffect(() => {
    if (allStepsCompleted && codePassed && simulatorPassed && !completionAwarded && saved && user) {
      // All conditions met — trigger auto-completion
      setCompletionAwarded(true);
      setCompleted(true);
      setShowCompletionCelebration(true);

      // Award XP and update DB
      completeProject(projectId, project.xp || 0);

      // Hide celebration after 5s
      setTimeout(() => setShowCompletionCelebration(false), 5000);
    }
  }, [allStepsCompleted, codePassed, simulatorPassed, completionAwarded, saved, user, projectId, project.xp, completeProject]);

  // Auto-save progress to DB when steps change
  const autoSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!user || !saved) return;
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    autoSaveTimeout.current = setTimeout(() => {
      const completedCount = checkedSteps.filter(Boolean).length;
      const allStepsDone = checkedSteps.length > 0 && checkedSteps.every(Boolean);
      // Progress milestones: steps=25%, code=50%, simulator=100%
      let progress = 0;
      if (allStepsDone && codePassed && simulatorPassed) progress = 100;
      else if (allStepsDone && codePassed) progress = 50;
      else if (allStepsDone) progress = 25;
      else if (project.instructions.length > 0) progress = Math.min(Math.round((completedCount / project.instructions.length) * 24), 24);
      // Don't overwrite completed status via auto-save
      if (!completionAwarded) {
        updateProgress(projectId, {
          checked_steps: checkedSteps,
          notes: activeNote as any,
          progress,
          status: "inProgress",
        });
      }
    }, 2000);
    return () => { if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current); };
  }, [checkedSteps, activeNote, user, saved, completionAwarded, codePassed, simulatorPassed, project.instructions.length, projectId, updateProgress]);

  // Extract learning concepts from code comments
  const learningConcepts = (() => {
    const code = project.basicCode;
    const goalMatch = code.match(/Learning Goals:\n([\s\S]*?)\*\//);
    if (goalMatch) {
      return goalMatch[1]
        .split("\n")
        .map(l => l.replace(/^\s*\d+\.\s*/, "").trim())
        .filter(l => l.length > 0);
    }
    return ["Digital I/O", "Serial Communication", "Timing Functions"];
  })();

  // Component info database
  const componentInfo: Record<string, { description: string; pins: string; tipIcon: string; buyLink?: string }> = {
    "Arduino Uno": { description: "ATmega328P microcontroller board with 14 digital I/O pins and 6 analog inputs.", pins: "Digital: 0-13 | Analog: A0-A5 | PWM: 3,5,6,9,10,11", tipIcon: "🎛️" },
    "LED (Red)": { description: "Light-emitting diode. Forward voltage ~2V, max current 20mA.", pins: "Anode (+) → Resistor → Pin | Cathode (−) → GND", tipIcon: "💡" },
    "Resistor (220Ω)": { description: "Current-limiting resistor to protect LEDs. Color bands: Red-Red-Brown.", pins: "In series with LED anode", tipIcon: "⚡" },
    "Resistor (10kΩ)": { description: "Pull-up/pull-down resistor. Color bands: Brown-Black-Orange.", pins: "Used in voltage dividers or pull-up circuits", tipIcon: "⚡" },
    "Breadboard": { description: "Solderless prototyping board. Rails (+/−) run horizontally, rows vertically.", pins: "Power rails on sides, component rows in center", tipIcon: "🔲" },
    "Jumper Wires": { description: "Male-to-male wires for breadboard connections. Use color coding!", pins: "Red=5V, Black=GND, Others=signals", tipIcon: "🔌" },
    "Temperature Sensor (DHT22)": { description: "Digital temp & humidity sensor. Range: -40°C to 80°C, ±0.5°C accuracy.", pins: "VCC → 5V | DATA → Digital Pin | GND → GND", tipIcon: "🌡️" },
    "Temperature Sensor (DHT11)": { description: "Basic digital temp sensor. Range: 0-50°C, ±2°C accuracy.", pins: "VCC → 5V | DATA → Digital Pin | GND → GND", tipIcon: "🌡️" },
    "Servo Motor (SG90)": { description: "Micro servo with 180° rotation. Torque: 1.8kg·cm at 4.8V.", pins: "Red → 5V | Brown → GND | Orange → PWM Pin", tipIcon: "⚙️" },
    "Potentiometer": { description: "Variable resistor (10kΩ typical). Turn the knob to change resistance.", pins: "Outer pins → 5V & GND | Middle → Analog Pin", tipIcon: "🎚️" },
    "RGB LED": { description: "Common cathode LED with 3 color channels. Mix R+G+B for any color.", pins: "Longest pin (cathode) → GND | R,G,B → PWM pins via 220Ω", tipIcon: "🌈" },
    "HC-05 Bluetooth": { description: "Bluetooth SPP module. Default baud: 9600. Pair code: 1234.", pins: "TX → Arduino RX | RX → Arduino TX | VCC → 5V | GND → GND", tipIcon: "📡" },
    "Buzzer": { description: "Piezoelectric buzzer. Use tone() to generate frequencies 31Hz-65kHz.", pins: "+ → Digital Pin | − → GND", tipIcon: "🔊" },
    "Push Button": { description: "Momentary tactile switch. Normally open, closes when pressed.", pins: "One side → Digital Pin + Pull-down | Other → 5V or GND", tipIcon: "🔘" },
    "Soil Moisture Sensor": { description: "Analog sensor. Low value = wet soil, high value = dry soil.", pins: "VCC → 5V | GND → GND | AO → Analog Pin", tipIcon: "🌱" },
    "Relay Module": { description: "Electrically controlled switch for high-power devices (up to 10A/250V AC).", pins: "IN → Digital Pin | VCC → 5V | GND → GND", tipIcon: "🔌" },
    "Water Pump": { description: "Small submersible DC water pump. 3-6V, ~130mA.", pins: "Connected through relay module", tipIcon: "💧" },
    "16x2 LCD": { description: "Character LCD with I2C adapter. 16 columns × 2 rows display.", pins: "SDA → A4 | SCL → A5 | VCC → 5V | GND → GND", tipIcon: "📺" },
    "Ultrasonic Sensor (HC-SR04)": { description: "Distance sensor using sound waves. Range: 2cm-400cm.", pins: "Trig → Digital Pin | Echo → Digital Pin | VCC → 5V | GND → GND", tipIcon: "📏" },
    "Motor Driver (L298N)": { description: "Dual H-bridge motor driver. Controls 2 DC motors or 1 stepper.", pins: "IN1-IN4 → Digital Pins | ENA/ENB → PWM | VCC → 12V | GND → GND", tipIcon: "🏎️" },
    "DC Motor": { description: "Simple DC motor. Speed controlled by PWM, direction by H-bridge.", pins: "Connected through L298N motor driver", tipIcon: "⚡" },
    "Photoresistor (LDR)": { description: "Light-dependent resistor. Resistance decreases with more light.", pins: "One leg → 5V | Other → Analog Pin + 10kΩ to GND", tipIcon: "☀️" },
    "OLED Display (0.96\")": { description: "128×64 pixel I2C OLED. SSD1306 driver. No backlight needed.", pins: "SDA → A4 | SCL → A5 | VCC → 3.3/5V | GND → GND", tipIcon: "📊" },
    "LED Matrix 8x8": { description: "64 LEDs in an 8×8 grid controlled via MAX7219 driver.", pins: "DIN → Digital Pin | CS → Digital Pin | CLK → Digital Pin", tipIcon: "🎮" },
    "Battery Holder": { description: "Holds AA batteries for portable power. 4xAA = 6V.", pins: "+ → VIN or Motor Driver | − → GND", tipIcon: "🔋" },
    "LED (Green)": { description: "Light-emitting diode. Forward voltage ~2.1V, max current 20mA.", pins: "Anode (+) → Resistor → Pin | Cathode (−) → GND", tipIcon: "💡" },
    "Sound Sensor": { description: "Microphone module with digital trigger output on loud sounds (e.g. claps).", pins: "OUT → Digital Pin | VCC → 5V | GND → GND", tipIcon: "🎤" },
    "PIR Sensor": { description: "Passive infrared motion detector. Needs ~30s warm-up after power-on.", pins: "OUT → Digital Pin | VCC → 5V | GND → GND", tipIcon: "🕵️" },
    "Laser Module": { description: "Low-power laser diode (typically 5V, <5mW) for beam-break sensing.", pins: "+ → Digital or 5V | − → GND", tipIcon: "🔴" },
    "IR Sensor": { description: "Infrared receiver module for decoding remote control signals (e.g. VS1838B).", pins: "OUT → Digital Pin | VCC → 5V | GND → GND", tipIcon: "📶" },
    "GPS Module": { description: "NMEA-output GPS receiver (e.g. NEO-6M). Needs outdoor sky visibility for a fix.", pins: "TX → RX Pin | RX → TX Pin | VCC → 5V | GND → GND", tipIcon: "🛰️" },
    "SD Card Module": { description: "SPI-based microSD card reader/writer for data logging.", pins: "CS → Digital Pin | MOSI/MISO/SCK → SPI Pins | VCC → 5V | GND → GND", tipIcon: "💾" },
    "BMP180 (Pressure)": { description: "I2C barometric pressure and temperature sensor. Also derives altitude.", pins: "SDA → A4 | SCL → A5 | VCC → 3.3/5V | GND → GND", tipIcon: "🌦️" },
    "ESP8266": { description: "WiFi-enabled microcontroller (runs its own Arduino-compatible sketches).", pins: "Programmed and powered independently — see board-specific pinout", tipIcon: "📶" },
    "Arduino Mega": { description: "ATmega2560 board with 54 digital I/O pins and 16 analog inputs — more room for complex builds.", pins: "Digital: 0-53 | Analog: A0-A15 | PWM: 2-13,44-46", tipIcon: "🎛️" },
  };

  const stepProgress = checkedSteps.filter(Boolean).length;
  const totalSteps = project.instructions.length;
  // Progress milestones: steps=25%, code=50%, simulator=100%
  const progressPercent = (() => {
    if (allStepsCompleted && codePassed && simulatorPassed) return 100;
    if (allStepsCompleted && codePassed) return 50;
    if (allStepsCompleted) return 25;
    // Before all steps done, scale 0-24%
    return totalSteps > 0 ? Math.min(Math.round((stepProgress / totalSteps) * 24), 24) : 0;
  })();

  const toggleStep = (index: number) => {
    setCheckedSteps(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const toggleComponentExpand = (name: string) => {
    setExpandedComponents(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Editable code state
  const starterTemplate = `/*
  Project: ${project.title}
  
  🎯 Goal: ${project.desc}
  
  📦 Components needed:
${project.components.map(c => `     - ${c}`).join("\n")}
  
  🧩 Hints:
${project.instructions.map((inst, i) => `     Step ${i + 1}: ${inst}`).join("\n")}
  
  💡 Your task: Write the code below!
     Use the AI Mentor (bottom-right) if you get stuck.
     Click "Reveal Solution" only after trying on your own.
*/

void setup() {
  // TODO: Initialize your pins and Serial
  // Hint: Use pinMode() for outputs and Serial.begin() for debugging
  
}

void loop() {
  // TODO: Write your main logic here
  // Hint: Think about what should happen repeatedly
  
}`;

  const [userCode, setUserCode] = useState(starterTemplate);
  const [runStep, setRunStep] = useState<"idle" | "compiling" | "simulating" | "success" | "error">("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugMessages, setDebugMessages] = useState<Array<{ role: "ai" | "user"; content: string }>>([]);
  const [debugInput, setDebugInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const debugBottomRef = useRef<HTMLDivElement>(null);
  const [revertCount, setRevertCount] = useState(0);

  const {
    serialConnected,
    serialLogs,
    showSerialConsole,
    setShowSerialConsole,
    uploading,
    connectSerial,
    disconnectSerial,
    uploadToBoard: uploadCodeToBoard,
    clearLogs,
  } = useArduinoFlasher();

  const uploadToBoard = () => uploadCodeToBoard(currentCode);

  // ---- Version History ----
  interface CodeSnapshot { code: string; label: string; timestamp: string; }
  const versionKey = `code_versions_${projectId}`;
  const [codeVersions, setCodeVersions] = useState<CodeSnapshot[]>(() => {
    try { return JSON.parse(localStorage.getItem(versionKey) || "[]"); } catch { return []; }
  });
  const [showVersionPanel, setShowVersionPanel] = useState(false);

  const saveSnapshot = (label?: string) => {
    const snapshot: CodeSnapshot = {
      code: userCode,
      label: label || `Snapshot #${codeVersions.length + 1}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [snapshot, ...codeVersions].slice(0, 20); // max 20
    setCodeVersions(updated);
    localStorage.setItem(versionKey, JSON.stringify(updated));
    sonnerToast.success("📸 Code snapshot saved");
  };

  const revertToVersion = (idx: number) => {
    setUserCode(codeVersions[idx].code);
    setRevertCount(prev => prev + 1);
    sonnerToast.success(`↩️ Reverted to "${codeVersions[idx].label}"`);
  };

  const deleteVersion = (idx: number) => {
    const updated = codeVersions.filter((_, i) => i !== idx);
    setCodeVersions(updated);
    localStorage.setItem(versionKey, JSON.stringify(updated));
  };

  const currentCode = showSolution
    ? (codeMode === "basic" ? project.basicCode : project.optimizedCode)
    : userCode;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  };

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const runAndCheck = async () => {
    setErrors([]);
    setRunStep("compiling");
    await delay(1200);

    const code = showSolution ? currentCode : userCode;
    const foundErrors: string[] = [];

    // Check for common Arduino errors
    if (code.includes("pinMod(")) foundErrors.push("Error: 'pinMod' is not defined. Did you mean 'pinMode'?");
    if (/delay\(\d+;/.test(code)) foundErrors.push("Syntax error: missing closing parenthesis ')' in delay()");
    if (code.includes("void setup()") && !code.includes("pinMode") && !code.includes("Serial.begin") && !code.includes("// TODO")) {
      foundErrors.push("Warning: setup() is empty. Initialize your pins with pinMode() and Serial with Serial.begin().");
    }
    if (code.includes("// TODO: Initialize") || code.includes("// TODO: Write your main")) {
      foundErrors.push("Incomplete: You still have TODO sections. Fill in your code before running!");
    }
    if (!code.includes("void setup()")) foundErrors.push("Error: Missing setup() function.");
    if (!code.includes("void loop()")) foundErrors.push("Error: Missing loop() function.");

    if (foundErrors.length > 0) {
      setErrors(foundErrors);
      setRunStep("error");
      setCodePassed(false);
      setSimulatorPassed(false);
      return;
    }

    // Code compiled successfully
    setCodePassed(true);

    setRunStep("simulating");
    await delay(1500);

    // Safety checks (no critical warnings)
    const safetyWarnings: string[] = [];
    if (code.includes("analogWrite") && code.includes("delay(1)")) {
      safetyWarnings.push("Warning: Very short delay with analog output may cause instability.");
    }
    if (safetyWarnings.length > 0) {
      setErrors(safetyWarnings);
      setRunStep("error");
      setSimulatorPassed(false);
      return;
    }

    // Simulator passed
    setSimulatorPassed(true);
    setRunStep("success");

    // Note: completion is now handled by the auto-completion effect
    // which checks allSteps + codePassed + simulatorPassed
  };

  const submitDebugQuery = async (msg: string) => {
    if (!msg.trim() || aiTyping) return;
    setDebugMessages((prev) => [...prev, { role: "user", content: msg }]);
    setAiTyping(true);

    const code = showSolution ? currentCode : userCode;
    const isCodeUntouched = code.trim() === starterTemplate.trim();
    
    let aiPrompt = msg;
    const lowerMsg = msg.toLowerCase();
    if (lowerMsg.includes("debug") || lowerMsg.includes("review") || lowerMsg.includes("error") || lowerMsg.includes("fix") || lowerMsg.includes("help") || lowerMsg.includes("check")) {
      if (isCodeUntouched) {
         aiPrompt = `I haven't written any code yet — I'm looking at the starter template for "${project.title}". What should I do first? Don't review the template, help me understand what I need to write. My question: ${msg}`;
      } else {
         aiPrompt = `Please review my code for "${project.title}" and give me SPECIFIC feedback — reference actual variable names, line numbers, and logic from what I wrote. Don't give generic tips. Errors (if any): ${errors.join(", ")}\n\n<user_code>\n${code}\n</user_code>\n\nQuestion: ${msg}`;
      }
    } else {
      aiPrompt = `Context: I'm working on the "${project.title}" project.\n\n<user_code>\n${code}\n</user_code>\n\nQuestion: ${msg}`;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setDebugMessages(prev => [...prev, { role: "ai", content: "Please log in to use the AI Mentor." }]);
        setAiTyping(false);
        return;
      }

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-mentor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [
            ...debugMessages.map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content })),
            { role: "user", content: aiPrompt }
          ],
          preferences: { tone: "supportive", hintDepth: "detailed", formality: "friendly" },
          contextMeta: { lesson_title: project.title }
        }),
      });

      if (!resp.ok) throw new Error("Failed to connect to AI Mentor");

      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      
      setDebugMessages(prev => [...prev, { role: "ai", content: "" }]);

      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let newlineIdx: number;
          while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, newlineIdx);
            buffer = buffer.slice(newlineIdx + 1);
            if (line.startsWith("data: ")) {
              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") break;
              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  assistantText += content;
                  setDebugMessages(prev => {
                    const next = [...prev];
                    next[next.length - 1] = { role: "ai", content: assistantText };
                    return next;
                  });
                  debugBottomRef.current?.scrollIntoView({ behavior: "smooth" });
                }
              } catch (e) {}
            }
          }
        }
      }
    } catch (err) {
      setDebugMessages(prev => [...prev, { role: "ai", content: "Sorry, I had trouble connecting. Please try again." }]);
    } finally {
      setAiTyping(false);
    }
  };

  const sendDebugMessage = () => {
    const msg = debugInput.trim();
    if (msg) {
      setDebugInput("");
      submitDebugQuery(msg);
    }
  };

  const handleRevealSolution = () => {
    if (!showSolution) {
      setShowSolution(true);
    } else {
      setShowSolution(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, "_").toLowerCase()}.ino`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [saving, setSaving] = useState(false);
  const [unsaving, setUnsaving] = useState(false);

  const handleSaveToProfile = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    const result = await saveProject({
      project_id: project.id,
      emoji: project.emoji,
      title: project.title,
      description: project.desc,
      difficulty: project.difficulty,
      time: project.time,
      xp: project.xp,
      components: project.components,
      source: generatedProject?.source || "catalog",
    });
    setSaving(false);
    if (result.error) {
      sonnerToast.error("🚫 Project limit reached", {
        description: "You can only have up to 5 projects in your dashboard. Complete or remove a project to start a new one.",
        duration: 5000,
      });
    } else {
      setSaved(true);
    }
  };

  const diffBadgeStyle =
    project.difficulty === "beginner"
      ? { background: "hsl(var(--success) / 0.15)", color: "hsl(var(--success))", border: "1px solid hsl(var(--success) / 0.3)" }
      : project.difficulty === "intermediate"
      ? { background: "hsl(var(--secondary) / 0.15)", color: "hsl(var(--secondary))", border: "1px solid hsl(var(--secondary) / 0.3)" }
      : { background: "hsl(var(--purple) / 0.15)", color: "hsl(var(--purple))", border: "1px solid hsl(var(--purple) / 0.3)" };

  // Completion status checklist
  const completionChecks = [
    { label: "All steps completed", done: allStepsCompleted },
    { label: "Code compiles successfully", done: codePassed },
    { label: "Simulator runs without errors", done: simulatorPassed },
    { label: "No critical warnings", done: codePassed && simulatorPassed },
  ];

  return (
    <Layout>
      {/* Completion Celebration Overlay */}
      {showCompletionCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "hsl(var(--background) / 0.85)", backdropFilter: "blur(8px)" }}>
          <div className="text-center animate-fade-in space-y-4">
            <div className="text-7xl animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
              Project Complete!
            </h2>
            <div className="flex items-center justify-center gap-2 text-xl font-bold" style={{ color: "hsl(var(--secondary))" }}>
              <Zap size={24} /> +{project.xp} XP Earned!
            </div>
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              This project has been moved to your Completed Projects
            </p>
            <div className="flex gap-3 justify-center mt-4">
              <button
                onClick={() => { setShowCompletionCelebration(false); navigate("/dashboard"); }}
                className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-dark)))", color: "hsl(var(--primary-foreground))" }}
              >
                View Dashboard
              </button>
              <button
                onClick={() => setShowCompletionCelebration(false)}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: "hsl(var(--muted))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))" }}
              >
                Stay Here
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-8 py-8 max-w-4xl mx-auto">
        {/* Back link */}
        <button
          onClick={() => {
            if (generatedProject?.source === "think-bigger") {
            navigate("/think-bigger");
            } else if (generatedProject?.source === "dashboard") {
              navigate("/dashboard");
            } else if (generatedProject?.source === "catalog") {
              navigate("/catalog");
            } else if (generatedProject) {
              navigate("/generate");
            } else {
              navigate("/catalog");
            }
          }}
          className="flex items-center gap-2 text-sm font-medium mb-6 transition-all hover:gap-3"
          style={{ color: "hsl(var(--primary))" }}
        >
          <ArrowLeft size={16} /> {generatedProject?.source === "think-bigger" ? "Back to Think Bigger" : generatedProject?.source === "dashboard" ? "Back to Dashboard" : generatedProject?.source === "catalog" ? "Back to Catalog" : generatedProject ? "Back to Generate" : "Back to Catalog"}
        </button>

        {/* Project Header */}
        <div className="flex items-start gap-5 mb-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
          >
            {project.emoji}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: "hsl(var(--foreground))" }}>{project.title}</h1>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>{project.desc}</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-xs px-3 py-1 rounded-full font-semibold capitalize" style={diffBadgeStyle}>
                    {project.difficulty}
                  </span>
                  <span className="flex items-center gap-1 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                    <Clock size={14} /> {project.time}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-bold" style={{ color: "hsl(var(--primary))" }}>
                    <Zap size={14} /> +{project.xp} XP
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {completed ? (
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                    style={{ background: "hsl(var(--success) / 0.1)", color: "hsl(var(--success))", border: "1px solid hsl(var(--success) / 0.3)" }}
                  >
                    <CheckCircle size={16} /> Completed
                  </div>
                ) : (
                  saved ? (
                    <button
                      onClick={async () => {
                        setUnsaving(true);
                        await new Promise(r => setTimeout(r, 600));
                        await deleteProject(projectId);
                        setUnsaving(false);
                        setSaved(false);
                      }}
                      disabled={unsaving}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 group"
                      style={{ background: "hsl(var(--success) / 0.1)", color: "hsl(var(--success))", border: "1px solid hsl(var(--success) / 0.3)", opacity: unsaving ? 0.7 : 1 }}
                      title="Click to unsave"
                    >
                      {unsaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                      {unsaving ? "Removing..." : <><span className="group-hover:hidden">Saved</span><span className="hidden group-hover:inline" style={{ color: "hsl(var(--destructive))" }}>Unsave</span></>}
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveToProfile}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
                      style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.3)", opacity: saving ? 0.7 : 1 }}
                    >
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {saving ? "Saving..." : "Save Project"}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Learning Concepts */}
        <div
          className="rounded-2xl p-5 border mb-6"
          style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={16} style={{ color: "hsl(var(--muted-foreground))" }} />
            <span className="font-bold text-sm" style={{ color: "hsl(var(--foreground))" }}>What You'll Learn</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {learningConcepts.map((concept) => (
              <button
                key={concept}
                onClick={() => setShowConceptDetails(showConceptDetails === concept ? null : concept)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105 cursor-pointer"
                style={{
                  background: showConceptDetails === concept ? "hsl(var(--primary) / 0.2)" : "hsl(var(--muted))",
                  color: showConceptDetails === concept ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                  border: `1px solid ${showConceptDetails === concept ? "hsl(var(--primary) / 0.4)" : "hsl(var(--border))"}`,
                }}
              >
                <BookOpen size={12} className="inline mr-1.5" />
                {concept}
              </button>
            ))}
          </div>
          {showConceptDetails && (
            <div className="mt-3 p-3 rounded-xl text-xs leading-relaxed animate-fade-in" style={{ background: "hsl(var(--primary) / 0.08)", border: "1px solid hsl(var(--primary) / 0.2)", color: "hsl(var(--foreground))" }}>
              <strong style={{ color: "hsl(var(--primary))" }}>{showConceptDetails}</strong>
              <p className="mt-1">This concept is covered in the code. Look for related functions and experiment with different values to deepen your understanding.</p>
            </div>
          )}
        </div>

        {/* Components Required - Interactive */}
        <div
          className="rounded-2xl p-5 border mb-6"
          style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Settings size={16} style={{ color: "hsl(var(--primary))" }} />
            <span className="font-bold text-sm" style={{ color: "hsl(var(--primary))" }}>Components Required</span>
            <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}>
              {project.components.length} parts
            </span>
          </div>
          <div className="space-y-2">
            {project.components.map((c) => {
              const info = componentInfo[c];
              const isExpanded = expandedComponents[c];
              return (
                <div key={c}>
                  <button
                    onClick={() => toggleComponentExpand(c)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.01]"
                    style={{
                      background: isExpanded ? "hsl(var(--muted))" : "hsl(var(--card))",
                      color: "hsl(var(--foreground))",
                      border: `1px solid ${isExpanded ? "hsl(var(--primary) / 0.3)" : "hsl(var(--border))"}`,
                    }}
                  >
                    <span className="text-lg">{info?.tipIcon || "🔧"}</span>
                    <span className="flex-1 text-left">{c}</span>
                    {info && (
                      <Info size={14} style={{ color: isExpanded ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }} />
                    )}
                    {info && (isExpanded ? <ChevronUp size={14} style={{ color: "hsl(var(--muted-foreground))" }} /> : <ChevronDown size={14} style={{ color: "hsl(var(--muted-foreground))" }} />)}
                  </button>
                  {isExpanded && info && (
                    <div className="ml-4 mt-1 mb-2 p-3 rounded-xl text-xs space-y-2 animate-fade-in" style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
                      <p style={{ color: "hsl(var(--foreground))" }}>{info.description}</p>
                      <div className="flex items-start gap-2">
                        <span className="font-bold flex-shrink-0" style={{ color: "hsl(var(--primary))" }}>Pins:</span>
                        <span style={{ color: "hsl(var(--muted-foreground))" }}>{info.pins}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Required Libraries */}
        <RequiredLibraries basicCode={project.basicCode} optimizedCode={project.optimizedCode} />

        {/* Arduino Setup Guide for Beginners */}
        <ArduinoSetupGuide />

        {/* Social / Like / Share bar */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => { setLiked(!liked); setLikeCount(prev => liked ? prev - 1 : prev + 1); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{
              background: liked ? "hsl(var(--destructive) / 0.15)" : "hsl(var(--muted))",
              color: liked ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))",
              border: `1px solid ${liked ? "hsl(var(--destructive) / 0.3)" : "hsl(var(--border))"}`,
            }}
          >
            <ThumbsUp size={14} fill={liked ? "currentColor" : "none"} /> {likeCount}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}
          >
            <Share2 size={14} /> Share
          </button>
        </div>

        {/* Tabs: Instructions | Code | Simulate */}
        <div className="flex items-center justify-between mb-4">
          <div
            className="flex items-center rounded-xl overflow-hidden border"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            {([
              { id: "instructions" as ActiveTab, label: "Instructions", icon: "≡" },
              { id: "code" as ActiveTab, label: "Code", icon: "</>" },
              { id: "simulate" as ActiveTab, label: "Simulate", icon: "▷" },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all"
                style={
                  activeTab === tab.id
                    ? { background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }
                    : { background: "transparent", color: "hsl(var(--muted-foreground))" }
                }
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate("/ide")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{ color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.4)" }}
          >
            <Code size={14} /> Open in IDE
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "instructions" && (
          <div
            className="rounded-2xl p-6 border"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
          >
            {/* Progress bar */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold" style={{ color: "hsl(var(--foreground))" }}>Step-by-Step Instructions</h3>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%`, background: progressPercent === 100 ? "hsl(var(--success))" : "hsl(var(--primary))" }} />
                </div>
                <span className="text-xs font-bold" style={{ color: progressPercent === 100 ? "hsl(var(--success))" : "hsl(var(--primary))" }}>
                  {stepProgress}/{totalSteps}
                </span>
              </div>
            </div>

            {/* Completion Checklist */}
            {(allStepsCompleted || codePassed || simulatorPassed) && (
              <div className="mb-4 p-4 rounded-xl space-y-2" style={{ background: completed ? "hsl(var(--success) / 0.06)" : "hsl(var(--muted) / 0.5)", border: `1px solid ${completed ? "hsl(var(--success) / 0.3)" : "hsl(var(--border))"}` }}>
                <p className="text-xs font-bold mb-2" style={{ color: completed ? "hsl(var(--success))" : "hsl(var(--foreground))" }}>
                  {completed ? "🎉 Project Complete!" : "📋 Completion Requirements"}
                </p>
                {completionChecks.map((check, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {check.done
                      ? <CheckCircle size={14} style={{ color: "hsl(var(--success))" }} />
                      : <div className="w-3.5 h-3.5 rounded-full border" style={{ borderColor: "hsl(var(--muted-foreground))" }} />
                    }
                    <span className="text-xs" style={{ color: check.done ? "hsl(var(--success))" : "hsl(var(--muted-foreground))" }}>{check.label}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              {project.instructions.map((inst, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer group"
                  style={{
                    background: checkedSteps[i] ? "hsl(var(--success) / 0.06)" : "transparent",
                    border: `1px solid ${checkedSteps[i] ? "hsl(var(--success) / 0.2)" : "transparent"}`,
                  }}
                  onClick={() => toggleStep(i)}
                >
                  <div className="flex-shrink-0 mt-0.5 transition-all group-hover:scale-110">
                    {checkedSteps[i] ? (
                      <CheckSquare size={20} style={{ color: "hsl(var(--success))" }} />
                    ) : (
                      <Square size={20} style={{ color: "hsl(var(--muted-foreground))" }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm transition-all ${checkedSteps[i] ? "line-through opacity-60" : ""}`} style={{ color: "hsl(var(--foreground))" }}>{inst}</p>
                    {/* Step note input */}
                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <input
                        value={activeNote[i] || ""}
                        onChange={(e) => {
                          e.stopPropagation();
                          setActiveNote(prev => ({ ...prev, [i]: e.target.value }));
                        }}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Add a note..."
                        className="w-full bg-transparent text-xs focus:outline-none px-2 py-1 rounded-lg"
                        style={{ color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}
                      />
                    </div>
                    {activeNote[i] && (
                      <p className="mt-1 text-xs italic flex items-center gap-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                        <MessageCircle size={10} /> {activeNote[i]}
                      </p>
                    )}
                  </div>
                  <span
                    className="text-xs font-bold flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      background: checkedSteps[i] ? "hsl(var(--success) / 0.15)" : "hsl(var(--primary) / 0.15)",
                      color: checkedSteps[i] ? "hsl(var(--success))" : "hsl(var(--primary))",
                    }}
                  >
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>

          </div>
        )}

        {activeTab === "code" && (
          <div className="space-y-4">
            {/* Run workflow indicator */}
            {runStep !== "idle" && (
              <div className="rounded-xl px-5 py-3 flex items-center gap-6 border" style={{ background: "hsl(var(--background))", borderColor: "hsl(var(--border))" }}>
                {(["compiling", "simulating"] as const).map((step, i) => {
                  const labels = ["Compiling", "Simulating"];
                  const stepOrder = ["compiling", "simulating"];
                  const stepIdx = stepOrder.indexOf(runStep);
                  const thisIdx = stepOrder.indexOf(step);
                  const isDone = runStep === "success" || stepIdx > thisIdx;
                  const isActive = step === runStep;
                  return (
                    <div key={step} className="flex items-center gap-2">
                      {isDone ? <CheckCircle size={16} style={{ color: "hsl(var(--success))" }} /> : isActive ? <Loader2 size={16} className="animate-spin" style={{ color: "hsl(var(--primary))" }} /> : <div className="w-4 h-4 rounded-full" style={{ background: "hsl(var(--muted))" }} />}
                      <span className="text-sm font-medium" style={{ color: isDone ? "hsl(var(--success))" : isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}>{labels[i]}</span>
                    </div>
                  );
                })}
                {runStep === "success" && (
                  <span className="font-bold text-sm animate-fade-in-up flex items-center gap-2" style={{ color: "hsl(var(--success))" }}>
                    <CheckCircle size={16} /> ✓ Compilation Successful! +{project.xp} XP
                  </span>
                )}
                {runStep === "error" && (
                  <div className="flex items-center gap-2">
                    <XCircle size={16} style={{ color: "hsl(var(--destructive))" }} />
                    <span className="font-bold text-sm" style={{ color: "hsl(var(--destructive))" }}>{errors.length} Error{errors.length !== 1 ? "s" : ""}</span>
                    <button
                      onClick={() => {
                        setShowDebugPanel(true);
                        if (debugMessages.length === 0) {
                          setDebugMessages([{ role: "ai", content: `🔍 I see ${errors.length} error(s) in your code. Let me help!\n\nFirst issue: "${errors[0]}"\n\nHint: Check for typos and missing syntax. Can you spot it?` }]);
                        }
                      }}
                      className="ml-2 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1"
                      style={{ background: "hsl(var(--purple) / 0.2)", color: "hsl(var(--purple))", border: "1px solid hsl(var(--purple) / 0.4)" }}
                    >
                      <Brain size={12} /> Debug with AI
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4">
              {/* Main code editor */}
              <div className="flex-1 rounded-2xl border overflow-hidden" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
                {/* Code toolbar */}
                <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "hsl(var(--border))" }}>
                  <div className="flex items-center gap-2">
                    {showSolution ? (
                      <>
                        <button onClick={() => setCodeMode("basic")} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all" style={codeMode === "basic" ? { background: "transparent", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" } : { background: "transparent", color: "hsl(var(--muted-foreground) / 0.6)" }}>
                          <Code size={13} /> Basic
                        </button>
                        <button onClick={() => setCodeMode("optimized")} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all" style={codeMode === "optimized" ? { background: "hsl(var(--success))", color: "white" } : { background: "transparent", color: "hsl(var(--muted-foreground) / 0.6)" }}>
                          <Sparkles size={13} /> Optimized
                        </button>
                      </>
                    ) : (
                      <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: "hsl(var(--warning))" }}>
                        <Sparkles size={14} /> Starter Template — Try it yourself first!
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!showSolution && (
                      <>
                        <button onClick={() => saveSnapshot()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105" style={{ color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.3)" }}>
                          <Save size={12} /> Save Snapshot
                        </button>
                        <button onClick={() => setShowVersionPanel(!showVersionPanel)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105" style={{ background: showVersionPanel ? "hsl(var(--primary) / 0.15)" : "transparent", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.3)" }}>
                          <History size={12} /> History{codeVersions.length > 0 ? ` (${codeVersions.length})` : ""}
                        </button>
                        <button onClick={() => { setUserCode(starterTemplate); setRunStep("idle"); setErrors([]); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105" style={{ color: "hsl(var(--destructive))", border: "1px solid hsl(var(--destructive) / 0.3)" }}>
                          <RefreshCw size={12} /> Reset
                        </button>
                      </>
                    )}
                    <button onClick={handleRevealSolution} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105" style={showSolution ? { background: "hsl(var(--destructive) / 0.15)", color: "hsl(var(--destructive))", border: "1px solid hsl(var(--destructive) / 0.3)" } : { background: "hsl(var(--purple) / 0.15)", color: "hsl(var(--purple))", border: "1px solid hsl(var(--purple) / 0.3)" }}>
                      {showSolution ? "Hide Solution" : "🔓 Reveal Solution"}
                    </button>
                    <ExplainCode code={currentCode} />
                    <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105" style={{ color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}>
                      <Copy size={12} /> Copy
                    </button>
                    <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105" style={{ color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}>
                      <Download size={12} /> .ino
                    </button>
                  </div>
                </div>

                {/* Version History Panel */}
                {showVersionPanel && !showSolution && (
                  <div className="border-b px-5 py-3 space-y-2 animate-fade-in" style={{ background: "hsl(var(--primary) / 0.04)", borderColor: "hsl(var(--primary) / 0.2)" }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: "hsl(var(--primary))" }}><History size={12} /> Version History</span>
                      <button onClick={() => setShowVersionPanel(false)} className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>✕</button>
                    </div>
                    {codeVersions.length === 0 ? (
                      <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>No snapshots yet. Click "Save Snapshot" to create one.</p>
                    ) : (
                      <div className="max-h-40 overflow-y-auto space-y-1.5">
                        {codeVersions.map((v, i) => (
                          <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
                            <div>
                              <p className="text-xs font-semibold" style={{ color: "hsl(var(--foreground))" }}>{v.label}</p>
                              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{new Date(v.timestamp).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-1.5">
                              <button onClick={() => revertToVersion(i)} className="px-2 py-1 rounded text-xs font-bold transition-all hover:scale-105 text-primary border border-primary/30">
                                <RotateCcw size={10} className="inline mr-1" />Revert
                              </button>
                              <button onClick={() => deleteVersion(i)} className="px-2 py-1 rounded text-xs transition-all hover:scale-105 text-destructive" title="Delete version" aria-label="Delete version">
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* File tab */}
                <div className="flex items-center gap-2 px-4 py-1.5 border-b text-xs" style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--background))", color: "hsl(var(--muted-foreground))" }}>
                  <span style={{ color: "hsl(var(--primary))" }}>sketch.ino</span>
                  <span>•</span>
                  <span>Arduino Uno</span>
                  <span className="ml-2">|</span>
                  <button
                    onClick={serialConnected ? disconnectSerial : connectSerial}
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded border transition-all cursor-pointer"
                    style={{
                      background: serialConnected ? "hsl(var(--success) / 0.15)" : "transparent",
                      color: serialConnected ? "hsl(var(--success))" : "hsl(var(--muted-foreground))",
                      borderColor: serialConnected ? "hsl(var(--success) / 0.3)" : "hsl(var(--border))"
                    }}
                  >
                    {serialConnected ? "🔌 Connected" : "🔌 Connect Board"}
                  </button>
                  {serialConnected && (
                    <button
                      onClick={uploadToBoard}
                      disabled={uploading}
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-border text-muted-foreground hover:bg-muted transition-all cursor-pointer ml-1"
                    >
                      {uploading ? "Uploading..." : "📤 Upload"}
                    </button>
                  )}
                  <button
                    onClick={() => setShowSerialConsole(!showSerialConsole)}
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-border text-muted-foreground hover:bg-muted transition-all cursor-pointer ml-1"
                  >
                    📟 Serial {serialLogs.length > 0 && `(${serialLogs.length})`}
                  </button>
                  {!showSolution && <span className="ml-auto" style={{ color: "hsl(var(--success))" }}>✎ Editable</span>}
                </div>

                {/* Code area - editable or read-only */}
                <div className="relative flex flex-col overflow-hidden">
                  {showSolution ? (
                    <CodeEditor key="solution" code={currentCode} readOnly maxHeight="500px" minHeight="300px" />
                  ) : (
                    <CodeEditor key={`user-v${revertCount}`} code={userCode} onChange={setUserCode} maxHeight="500px" minHeight="400px" />
                  )}
                  {showSerialConsole && (
                    <div className="h-36 border-t flex flex-col overflow-hidden bg-background" style={{ borderColor: "hsl(var(--border))" }}>
                      <div className="flex items-center justify-between px-4 py-1.5 border-b text-[10px] font-mono" style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                        <span className="text-foreground font-bold">📟 Serial Monitor (9600 baud)</span>
                        <div className="flex gap-2">
                          <button onClick={clearLogs} className="hover:text-foreground transition-all">Clear Logs</button>
                          <button onClick={() => setShowSerialConsole(false)} className="hover:text-foreground transition-all">✕</button>
                        </div>
                      </div>
                      <div className="flex-1 p-3 overflow-y-auto font-mono text-[9px] space-y-1 text-success">
                        {serialLogs.length === 0 ? (
                          <span className="text-muted-foreground italic">No output. Verify connection and upload code.</span>
                        ) : (
                          serialLogs.map((log, idx) => (
                            <div key={idx} className="whitespace-pre-wrap">{log}</div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Error panel */}
                {errors.length > 0 && (
                  <div className="border-t p-4 animate-fade-in" style={{ background: "hsl(var(--destructive) / 0.08)", borderColor: "hsl(var(--destructive) / 0.3)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={14} style={{ color: "hsl(var(--destructive))" }} />
                      <span className="font-bold text-sm" style={{ color: "hsl(var(--destructive))" }}>Errors</span>
                    </div>
                    {errors.map((err, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs font-mono p-2 rounded-lg mb-1" style={{ background: "hsl(var(--destructive) / 0.1)", color: "hsl(var(--destructive))" }}>
                        <XCircle size={12} className="flex-shrink-0 mt-0.5" /> {err}
                      </div>
                    ))}
                  </div>
                )}

                {/* Run & action bar */}
                <div className="flex items-center gap-3 px-5 py-3 border-t" style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--background))" }}>
                  <button
                    onClick={runAndCheck}
                    disabled={runStep === "compiling" || runStep === "simulating"}
                    className="px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-60"
                    style={{ background: "hsl(var(--success))", color: "white", boxShadow: "0 0 15px hsl(var(--success) / 0.3)" }}
                  >
                    {runStep === "compiling" || runStep === "simulating" ? <><Loader2 size={14} className="animate-spin" /> Running...</> : <><Play size={14} /> ▶ Run & Check</>}
                  </button>
                  <button
                    onClick={() => {
                      setShowDebugPanel(true);
                      if (debugMessages.length === 0) {
                        setDebugMessages([{ role: "ai", content: `👋 Hi! I can see your code for "${project.title}". I can:\n\n• **Debug errors** after you run\n• **Review your code** for improvements\n• **Give hints** on the TODO sections\n\nWhat would you like help with?` }]);
                      }
                    }}
                    className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:scale-105"
                    style={{ background: "hsl(var(--purple) / 0.15)", color: "hsl(var(--purple))", border: "1px solid hsl(var(--purple) / 0.3)" }}
                  >
                    <Brain size={14} /> AI Debug
                  </button>
                  <button
                    onClick={() => {
                      setShowDebugPanel(true);
                      submitDebugQuery("Review my code and suggest improvements");
                    }}
                    className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:scale-105"
                    style={{ color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.3)" }}
                  >
                    <Eye size={14} /> AI Review
                  </button>
                </div>
              </div>

              {/* AI Debug Side Panel */}
              {showDebugPanel && (
                <div className="w-72 rounded-2xl border flex flex-col overflow-hidden animate-fade-in flex-shrink-0" style={{ background: "hsl(var(--background))", borderColor: "hsl(var(--purple) / 0.3)", maxHeight: "620px" }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "hsl(var(--purple) / 0.2)", background: "hsl(var(--purple) / 0.1)" }}>
                    <div className="flex items-center gap-2">
                      <Brain size={14} style={{ color: "hsl(var(--purple))" }} />
                      <span className="font-bold text-sm" style={{ color: "hsl(var(--foreground))" }}>AI Assistant</span>
                    </div>
                    <button onClick={() => setShowDebugPanel(false)} className="text-xs px-2 py-0.5 rounded" style={{ color: "hsl(var(--muted-foreground))" }}>✕</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ minHeight: 0 }}>
                    {debugMessages.map((msg, i) => (
                      <div key={i} className={`p-2.5 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "ml-4" : ""}`} style={{ background: msg.role === "ai" ? "hsl(var(--purple) / 0.1)" : "hsl(var(--primary) / 0.1)", border: `1px solid ${msg.role === "ai" ? "hsl(var(--purple) / 0.25)" : "hsl(var(--primary) / 0.25)"}`, color: msg.role === "ai" ? "hsl(var(--foreground))" : "hsl(var(--primary))" }}>
                        {msg.role === "ai" && <span className="text-xs font-bold block mb-1" style={{ color: "hsl(var(--purple))" }}>🧠 AI</span>}
                        {msg.content}
                      </div>
                    ))}
                    {aiTyping && (
                      <div className="p-2.5 rounded-xl flex items-center gap-1 bg-brand-purple/10 border border-brand-purple/25">
                        <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-brand-purple" />
                        <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-brand-purple [animation-delay:0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-brand-purple [animation-delay:0.3s]" />
                      </div>
                    )}
                    <div ref={debugBottomRef} />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2.5 border-t border-brand-purple/20 bg-background">
                    <input value={debugInput} onChange={(e) => setDebugInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendDebugMessage()} placeholder="Ask about your code..." className="flex-1 bg-transparent text-xs focus:outline-none text-foreground" />
                    <button onClick={sendDebugMessage} disabled={!debugInput.trim()} className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-40 bg-brand-purple" title="Send message" aria-label="Send message">
                      <Sparkles size={10} color="#fff" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "simulate" && (
          <div
            className={`rounded-2xl border overflow-hidden transition-all duration-300 ${simExpanded ? "fixed inset-4 z-50" : ""}`}
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: "hsl(var(--border))" }}>
              <span className="text-sm font-semibold" style={{ color: "hsl(var(--primary))" }}>Wokwi Simulator</span>
              <button
                onClick={() => setSimExpanded(!simExpanded)}
                className="px-3 py-1 rounded-lg text-xs font-bold transition-all hover:scale-105"
                style={{ color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}
              >
                {simExpanded ? "Minimize" : "Expand"}
              </button>
            </div>
            <div className="relative" style={{ paddingTop: simExpanded ? "0" : "56.25%", height: simExpanded ? "calc(100% - 44px)" : undefined }}>
              <iframe
                src={getWokwiUrl(projectId)}
                className={simExpanded ? "w-full h-full" : "absolute inset-0 w-full h-full"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                style={{ border: "none" }}
                title="Wokwi Simulator"
              />
            </div>
          </div>
        )}
        {simExpanded && <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setSimExpanded(false)} />}
      </div>

      {/* Toasts */}
      {copyToast && (
        <div
          className="fixed bottom-6 right-6 px-5 py-3 rounded-xl flex items-center gap-2 font-semibold animate-fade-in z-50"
          style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", boxShadow: "0 0 20px hsl(var(--primary) / 0.4)" }}
        >
          <Copy size={16} /> Code copied to clipboard!
        </div>
      )}
      {shareToast && (
        <div
          className="fixed bottom-6 right-6 px-5 py-3 rounded-xl flex items-center gap-2 font-semibold animate-fade-in z-50"
          style={{ background: "hsl(var(--purple))", color: "white", boxShadow: "0 0 20px hsl(var(--purple) / 0.4)" }}
        >
          <Share2 size={16} /> Link copied to clipboard!
        </div>
      )}
    </Layout>
  );
}
