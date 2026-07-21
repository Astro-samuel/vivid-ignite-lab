-- 5 lessons for "Display & Output" (path a1000000-0000-0000-0000-000000000004)
-- and 5 lessons for "IoT & Wireless" (path a1000000-0000-0000-0000-000000000005).
-- Both paths already existed with total_lessons=5 but zero rows in `lessons`.

INSERT INTO public.lessons (id, path_id, title, description, concept_content, challenge_prompt, challenge_starter_code, challenge_solution, build_task, xp_reward, lesson_order, difficulty, estimated_minutes) VALUES

-- ── Display & Output ──────────────────────────────────────────────
('b4000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', '7-Segment Display Basics', 'Drive a single-digit 7-segment display directly with digital pins',
$$# 7-Segment Displays

A 7-segment display is 7 individual LEDs (segments a-g) arranged to form digits 0-9.

## Key Concepts
- **Common Cathode** — all segment cathodes share one GND pin; HIGH lights a segment
- **Common Anode** — all segment anodes share one 5V pin; LOW lights a segment
- **Segment naming** — segments are labeled a (top) through g (middle), clockwise

## Wiring
Each segment needs its own current-limiting resistor (220Ω) between the Arduino pin and the segment pin.$$,
$$Light up segments to display the digit '1' (segments b and c only).$$,
$$const int segPins[7] = {2, 3, 4, 5, 6, 7, 8}; // a,b,c,d,e,f,g

void setup() {
  for (int i = 0; i < 7; i++) {
    pinMode(segPins[i], OUTPUT);
  }
}

void loop() {
  // TODO: turn on segments b and c to show "1"

}$$,
$$const int segPins[7] = {2, 3, 4, 5, 6, 7, 8}; // a,b,c,d,e,f,g

void setup() {
  for (int i = 0; i < 7; i++) {
    pinMode(segPins[i], OUTPUT);
  }
}

void loop() {
  digitalWrite(segPins[1], HIGH); // b
  digitalWrite(segPins[2], HIGH); // c
}$$,
$$Wire a common-cathode 7-segment display's b and c segments through 220Ω resistors to pins 3 and 4. Upload your code — you should see the digit '1'.$$,
15, 1, 'beginner', 15),

('b4000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004', '16x2 LCD — Hello World', 'Print text on a character LCD over I2C',
$$# Character LCDs

A 16x2 LCD displays 2 rows of 16 characters each. Most modern LCDs use an I2C backpack, needing just 4 wires instead of the original 12+.

## Key Concepts
- **LiquidCrystal_I2C** — library for I2C-based character LCDs
- **lcd.init()** — initializes the display
- **lcd.setCursor(col, row)** — moves the text cursor (0-indexed)
- **lcd.print()** — writes text at the cursor position

## Wiring
SDA → A4, SCL → A5, VCC → 5V, GND → GND. The I2C address is usually 0x27 or 0x3F.$$,
$$Print "Hello, Arduino!" on the first line of the LCD.$$,
$$#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.init();
  lcd.backlight();
  // TODO: print "Hello, Arduino!"

}

void loop() {
}$$,
$$#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Hello, Arduino!");
}

void loop() {
}$$,
$$Wire the LCD's I2C pins (SDA/SCL/VCC/GND) and upload. If you see boxes instead of text, adjust the contrast trimmer on the I2C backpack.$$,
15, 2, 'beginner', 15),

