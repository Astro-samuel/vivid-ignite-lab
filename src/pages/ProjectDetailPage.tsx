import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { toast as sonnerToast } from "sonner";
import { ArrowLeft, Clock, Zap, CheckCircle, Settings, Code, Play, Copy, Download, Sparkles, Save, Loader2, XCircle, AlertTriangle, Brain, Eye, RefreshCw, ChevronDown, ChevronUp, BookOpen, Lightbulb, Award, Info, ExternalLink, CheckSquare, Square, Star, MessageCircle, ThumbsUp, Share2, History, RotateCcw, Trash2 } from "lucide-react";
import ExplainCode from "@/components/ExplainCode";
import CodeEditor from "@/components/CodeEditor";
import RequiredLibraries from "@/components/RequiredLibraries";
import ArduinoSetupGuide from "@/components/ArduinoSetupGuide";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProjects } from "@/hooks/useUserProjects";

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

  const getAIDebugResponse = (input: string): string => {
    const lower = input.toLowerCase();
    const code = showSolution ? currentCode : userCode;

    if (lower.includes("review") || lower.includes("improve") || lower.includes("suggestion") || lower.includes("look at")) {
      if (code.includes("delay(") && !code.includes("millis(")) {
        return "📝 I see you're using `delay()` which blocks execution. Consider using `millis()` for non-blocking timing — this lets your Arduino do other things while waiting. Want me to explain how?";
      }
      if (!code.includes("Serial.begin")) {
        return "📝 I'd suggest adding `Serial.begin(9600)` in setup() and some `Serial.print()` calls in loop(). It's the easiest way to debug and see what your values are!";
      }
      return "📝 Your code structure looks solid! A few suggestions:\n• Add comments explaining key logic\n• Consider edge cases (what if sensor returns 0?)\n• Use `constrain()` to keep values in safe ranges";
    }
    if (lower.includes("error") || lower.includes("fix") || lower.includes("wrong") || lower.includes("help")) {
      if (errors.length > 0) {
        return `🔍 I see ${errors.length} issue(s). Let's tackle the first one:\n\n"${errors[0]}"\n\nHint: Check for typos in function names and make sure every statement ends with a semicolon. Can you spot the issue?`;
      }
      return "🔍 Try clicking 'Run & Check' first so I can see what errors come up. Then I can help you debug step by step!";
    }
    if (lower.includes("todo") || lower.includes("start") || lower.includes("begin") || lower.includes("how")) {
      return `🧩 Great question! For "${project.title}", start with setup():\n\n1. Use \`pinMode(pin, OUTPUT)\` for each output device\n2. Use \`Serial.begin(9600)\` so you can debug\n\nThen in loop(), think about what needs to happen repeatedly. What sensor are you reading?`;
    }
    return "🤔 I'm here to help! Try asking me to:\n• **Review your code** for improvements\n• **Debug errors** after running\n• **Explain a concept** like PWM, analogRead, etc.\n• Help you **get started** with the TODO sections";
  };

  const sendDebugMessage = () => {
    if (!debugInput.trim()) return;
    const msg = debugInput.trim();
    setDebugInput("");
    setDebugMessages((prev) => [...prev, { role: "user", content: msg }]);
    setAiTyping(true);
    setTimeout(() => {
      setAiTyping(false);
      setDebugMessages((prev) => [...prev, { role: "ai", content: getAIDebugResponse(msg) }]);
      setTimeout(() => debugBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }, 800 + Math.random() * 500);
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
      ? { background: "rgba(0,255,136,0.15)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)" }
      : project.difficulty === "intermediate"
      ? { background: "rgba(255,165,0,0.15)", color: "#FFA500", border: "1px solid rgba(255,165,0,0.3)" }
      : { background: "rgba(183,68,255,0.15)", color: "#B744FF", border: "1px solid rgba(183,68,255,0.3)" };

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
                style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-deep)))", color: "hsl(var(--primary-foreground))" }}
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
          style={{ color: "#00F5FF" }}
        >
          <ArrowLeft size={16} /> {generatedProject?.source === "think-bigger" ? "Back to Think Bigger" : generatedProject?.source === "dashboard" ? "Back to Dashboard" : generatedProject?.source === "catalog" ? "Back to Catalog" : generatedProject ? "Back to Generate" : "Back to Catalog"}
        </button>

        {/* Project Header */}
        <div className="flex items-start gap-5 mb-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
            style={{ background: "hsl(229, 45%, 16%)", border: "1px solid hsl(229, 42%, 28%)" }}
          >
            {project.emoji}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: "#FFFFFF" }}>{project.title}</h1>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "#A0AED9" }}>{project.desc}</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-xs px-3 py-1 rounded-full font-semibold capitalize" style={diffBadgeStyle}>
                    {project.difficulty}
                  </span>
                  <span className="flex items-center gap-1 text-sm" style={{ color: "#A0AED9" }}>
                    <Clock size={14} /> {project.time}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-bold" style={{ color: "#FFD700" }}>
                    <Zap size={14} /> +{project.xp} XP
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {completed ? (
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                    style={{ background: "rgba(0,255,136,0.1)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)" }}
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
                      style={{ background: "rgba(0,245,255,0.1)", color: "#00F5FF", border: "1px solid rgba(0,245,255,0.3)", opacity: saving ? 0.7 : 1 }}
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
          style={{ background: "linear-gradient(135deg, hsl(229, 45%, 14%), hsl(260, 40%, 16%))", borderColor: "hsl(260, 42%, 28%)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={16} style={{ color: "#FFD700" }} />
            <span className="font-bold text-sm" style={{ color: "#FFD700" }}>What You'll Learn</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {learningConcepts.map((concept) => (
              <button
                key={concept}
                onClick={() => setShowConceptDetails(showConceptDetails === concept ? null : concept)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105 cursor-pointer"
                style={{
                  background: showConceptDetails === concept ? "rgba(255,215,0,0.2)" : "hsl(260, 35%, 20%)",
                  color: showConceptDetails === concept ? "#FFD700" : "#E0E7FF",
                  border: `1px solid ${showConceptDetails === concept ? "rgba(255,215,0,0.4)" : "hsl(260, 35%, 30%)"}`,
                }}
              >
                <BookOpen size={12} className="inline mr-1.5" />
                {concept}
              </button>
            ))}
          </div>
          {showConceptDetails && (
            <div className="mt-3 p-3 rounded-xl text-xs leading-relaxed animate-fade-in" style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)", color: "#E0E7FF" }}>
              <strong style={{ color: "#FFD700" }}>{showConceptDetails}</strong>
              <p className="mt-1">This concept is covered in the code. Look for related functions and experiment with different values to deepen your understanding.</p>
            </div>
          )}
        </div>

        {/* Components Required - Interactive */}
        <div
          className="rounded-2xl p-5 border mb-6"
          style={{ background: "hsl(229, 45%, 14%)", borderColor: "hsl(229, 42%, 26%)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Settings size={16} style={{ color: "#00F5FF" }} />
            <span className="font-bold text-sm" style={{ color: "#00F5FF" }}>Components Required</span>
            <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ background: "rgba(0,245,255,0.1)", color: "#00F5FF" }}>
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
                      background: isExpanded ? "hsl(229, 42%, 22%)" : "hsl(229, 42%, 18%)",
                      color: "#E0E7FF",
                      border: `1px solid ${isExpanded ? "rgba(0,245,255,0.3)" : "hsl(229, 42%, 28%)"}`,
                    }}
                  >
                    <span className="text-lg">{info?.tipIcon || "🔧"}</span>
                    <span className="flex-1 text-left">{c}</span>
                    {info && (
                      <Info size={14} style={{ color: isExpanded ? "#00F5FF" : "#A0AED9" }} />
                    )}
                    {info && (isExpanded ? <ChevronUp size={14} style={{ color: "#A0AED9" }} /> : <ChevronDown size={14} style={{ color: "#A0AED9" }} />)}
                  </button>
                  {isExpanded && info && (
                    <div className="ml-4 mt-1 mb-2 p-3 rounded-xl text-xs space-y-2 animate-fade-in" style={{ background: "hsl(229, 42%, 15%)", border: "1px solid hsl(229, 42%, 25%)" }}>
                      <p style={{ color: "#E0E7FF" }}>{info.description}</p>
                      <div className="flex items-start gap-2">
                        <span className="font-bold flex-shrink-0" style={{ color: "#00F5FF" }}>Pins:</span>
                        <span style={{ color: "#A0AED9" }}>{info.pins}</span>
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
              background: liked ? "rgba(255,69,0,0.15)" : "hsl(229, 42%, 18%)",
              color: liked ? "#FF4500" : "#A0AED9",
              border: `1px solid ${liked ? "rgba(255,69,0,0.3)" : "hsl(229, 42%, 28%)"}`,
            }}
          >
            <ThumbsUp size={14} fill={liked ? "currentColor" : "none"} /> {likeCount}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{ background: "hsl(229, 42%, 18%)", color: "#A0AED9", border: "1px solid hsl(229, 42%, 28%)" }}
          >
            <Share2 size={14} /> Share
          </button>
        </div>

        {/* Tabs: Instructions | Code | Simulate */}
        <div className="flex items-center justify-between mb-4">
          <div
            className="flex items-center rounded-xl overflow-hidden border"
            style={{ borderColor: "hsl(229, 42%, 26%)" }}
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
                    ? { background: "#00F5FF", color: "#0A0E27" }
                    : { background: "transparent", color: "#A0AED9" }
                }
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate("/ide")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{ color: "#00F5FF", border: "1px solid rgba(0,245,255,0.4)" }}
          >
            <Code size={14} /> Open in IDE
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "instructions" && (
          <div
            className="rounded-2xl p-6 border"
            style={{ background: "hsl(229, 45%, 14%)", borderColor: "hsl(229, 42%, 26%)" }}
          >
            {/* Progress bar */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold" style={{ color: "#FFFFFF" }}>Step-by-Step Instructions</h3>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 rounded-full overflow-hidden" style={{ background: "hsl(229, 42%, 22%)" }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%`, background: progressPercent === 100 ? "linear-gradient(90deg, #00FF88, #00C853)" : "linear-gradient(90deg, #00F5FF, #0099FF)" }} />
                </div>
                <span className="text-xs font-bold" style={{ color: progressPercent === 100 ? "#00FF88" : "#00F5FF" }}>
                  {stepProgress}/{totalSteps}
                </span>
              </div>
            </div>

            {/* Completion Checklist */}
            {(allStepsCompleted || codePassed || simulatorPassed) && (
              <div className="mb-4 p-4 rounded-xl space-y-2" style={{ background: completed ? "rgba(0,255,136,0.06)" : "hsl(var(--muted) / 0.5)", border: `1px solid ${completed ? "rgba(0,255,136,0.3)" : "hsl(var(--border))"}` }}>
                <p className="text-xs font-bold mb-2" style={{ color: completed ? "#00FF88" : "hsl(var(--foreground))" }}>
                  {completed ? "🎉 Project Complete!" : "📋 Completion Requirements"}
                </p>
                {completionChecks.map((check, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {check.done
                      ? <CheckCircle size={14} style={{ color: "#00FF88" }} />
                      : <div className="w-3.5 h-3.5 rounded-full border" style={{ borderColor: "hsl(var(--muted-foreground))" }} />
                    }
                    <span className="text-xs" style={{ color: check.done ? "#00FF88" : "hsl(var(--muted-foreground))" }}>{check.label}</span>
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
                    background: checkedSteps[i] ? "rgba(0,255,136,0.06)" : "transparent",
                    border: `1px solid ${checkedSteps[i] ? "rgba(0,255,136,0.2)" : "transparent"}`,
                  }}
                  onClick={() => toggleStep(i)}
                >
                  <div className="flex-shrink-0 mt-0.5 transition-all group-hover:scale-110">
                    {checkedSteps[i] ? (
                      <CheckSquare size={20} style={{ color: "#00FF88" }} />
                    ) : (
                      <Square size={20} style={{ color: "#A0AED9" }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm transition-all ${checkedSteps[i] ? "line-through opacity-60" : ""}`} style={{ color: "#E0E7FF" }}>{inst}</p>
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
                        style={{ color: "#A0AED9", border: "1px solid hsl(229, 42%, 25%)" }}
                      />
                    </div>
                    {activeNote[i] && (
                      <p className="mt-1 text-xs italic flex items-center gap-1" style={{ color: "#A0AED9" }}>
                        <MessageCircle size={10} /> {activeNote[i]}
                      </p>
                    )}
                  </div>
                  <span
                    className="text-xs font-bold flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      background: checkedSteps[i] ? "rgba(0,255,136,0.15)" : "rgba(0,245,255,0.15)",
                      color: checkedSteps[i] ? "#00FF88" : "#00F5FF",
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
              <div className="rounded-xl px-5 py-3 flex items-center gap-6 border" style={{ background: "hsl(232, 42%, 11%)", borderColor: "hsl(232, 40%, 16%)" }}>
                {(["compiling", "simulating"] as const).map((step, i) => {
                  const labels = ["Compiling", "Simulating"];
                  const stepOrder = ["compiling", "simulating"];
                  const stepIdx = stepOrder.indexOf(runStep);
                  const thisIdx = stepOrder.indexOf(step);
                  const isDone = runStep === "success" || stepIdx > thisIdx;
                  const isActive = step === runStep;
                  return (
                    <div key={step} className="flex items-center gap-2">
                      {isDone ? <CheckCircle size={16} style={{ color: "#00FF88" }} /> : isActive ? <Loader2 size={16} className="animate-spin" style={{ color: "#00F5FF" }} /> : <div className="w-4 h-4 rounded-full" style={{ background: "hsl(228, 25%, 30%)" }} />}
                      <span className="text-sm font-medium" style={{ color: isDone ? "#00FF88" : isActive ? "#00F5FF" : "hsl(228, 25%, 50%)" }}>{labels[i]}</span>
                    </div>
                  );
                })}
                {runStep === "success" && (
                  <span className="font-bold text-sm animate-fade-in-up flex items-center gap-2" style={{ color: "#00FF88" }}>
                    <CheckCircle size={16} /> ✓ Compilation Successful! +{project.xp} XP
                  </span>
                )}
                {runStep === "error" && (
                  <div className="flex items-center gap-2">
                    <XCircle size={16} style={{ color: "#FF4500" }} />
                    <span className="font-bold text-sm" style={{ color: "#FF4500" }}>{errors.length} Error{errors.length !== 1 ? "s" : ""}</span>
                    <button
                      onClick={() => {
                        setShowDebugPanel(true);
                        if (debugMessages.length === 0) {
                          setDebugMessages([{ role: "ai", content: `🔍 I see ${errors.length} error(s) in your code. Let me help!\n\nFirst issue: "${errors[0]}"\n\nHint: Check for typos and missing syntax. Can you spot it?` }]);
                        }
                      }}
                      className="ml-2 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1"
                      style={{ background: "rgba(183,68,255,0.2)", color: "#B744FF", border: "1px solid rgba(183,68,255,0.4)" }}
                    >
                      <Brain size={12} /> Debug with AI
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4">
              {/* Main code editor */}
              <div className="flex-1 rounded-2xl border overflow-hidden" style={{ background: "hsl(229, 45%, 14%)", borderColor: "hsl(229, 42%, 26%)" }}>
                {/* Code toolbar */}
                <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "hsl(229, 42%, 22%)" }}>
                  <div className="flex items-center gap-2">
                    {showSolution ? (
                      <>
                        <button onClick={() => setCodeMode("basic")} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all" style={codeMode === "basic" ? { background: "transparent", color: "#A0AED9", border: "1px solid hsl(229, 42%, 30%)" } : { background: "transparent", color: "hsl(226, 35%, 50%)" }}>
                          <Code size={13} /> Basic
                        </button>
                        <button onClick={() => setCodeMode("optimized")} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all" style={codeMode === "optimized" ? { background: "linear-gradient(135deg, #00FF88, #00C853)", color: "#0A0E27" } : { background: "transparent", color: "hsl(226, 35%, 50%)" }}>
                          <Sparkles size={13} /> Optimized
                        </button>
                      </>
                    ) : (
                      <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#FFD700" }}>
                        <Sparkles size={14} /> Starter Template — Try it yourself first!
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!showSolution && (
                      <button onClick={() => { setUserCode(starterTemplate); setRunStep("idle"); setErrors([]); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105" style={{ color: "#FF4500", border: "1px solid rgba(255,69,0,0.3)" }}>
                        <RefreshCw size={12} /> Reset
                      </button>
                    )}
                    <button onClick={handleRevealSolution} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105" style={showSolution ? { background: "rgba(255,69,0,0.15)", color: "#FF4500", border: "1px solid rgba(255,69,0,0.3)" } : { background: "rgba(183,68,255,0.15)", color: "#B744FF", border: "1px solid rgba(183,68,255,0.3)" }}>
                      {showSolution ? "Hide Solution" : "🔓 Reveal Solution"}
                    </button>
                    <ExplainCode code={currentCode} />
                    <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105" style={{ color: "#A0AED9", border: "1px solid hsl(229, 42%, 30%)" }}>
                      <Copy size={12} /> Copy
                    </button>
                    <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105" style={{ color: "#A0AED9", border: "1px solid hsl(229, 42%, 30%)" }}>
                      <Download size={12} /> .ino
                    </button>
                  </div>
                </div>

                {/* File tab */}
                <div className="flex items-center gap-2 px-4 py-1.5 border-b text-xs" style={{ borderColor: "hsl(229, 42%, 22%)", background: "hsl(232, 48%, 6%)", color: "hsl(228, 25%, 60%)" }}>
                  <span style={{ color: "#00F5FF" }}>sketch.ino</span>
                  <span>•</span>
                  <span>Arduino Uno</span>
                  {!showSolution && <span className="ml-auto" style={{ color: "#00FF88" }}>✎ Editable</span>}
                </div>

                {/* Code area - editable or read-only */}
                {showSolution ? (
                  <CodeEditor code={currentCode} readOnly maxHeight="500px" minHeight="300px" />
                ) : (
                  <CodeEditor code={userCode} onChange={setUserCode} maxHeight="500px" minHeight="400px" />
                )}

                {/* Error panel */}
                {errors.length > 0 && (
                  <div className="border-t p-4 animate-fade-in" style={{ background: "rgba(255,69,0,0.08)", borderColor: "rgba(255,69,0,0.3)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={14} style={{ color: "#FF4500" }} />
                      <span className="font-bold text-sm" style={{ color: "#FF4500" }}>Errors</span>
                    </div>
                    {errors.map((err, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs font-mono p-2 rounded-lg mb-1" style={{ background: "rgba(255,69,0,0.1)", color: "#FF6B35" }}>
                        <XCircle size={12} className="flex-shrink-0 mt-0.5" /> {err}
                      </div>
                    ))}
                  </div>
                )}

                {/* Run & action bar */}
                <div className="flex items-center gap-3 px-5 py-3 border-t" style={{ borderColor: "hsl(229, 42%, 22%)", background: "hsl(232, 42%, 11%)" }}>
                  <button
                    onClick={runAndCheck}
                    disabled={runStep === "compiling" || runStep === "simulating"}
                    className="px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #00FF88, #00C853)", color: "#0A0E27", boxShadow: "0 0 15px rgba(0,255,136,0.3)" }}
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
                    style={{ background: "rgba(183,68,255,0.15)", color: "#B744FF", border: "1px solid rgba(183,68,255,0.3)" }}
                  >
                    <Brain size={14} /> AI Debug
                  </button>
                  <button
                    onClick={() => {
                      setShowDebugPanel(true);
                      setDebugMessages((prev) => [...prev, { role: "user", content: "Review my code and suggest improvements" }]);
                      setAiTyping(true);
                      setTimeout(() => {
                        setAiTyping(false);
                        setDebugMessages((prev) => [...prev, { role: "ai", content: getAIDebugResponse("review improve suggestion") }]);
                      }, 1000);
                    }}
                    className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:scale-105"
                    style={{ color: "#00F5FF", border: "1px solid rgba(0,245,255,0.3)" }}
                  >
                    <Eye size={14} /> AI Review
                  </button>
                </div>
              </div>

              {/* AI Debug Side Panel */}
              {showDebugPanel && (
                <div className="w-72 rounded-2xl border flex flex-col overflow-hidden animate-fade-in flex-shrink-0" style={{ background: "hsl(232, 42%, 11%)", borderColor: "rgba(183,68,255,0.3)", maxHeight: "620px" }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(183,68,255,0.2)", background: "linear-gradient(135deg, rgba(183,68,255,0.15), rgba(255,20,147,0.05))" }}>
                    <div className="flex items-center gap-2">
                      <Brain size={14} style={{ color: "#B744FF" }} />
                      <span className="font-bold text-sm" style={{ color: "#FFFFFF" }}>AI Assistant</span>
                    </div>
                    <button onClick={() => setShowDebugPanel(false)} className="text-xs px-2 py-0.5 rounded" style={{ color: "#A0AED9" }}>✕</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ minHeight: 0 }}>
                    {debugMessages.map((msg, i) => (
                      <div key={i} className={`p-2.5 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "ml-4" : ""}`} style={{ background: msg.role === "ai" ? "rgba(183,68,255,0.1)" : "rgba(0,245,255,0.1)", border: `1px solid ${msg.role === "ai" ? "rgba(183,68,255,0.25)" : "rgba(0,245,255,0.25)"}`, color: msg.role === "ai" ? "#E0E7FF" : "#00F5FF" }}>
                        {msg.role === "ai" && <span className="text-xs font-bold block mb-1" style={{ color: "#B744FF" }}>🧠 AI</span>}
                        {msg.content}
                      </div>
                    ))}
                    {aiTyping && (
                      <div className="p-2.5 rounded-xl flex items-center gap-1" style={{ background: "rgba(183,68,255,0.1)", border: "1px solid rgba(183,68,255,0.25)" }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#B744FF" }} />
                        <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#B744FF", animationDelay: "0.15s" }} />
                        <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#B744FF", animationDelay: "0.3s" }} />
                      </div>
                    )}
                    <div ref={debugBottomRef} />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2.5 border-t" style={{ borderColor: "rgba(183,68,255,0.2)", background: "hsl(229, 48%, 10%)" }}>
                    <input value={debugInput} onChange={(e) => setDebugInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendDebugMessage()} placeholder="Ask about your code..." className="flex-1 bg-transparent text-xs focus:outline-none" style={{ color: "#FFFFFF" }} />
                    <button onClick={sendDebugMessage} disabled={!debugInput.trim()} className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-40" style={{ background: "linear-gradient(135deg, #B744FF, #FF1493)" }}>
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
            style={{ background: "hsl(229, 45%, 14%)", borderColor: "hsl(229, 42%, 26%)" }}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: "hsl(229, 42%, 22%)" }}>
              <span className="text-sm font-semibold" style={{ color: "#00F5FF" }}>Wokwi Simulator</span>
              <button
                onClick={() => setSimExpanded(!simExpanded)}
                className="px-3 py-1 rounded-lg text-xs font-bold transition-all hover:scale-105"
                style={{ color: "#A0AED9", border: "1px solid hsl(229, 42%, 30%)" }}
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
          style={{ background: "linear-gradient(135deg, #00F5FF, #0099FF)", color: "#0A0E27", boxShadow: "0 0 20px rgba(0,245,255,0.4)" }}
        >
          <Copy size={16} /> Code copied to clipboard!
        </div>
      )}
      {shareToast && (
        <div
          className="fixed bottom-6 right-6 px-5 py-3 rounded-xl flex items-center gap-2 font-semibold animate-fade-in z-50"
          style={{ background: "linear-gradient(135deg, #B744FF, #FF1493)", color: "#FFFFFF", boxShadow: "0 0 20px rgba(183,68,255,0.4)" }}
        >
          <Share2 size={16} /> Link copied to clipboard!
        </div>
      )}
    </Layout>
  );
}
