import { useState, useRef } from "react";
import { ArrowLeft, Clock, Zap, CheckCircle, Settings, Code, Play, Copy, Download, Sparkles, Save, Loader2, XCircle, AlertTriangle, Brain, Eye, RefreshCw } from "lucide-react";
import ExplainCode from "@/components/ExplainCode";
import InteractiveSchematic from "@/components/InteractiveSchematic";
import Layout from "@/components/Layout";
import { useNavigate, useParams } from "react-router-dom";

const allProjects = [
  {
    id: 1, emoji: "💡", title: "LED Blink Tutorial",
    desc: "The classic 'Hello World' of Arduino — make an LED blink! Learn the basics of digital output, timing, and circuit fundamentals.",
    difficulty: "beginner", time: "15 mins", xp: 50,
    components: ["Arduino Uno", "LED (Red)", "Resistor (220Ω)", "Breadboard", "Jumper Wires"],
    instructions: [
      "Connect the LED's anode (long leg) to a 220Ω resistor, then to pin 13",
      "Connect the LED's cathode (short leg) to GND",
      "Upload the code and watch it blink!",
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
      "Connect DHT22 VCC to 5V, GND to GND",
      "Connect data pin to digital pin 2 with a 10kΩ pull-up resistor",
      "Install the DHT library from Library Manager",
      "Upload code and open Serial Monitor at 9600 baud",
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
      "Connect servo red wire to 5V, brown to GND, orange to pin 9",
      "Connect potentiometer: outer pins to 5V and GND, middle to A0",
      "Upload code and turn the potentiometer to control the servo",
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
      "Connect RGB LED pins through 220Ω resistors to pins 9, 10, 11",
      "Connect three potentiometers to A0, A1, A2",
      "Each pot controls one color channel (R, G, B)",
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
      "Connect HC-05 TX to Arduino RX (pin 0), RX to TX (pin 1)",
      "Power HC-05 with 5V and GND",
      "Connect LEDs to pins 12 and 13 through resistors",
      "Pair with phone and use a Bluetooth terminal app",
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
      "Connect buzzer positive to pin 8, negative to GND",
      "Connect push button to pin 2 with a pull-down resistor",
      "Press button to play melody",
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
      "Connect soil moisture sensor analog output to A0",
      "Connect relay signal pin to digital pin 7",
      "Connect water pump through the relay",
      "LEDs on pins 12 (green = moist) and 13 (red = dry)",
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
      "Connect LCD using I2C (SDA to A4, SCL to A5)",
      "Connect buttons for code input on pins 2-5",
      "Connect buzzer to pin 8, LEDs to pins 12, 13",
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
      "Assemble the chassis with DC motors",
      "Connect L298N motor driver inputs to pins 5-8",
      "Mount HC-SR04 on the front, trig pin 9, echo pin 10",
      "Power motors from battery pack through L298N",
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
      "Mount two LDRs on either side of a divider",
      "Connect LDRs to A0 and A1 with voltage dividers",
      "Connect servo to pin 9",
      "Servo moves toward the brighter LDR",
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
      "Connect OLED via I2C: SDA to A4, SCL to A5",
      "Connect DHT11 data pin to pin 2",
      "Install Adafruit SSD1306 and DHT libraries",
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
      "Connect joystick X to A0, Y to A1, button to pin 2",
      "Connect LED matrix via MAX7219",
      "Use joystick to move a dot and avoid obstacles",
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

  // Check if this project came from the Generate page
  const generatedProject = (() => {
    try {
      const stored = localStorage.getItem("activeGeneratedProject");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.id === projectId) return parsed;
      }
    } catch {}
    return null;
  })();

  // First try exact ID match in catalog, then title match from generated data,
  // then build a fallback from the generated project data
  const project = (() => {
    // If we have generated project data, try to find a matching catalog entry by title
    if (generatedProject) {
      const byTitle = allProjects.find(
        (p) => p.title.toLowerCase() === generatedProject.title?.toLowerCase()
      );
      if (byTitle) return byTitle;

      // Build a fallback project detail from the generated data
      return {
        id: generatedProject.id,
        emoji: generatedProject.emoji || "🔧",
        title: generatedProject.title,
        desc: generatedProject.description || "A custom AI-generated Arduino project.",
        difficulty: generatedProject.difficulty || "beginner",
        time: generatedProject.time || "30 mins",
        xp: generatedProject.xp || 75,
        components: generatedProject.components || ["Arduino Uno"],
        instructions: [
          "Review the project components and gather your materials",
          "Wire up the circuit following the pin assignments in the code",
          "Read through the starter code and understand each section",
          "Fill in the TODO sections and test your implementation",
        ],
        basicCode: `/*
  🎯 Project: ${generatedProject.title}

  Goal: ${generatedProject.description || "Complete this project"}

  📦 Components: ${(generatedProject.components || ["Arduino Uno"]).join(", ")}

  🧩 Write your implementation below!
*/

void setup() {
  Serial.begin(9600);
  // TODO: Initialize your pins and components
  Serial.println("${generatedProject.title} Starting...");
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
      };
    }

    return allProjects.find((p) => p.id === projectId) || allProjects[0];
  })();

  const [activeTab, setActiveTab] = useState<ActiveTab>("instructions");
  const [simExpanded, setSimExpanded] = useState(false);
  const [codeMode, setCodeMode] = useState<CodeMode>("basic");
  const [showSolution, setShowSolution] = useState(false);
  const [saved, setSaved] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

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
      return;
    }

    setRunStep("simulating");
    await delay(1500);
    setRunStep("success");
    setCompleted(true);
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

  const handleSaveToProfile = () => {
    // Save to dashboard (localStorage for now)
    const savedProjects = JSON.parse(localStorage.getItem("savedProjects") || "[]");
    if (savedProjects.length >= 5) {
      alert("You can only save up to 5 projects. Please remove one first.");
      return;
    }
    const exists = savedProjects.find((p: any) => p.id === project.id);
    if (!exists) {
      savedProjects.push({
        id: project.id,
        emoji: project.emoji,
        title: project.title,
        difficulty: project.difficulty,
        time: project.time,
        xp: project.xp,
        desc: project.desc,
        savedAt: new Date().toISOString(),
      });
      localStorage.setItem("savedProjects", JSON.stringify(savedProjects));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const diffBadgeStyle =
    project.difficulty === "beginner"
      ? { background: "rgba(0,255,136,0.15)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)" }
      : project.difficulty === "intermediate"
      ? { background: "rgba(255,165,0,0.15)", color: "#FFA500", border: "1px solid rgba(255,165,0,0.3)" }
      : { background: "rgba(183,68,255,0.15)", color: "#B744FF", border: "1px solid rgba(183,68,255,0.3)" };

  return (
    <Layout>
      <div className="px-8 py-8 max-w-4xl mx-auto">
        {/* Back link */}
        <button
          onClick={() => navigate("/catalog")}
          className="flex items-center gap-2 text-sm font-medium mb-6 transition-all hover:gap-3"
          style={{ color: "#00F5FF" }}
        >
          <ArrowLeft size={16} /> Back to Catalog
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
                  <button
                    onClick={handleSaveToProfile}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
                    style={{ background: "rgba(0,245,255,0.1)", color: "#00F5FF", border: "1px solid rgba(0,245,255,0.3)" }}
                  >
                    <Save size={14} /> Save Project
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Components Required */}
        <div
          className="rounded-2xl p-5 border mb-6"
          style={{ background: "hsl(229, 45%, 14%)", borderColor: "hsl(229, 42%, 26%)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Settings size={16} style={{ color: "#00F5FF" }} />
            <span className="font-bold text-sm" style={{ color: "#00F5FF" }}>Components Required</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.components.map((c) => (
              <span
                key={c}
                className="px-3 py-1.5 rounded-lg text-sm font-medium"
                style={{ background: "hsl(229, 42%, 20%)", color: "#E0E7FF", border: "1px solid hsl(229, 42%, 30%)" }}
              >
                {c}
              </span>
            ))}
          </div>
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
            <h3 className="font-bold mb-4" style={{ color: "#FFFFFF" }}>Step-by-Step Instructions</h3>
            <div className="space-y-3">
              {project.instructions.map((inst, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background: "rgba(0,245,255,0.15)", color: "#00F5FF", border: "1px solid rgba(0,245,255,0.3)" }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-sm pt-1" style={{ color: "#E0E7FF" }}>{inst}</p>
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
                  <pre className="p-5 overflow-x-auto text-sm leading-relaxed" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", color: "#E0E7FF", background: "hsl(232, 48%, 8%)", maxHeight: "500px" }}>
                    <code>{currentCode}</code>
                  </pre>
                ) : (
                  <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    className="w-full p-5 text-sm leading-relaxed resize-none focus:outline-none"
                    style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", color: "#E0E7FF", background: "hsl(232, 48%, 8%)", minHeight: "400px", maxHeight: "500px", caretColor: "#00F5FF", border: "none" }}
                    spellCheck={false}
                  />
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
      {saved && (
        <div
          className="fixed bottom-6 right-6 px-5 py-3 rounded-xl flex items-center gap-2 font-semibold animate-fade-in z-50"
          style={{ background: "linear-gradient(135deg, #00FF88, #00C853)", color: "#0A0E27", boxShadow: "0 0 20px rgba(0,255,136,0.4)" }}
        >
          <CheckCircle size={16} /> ✓ Project Saved to Dashboard!
        </div>
      )}
      {copyToast && (
        <div
          className="fixed bottom-6 right-6 px-5 py-3 rounded-xl flex items-center gap-2 font-semibold animate-fade-in z-50"
          style={{ background: "linear-gradient(135deg, #00F5FF, #0099FF)", color: "#0A0E27", boxShadow: "0 0 20px rgba(0,245,255,0.4)" }}
        >
          <Copy size={16} /> Code copied to clipboard!
        </div>
      )}
    </Layout>
  );
}