('b4000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004', 'OLED Display Graphics', 'Draw shapes and text on a 128x64 OLED',
$$# OLED Displays

A 0.96" SSD1306 OLED gives you 128×64 pixels of graphics — not just text. It uses I2C, like the LCD, but the Adafruit_SSD1306 + Adafruit_GFX libraries give you shapes, multiple text sizes, and pixel-level drawing.

## Key Concepts
- **display.clearDisplay()** — clears the framebuffer (must call before drawing a new frame)
- **display.setTextSize()** — scales text (1 = 6x8px per character)
- **display.drawRect() / drawCircle()** — primitive shape drawing
- **display.display()** — pushes the framebuffer to the actual screen (nothing shows until you call this)$$,
$$Draw a rectangle border around the screen and print "OLED Ready" inside it.$$,
$$#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);

void setup() {
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  // TODO: draw a rectangle border and print "OLED Ready"

  display.display();
}

void loop() {
}$$,
$$#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);

void setup() {
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.drawRect(0, 0, 128, 64, WHITE);
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(20, 28);
  display.print("OLED Ready");
  display.display();
}

void loop() {
}$$,
$$Wire the OLED's I2C pins and upload. Remember: nothing appears until display.display() is called.$$,
20, 3, 'intermediate', 20),

('b4000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'Scrolling Text Display', 'Animate long text on an LCD without blocking your program',
$$# Non-Blocking Animation on a Display

Long messages don't fit on a 16x2 LCD. Instead of using delay() (which freezes your whole program), we scroll the text using millis() for smooth, non-blocking timing — the same pattern used throughout real Arduino projects.

## Key Concepts
- **millis()** — returns milliseconds since the Arduino booted, never blocks
- **String substring** — extract a moving 16-character window from a longer message
- **Non-blocking timing** — track "when did I last update" instead of sleeping$$,
$$Scroll the message "Arduino is awesome! " across the LCD's first line, advancing one character every 300ms.$$,
$$#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
String message = "Arduino is awesome!   ";
int scrollPos = 0;
unsigned long lastScroll = 0;

void setup() {
  lcd.init();
  lcd.backlight();
}

void loop() {
  // TODO: every 300ms, print a 16-character window of `message`
  // starting at scrollPos, then advance scrollPos (wrap around)

}$$,
$$#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
String message = "Arduino is awesome!   ";
int scrollPos = 0;
unsigned long lastScroll = 0;

void setup() {
  lcd.init();
  lcd.backlight();
}

void loop() {
  if (millis() - lastScroll >= 300) {
    lastScroll = millis();
    String window = message.substring(scrollPos) + message.substring(0, scrollPos);
    lcd.setCursor(0, 0);
    lcd.print(window.substring(0, 16));
    scrollPos = (scrollPos + 1) % message.length();
  }
}$$,
$$Upload and watch the message scroll smoothly. Try changing the 300ms interval to speed up or slow down the scroll.$$,
20, 4, 'intermediate', 20),

('b4000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000004', 'Live Data Dashboard', 'Capstone: combine a sensor reading with OLED graphics',
$$# Combining a Sensor with a Display

Real projects rarely use a display in isolation — they show live sensor data. This capstone combines everything from this path: OLED graphics, formatted numbers, and a periodically-updating read loop.

## Key Concepts
- **Combining libraries** — Wire.h is shared by both the sensor and the OLED (same I2C bus)
- **display.print(value)** — prints numbers directly, no string conversion needed
- **Update rate** — refreshing too often causes flicker; ~1 second is usually enough$$,
$$Read the potentiometer on A0 and display its value as a percentage (0-100%) on the OLED, updating once per second.$$,
$$#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);
const int potPin = A0;

void setup() {
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
}

void loop() {
  // TODO: read potPin, convert to a 0-100% value,
  // and display it, updating once per second

}$$,
$$#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);
const int potPin = A0;

void setup() {
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
}

void loop() {
  int raw = analogRead(potPin);
  int percent = map(raw, 0, 1023, 0, 100);

  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(WHITE);
  display.setCursor(30, 24);
  display.print(percent);
  display.println("%");
  display.display();

  delay(1000);
}$$,
$$Wire a potentiometer to A0 and the OLED via I2C. Turn the knob and watch the percentage update on screen.$$,
25, 5, 'intermediate', 25),

