import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { localCheck } from "@/lib/compileSketch";

const BLINK = `
const int ledPin = 13;
void setup() { pinMode(ledPin, OUTPUT); }
void loop() { digitalWrite(ledPin, HIGH); delay(500); digitalWrite(ledPin, LOW); delay(500); }
`;

describe("localCheck", () => {
  it("accepts a valid blink sketch", () => {
    expect(localCheck(BLINK)).toEqual([]);
  });

  it("rejects an empty sketch", () => {
    expect(localCheck("").length).toBeGreaterThan(0);
    expect(localCheck("   \n  ").length).toBeGreaterThan(0);
  });

  it("rejects a sketch whose setup() and loop() are both empty", () => {
    const errors = localCheck("void setup() {\n\n}\n\nvoid loop() {\n\n}\n");
    expect(errors.join(" ")).toMatch(/empty/i);
  });

  it("rejects a sketch whose setup() and loop() only contain comments", () => {
    expect(localCheck("void setup() { // todo\n}\nvoid loop() { /* later */ }").join(" ")).toMatch(/empty/i);
  });

  it("flags names that were never declared", () => {
    const errors = localCheck("void setup() { pinMode(ledPin, OUTPUT); }\nvoid loop() { digitalWrite(ledPin, HIGH); }");
    expect(errors.some((e) => e.includes("'ledPin' was not declared"))).toBe(true);
    // Reported once, not once per use.
    expect(errors.filter((e) => e.includes("'ledPin'")).length).toBe(1);
  });

  it("suggests the intended function for a typo", () => {
    const errors = localCheck("void setup() { pinMod(13, OUTPUT); }\nvoid loop() { }");
    expect(errors.join(" ")).toMatch(/'pinMod' was not declared.*Did you mean 'pinMode'/);
  });

  it("reports the line number", () => {
    const errors = localCheck("void setup() {\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  blinkk();\n}");
    expect(errors.join(" ")).toMatch(/Line 5: 'blinkk'/);
  });

  it("does not flag declared variables, parameters, functions or macros", () => {
    const code = `
#define LED_PIN 13
#define SQUARE(x) ((x)*(x))
int counter = 0, limit = 5;
unsigned long previousMillis = 0;
byte pattern[3] = {1, 2, 3};
void blink(int times, int wait) { for (int i = 0; i < times; i++) { digitalWrite(LED_PIN, HIGH); delay(wait); } }
void setup() { pinMode(LED_PIN, OUTPUT); }
void loop() { blink(limit, 100); counter++; helper(counter); }
void helper(int value) { Serial.println(value); }
`;
    expect(localCheck(code)).toEqual([]);
  });

  it("does not flag library members or capitalised library names", () => {
    const code = `
#include <Servo.h>
Servo myServo;
void setup() { myServo.attach(9); Serial.begin(9600); }
void loop() { myServo.write(90); delay(15); }
`;
    expect(localCheck(code)).toEqual([]);
  });

  it("catches unbalanced brackets", () => {
    expect(localCheck("void setup() { pinMode(13, OUTPUT); \nvoid loop() { delay(1); }").join(" ")).toMatch(/Unbalanced/);
  });

  it("ignores identifiers inside strings and comments", () => {
    const code = `void setup() { Serial.begin(9600); Serial.println("notDeclared here"); } // ghostVar\nvoid loop() { delay(10); }`;
    expect(localCheck(code)).toEqual([]);
  });
});

// Every complete solution shipped with the app must pass the check, otherwise real learners are blocked.
describe("localCheck against the bundled project solutions", () => {
  const source = readFileSync("src/pages/ProjectDetailPage.tsx", "utf8");
  const snippets = [...source.matchAll(/`([^`]*void setup\(\)[^`]*)`/g)].map((m) => m[1]);

  it("finds the bundled sketches", () => {
    expect(snippets.length).toBeGreaterThan(10);
  });

  it("produces no false positives", () => {
    const failures: string[] = [];
    snippets.forEach((raw, i) => {
      if (/\/\/\s*TODO:\s*(Initialize|Write your)/.test(raw)) return; // starter templates are meant to fail
      const code = raw.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
      const errors = localCheck(code);
      if (errors.length) failures.push(`#${i}: ${errors.slice(0, 3).join(" | ")}`);
    });
    expect(failures).toEqual([]);
  });
});
