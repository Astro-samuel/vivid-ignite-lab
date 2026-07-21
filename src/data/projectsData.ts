export interface ProjectItem {
  id: number;
  emoji: string;
  title: string;
  desc: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  time: string;
  xp: number;
  components: string[];
  instructions: string[];
  basicCode: string;
  optimizedCode: string;
  cost?: number;
  tags?: string[];
}

export const allProjectsData: ProjectItem[] = [
  {
    id: 1, emoji: "💡", title: "LED Blink Tutorial",
    desc: "The classic 'Hello World' of Arduino — make an LED blink! Learn the basics of digital output, timing, and circuit fundamentals.",
    difficulty: "beginner", time: "15 mins", xp: 50, cost: 5, tags: ["LED", "GPIO"],
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

const int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("LED Blink Starting...");
}

void loop() {
  digitalWrite(ledPin, HIGH);
  delay(1000);
  digitalWrite(ledPin, LOW);
  delay(1000);
}`,
    optimizedCode: `/*
  Learning Goals:
  1. Understand digital output with digitalWrite()
  2. Use millis() for non-blocking timing
*/

const int ledPin = 13;
unsigned long previousMillis = 0;
const long interval = 1000;
int ledState = LOW;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    ledState = (ledState == LOW) ? HIGH : LOW;
    digitalWrite(ledPin, ledState);
  }
}`,
  },
  {
    id: 2, emoji: "🌡️", title: "Temperature Monitor",
    desc: "Read temperature data from a DHT22 sensor and display it on your computer via Serial Monitor. Learn about analog sensors and data reading.",
    difficulty: "beginner", time: "30 mins", xp: 75, cost: 8, tags: ["DHT22", "Serial"],
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
  1. Non-blocking DHT sensor reading with error handling
*/

#include <DHT.h>

const int dhtPin = 2;
DHT dht(dhtPin, DHT22);
unsigned long lastRead = 0;

void setup() {
  Serial.begin(9600);
  dht.begin();
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
    difficulty: "intermediate", time: "45 mins", xp: 100, cost: 10, tags: ["Servo", "PWM", "robotics"],
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
  2. Map analog values to servo angles
*/

#include <Servo.h>

Servo myServo;
const int potPin = A0;
const int servoPin = 9;

void setup() {
  myServo.attach(servoPin);
  Serial.begin(9600);
}

void loop() {
  int potValue = analogRead(potPin);
  int angle = map(potValue, 0, 1023, 0, 180);
  myServo.write(angle);
  delay(15);
}`,
    optimizedCode: `/*
  Learning Goals:
  1. Smooth servo movement with acceleration
*/

#include <Servo.h>

Servo myServo;
const int potPin = A0;
const int servoPin = 9;
int currentAngle = 90;

void setup() {
  myServo.attach(servoPin);
  myServo.write(currentAngle);
  Serial.begin(9600);
}

void loop() {
  int targetAngle = map(analogRead(potPin), 0, 1023, 0, 180);
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
    difficulty: "beginner", time: "30 mins", xp: 80, cost: 7, tags: ["LED", "ADC"],
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
    basicCode: `const int redPin = 9;
const int greenPin = 10;
const int bluePin = 11;

void setup() {
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
}

void loop() {
  int r = map(analogRead(A0), 0, 1023, 0, 255);
  int g = map(analogRead(A1), 0, 1023, 0, 255);
  int b = map(analogRead(A2), 0, 1023, 0, 255);

  analogWrite(redPin, r);
  analogWrite(greenPin, g);
  analogWrite(bluePin, b);
  delay(50);
}`,
    optimizedCode: `const int redPin = 9;
const int greenPin = 10;
const int bluePin = 11;

void setup() {
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
}

void loop() {
  analogWrite(redPin, map(analogRead(A0), 0, 1023, 0, 255));
  analogWrite(greenPin, map(analogRead(A1), 0, 1023, 0, 255));
  analogWrite(bluePin, map(analogRead(A2), 0, 1023, 0, 255));
  delay(20);
}`,
  },
];