-- ── IoT & Wireless ─────────────────────────────────────────────────
('b5000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005', 'Bluetooth LED Control', 'Control an LED wirelessly over Bluetooth with an HC-05 module',
$$# Bluetooth Serial Communication

The HC-05 module adds Bluetooth to any Arduino by acting as a wireless serial port — anything sent over Bluetooth arrives just like Serial.read() data.

## Key Concepts
- **SoftwareSerial** — creates an extra serial port on any two digital pins, since HC-05 needs its own TX/RX separate from USB
- **Pairing** — HC-05 shows up as a Bluetooth device (default PIN often 1234) in your phone's Bluetooth settings
- **Serial Bluetooth Terminal** — a free phone app for sending characters to test this lesson$$,
$$Turn the LED on when '1' is received over Bluetooth, off when '0' is received.$$,
$$#include <SoftwareSerial.h>

SoftwareSerial btSerial(10, 11); // RX, TX
const int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
  btSerial.begin(9600);
}

void loop() {
  // TODO: if btSerial has data, read it and turn the LED
  // on for '1', off for '0'

}$$,
$$#include <SoftwareSerial.h>

SoftwareSerial btSerial(10, 11); // RX, TX
const int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
  btSerial.begin(9600);
}

void loop() {
  if (btSerial.available()) {
    char c = btSerial.read();
    if (c == '1') digitalWrite(ledPin, HIGH);
    if (c == '0') digitalWrite(ledPin, LOW);
  }
}$$,
$$Wire HC-05: TX→pin 10, RX→pin 11 (through a voltage divider — HC-05's RX is 3.3V only!), VCC→5V, GND→GND. Pair your phone, send '1' and '0'.$$,
15, 1, 'beginner', 15),

('b5000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000005', 'WiFi Connection Basics', 'Connect an ESP8266 to your WiFi network',
$$# Connecting to WiFi

ESP8266/ESP32 boards run full Arduino sketches while also handling WiFi — no separate shield needed. Connecting is the first step before any web request or server.

## Key Concepts
- **WiFi.begin(ssid, password)** — starts the connection attempt
- **WiFi.status()** — check connection state; WL_CONNECTED means success
- **WiFi.localIP()** — the address your board was assigned on the network$$,
$$Connect to WiFi and print the board's IP address to Serial once connected.$$,
$$#include <ESP8266WiFi.h>

const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

void setup() {
  Serial.begin(9600);
  // TODO: connect to WiFi, wait until connected,
  // then print the IP address

}

void loop() {
}$$,
$$#include <ESP8266WiFi.h>

const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

void setup() {
  Serial.begin(9600);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("Connected!");
  Serial.println(WiFi.localIP());
}

void loop() {
}$$,
$$Select 'NodeMCU 1.0' as your board, enter your real WiFi credentials, and upload. Open Serial Monitor at 9600 baud to see your IP address.$$,
15, 2, 'beginner', 15),

('b5000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000005', 'Simple Web Server', 'Host a web page from your ESP8266 to control a pin remotely',
$$# Hosting a Web Page from Your Arduino

Once connected to WiFi, an ESP8266 can run its own tiny web server — visit its IP address in any browser on the same network to control it.

## Key Concepts
- **WiFiServer** — listens for incoming connections on a port (80 = standard HTTP)
- **client.readStringUntil()** — reads the incoming HTTP request line
- **request.indexOf()** — a simple way to check which URL path was requested$$,
$$Serve a page that turns the LED on when visiting /led/on and off when visiting /led/off.$$,
$$#include <ESP8266WiFi.h>

const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
const int ledPin = 2;

WiFiServer server(80);

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  Serial.println(WiFi.localIP());
  server.begin();
}

void loop() {
  // TODO: accept a client, read the request, turn the LED
  // on/off based on the URL, and send a basic response

}$$,
$$#include <ESP8266WiFi.h>

const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
const int ledPin = 2;

WiFiServer server(80);

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  Serial.println(WiFi.localIP());
  server.begin();
}

void loop() {
  WiFiClient client = server.available();
  if (!client) return;

  String request = client.readStringUntil('\r');
  client.flush();

  if (request.indexOf("/led/on") != -1) digitalWrite(ledPin, HIGH);
  if (request.indexOf("/led/off") != -1) digitalWrite(ledPin, LOW);

  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/plain");
  client.println();
  client.println("OK");
  client.stop();
}$$,
$$Upload, note the printed IP, then visit http://<that-ip>/led/on and /led/off in your browser.$$,
20, 3, 'intermediate', 20),

('b5000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000005', 'Send Sensor Data Over Bluetooth', 'Stream live sensor readings to a phone over Bluetooth',
$$# Streaming Sensor Readings Wirelessly

Combine what you learned in Lesson 1 with a real sensor: instead of hardcoding '1'/'0' commands, this time the Arduino is the one transmitting — sending live readings out over Bluetooth for a phone app to receive.

## Key Concepts
- **btSerial.print() / println()** — sends data out over Bluetooth exactly like Serial
- **Sampling rate** — sending too fast floods the Bluetooth link; ~2 readings/sec is plenty$$,
$$Read the potentiometer on A0 and send its value over Bluetooth twice per second.$$,
$$#include <SoftwareSerial.h>

SoftwareSerial btSerial(10, 11);
const int potPin = A0;

void setup() {
  btSerial.begin(9600);
}

void loop() {
  // TODO: read potPin and send the value over btSerial,
  // then wait 500ms

}$$,
$$#include <SoftwareSerial.h>

SoftwareSerial btSerial(10, 11);
const int potPin = A0;

void setup() {
  btSerial.begin(9600);
}

void loop() {
  int value = analogRead(potPin);
  btSerial.println(value);
  delay(500);
}$$,
$$Wire the potentiometer and HC-05 as in Lesson 1. Open a Bluetooth terminal app on your phone and watch the values stream in as you turn the knob.$$,
20, 4, 'intermediate', 20),

('b5000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005', 'IoT Weather Station', 'Capstone: serve live sensor data as an auto-refreshing web page',
$$# Putting It All Together: A Web-Connected Sensor

This capstone combines every IoT concept in this path: WiFi connection, a web server, and live sensor data — served as a simple auto-refreshing HTML page anyone on your network can view.

## Key Concepts
- **HTML meta refresh** — `<meta http-equiv="refresh" content="5">` reloads the page automatically, giving a "live" dashboard without JavaScript
- **String concatenation for HTML** — building a web page one client.println() at a time
- **Separating read logic from serve logic** — read the sensor once per request, not continuously$$,
$$Serve a web page showing the current temperature reading from a DHT22, auto-refreshing every 5 seconds.$$,
$$#include <ESP8266WiFi.h>
#include <DHT.h>

const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
#define DHTPIN 2
DHT dht(DHTPIN, DHT22);

WiFiServer server(80);

void setup() {
  Serial.begin(9600);
  dht.begin();
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  Serial.println(WiFi.localIP());
  server.begin();
}

void loop() {
  // TODO: accept a client, read the temperature, and respond
  // with an auto-refreshing HTML page showing it

}$$,
$$#include <ESP8266WiFi.h>
#include <DHT.h>

const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
#define DHTPIN 2
DHT dht(DHTPIN, DHT22);

WiFiServer server(80);

void setup() {
  Serial.begin(9600);
  dht.begin();
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  Serial.println(WiFi.localIP());
  server.begin();
}

void loop() {
  WiFiClient client = server.available();
  if (!client) return;

  client.readStringUntil('\r');
  client.flush();

  float temp = dht.readTemperature();

  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/html");
  client.println();
  client.println("<html><head><meta http-equiv='refresh' content='5'></head>");
  client.println("<body style='font-family:sans-serif;text-align:center'>");
  client.println("<h1>IoT Weather Station</h1>");
  client.print("<p style='font-size:48px'>");
  client.print(temp);
  client.println(" &deg;C</p>");
  client.println("</body></html>");
  client.stop();
}$$,
$$Wire the DHT22 to pin 2, upload, and visit the printed IP address in a browser. The page should refresh itself with a new reading every 5 seconds.$$,
25, 5, 'intermediate', 25);
