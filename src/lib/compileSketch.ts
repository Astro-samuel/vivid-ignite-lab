import { supabase } from "@/integrations/supabase/client";

const COMPILE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compile-sketch`;

export interface CompileResult {
  ok: boolean;
  hex?: string;
  log?: string;
  error?: string;
  /** True when the remote compiler could not be used at all (not signed in, offline, not configured), as opposed to the code failing to compile. */
  unavailable?: boolean;
}

/**
 * Offline sketch check. It is NOT a real build, but it catches the mistakes that matter to a learner:
 * an empty sketch, names that were never declared (with a "did you mean"), unbalanced brackets,
 * missing setup()/loop(), and unfinished TODO sections. Used whenever the remote compiler is unavailable
 * and for the in-app lesson/project checks.
 */

const KEYWORDS = new Set([
  "if", "else", "for", "while", "do", "switch", "case", "default", "break", "continue", "return", "goto",
  "new", "delete", "this", "sizeof", "typedef", "struct", "class", "enum", "union", "public", "private",
  "protected", "namespace", "using", "template", "typename", "inline", "extern", "register", "static",
  "const", "constexpr", "volatile", "auto", "unsigned", "signed", "void", "int", "long", "short", "float",
  "double", "char", "bool", "boolean", "byte", "word", "true", "false", "nullptr", "operator", "try",
  "catch", "throw", "mutable", "virtual", "override", "final", "explicit", "friend", "and", "or", "not",
  "defined", "asm",
]);

// Arduino core + common C/C++ library functions that are written in lowercase.
const BUILTINS = new Set([
  "setup", "loop", "main", "pinMode", "digitalWrite", "digitalRead", "analogRead", "analogWrite", "analogReference",
  "analogReadResolution", "analogWriteResolution", "delay", "delayMicroseconds", "millis", "micros", "tone", "noTone",
  "pulseIn", "pulseInLong", "shiftOut", "shiftIn", "map", "constrain", "min", "max", "abs", "sq", "sqrt", "pow",
  "sin", "cos", "tan", "asin", "acos", "atan", "atan2", "sinh", "cosh", "tanh", "exp", "log", "log10", "floor",
  "ceil", "round", "fabs", "fmod", "isnan", "isinf", "random", "randomSeed", "attachInterrupt", "detachInterrupt",
  "digitalPinToInterrupt", "digitalPinToPort", "digitalPinToBitMask", "interrupts", "noInterrupts", "cli", "sei",
  "bitRead", "bitWrite", "bitSet", "bitClear", "bit", "lowByte", "highByte", "word", "makeWord", "yield", "init",
  "initVariant", "isDigit", "isAlpha", "isAlphaNumeric", "isAscii", "isControl", "isGraph", "isHexadecimalDigit",
  "isLowerCase", "isPrintable", "isPunct", "isSpace", "isUpperCase", "isWhitespace", "toAscii", "toLowerCase",
  "toUpperCase", "strlen", "strcmp", "strncmp", "strcpy", "strncpy", "strcat", "strncat", "strchr", "strstr",
  "strtok", "strtol", "strtod", "atoi", "atol", "atof", "itoa", "ltoa", "utoa", "ultoa", "dtostrf", "dtostre",
  "memcpy", "memset", "memcmp", "memmove", "sprintf", "snprintf", "printf", "sscanf", "puts", "putchar", "malloc",
  "free", "calloc", "realloc", "abort", "exit", "pgm_read_byte", "pgm_read_word", "pgm_read_dword", "pgm_read_float",
  "pgm_read_ptr", "memcpy_P", "strcpy_P", "strlen_P", "strcmp_P", "serialEvent", "serialEventRun", "wdt_enable",
  "wdt_disable", "wdt_reset", "sleep_enable", "sleep_cpu", "sleep_disable", "set_sleep_mode", "eeprom_read_byte",
  "eeprom_write_byte", "tolower", "toupper", "isdigit", "isalpha", "isspace", "analogInputToDigitalPin",
  "stdin", "stdout", "stderr", "nullptr", "std", "radians", "degrees", "abs", "lround", "trunc",
]);

// Words that can start a declaration but are not themselves a declared name.
const NOT_A_TYPE = new Set([
  "return", "else", "case", "goto", "new", "delete", "sizeof", "typedef", "using", "namespace", "public", "private",
  "protected", "throw", "defined", "operator", "do", "and", "or", "not",
]);

function blankKeepingLayout(src: string, re: RegExp, fill: (m: string) => string): string {
  return src.replace(re, fill);
}

function lineOf(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text.charCodeAt(i) === 10) line++;
  return line;
}

function distance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1),
      );
    }
  }
  return dp[a.length][b.length];
}

function findBody(code: string, name: "setup" | "loop"): string | null {
  const m = new RegExp(`void\\s+${name}\\s*\\(\\s*(?:void)?\\s*\\)\\s*\\{`).exec(code);
  if (!m) return null;
  let depth = 1;
  let i = m.index + m[0].length;
  const start = i;
  while (i < code.length && depth > 0) {
    if (code[i] === "{") depth++;
    else if (code[i] === "}") depth--;
    i++;
  }
  return code.slice(start, depth === 0 ? i - 1 : i);
}

export function localCheck(code: string): string[] {
  if (!code.trim()) return ["The sketch is empty. Write some code first."];

  // Remove comments, strings and char literals but keep every character position so line numbers stay right.
  const stripped = blankKeepingLayout(
    blankKeepingLayout(
      blankKeepingLayout(code, /\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")),
      /\/\/[^\n]*/g,
      (m) => " ".repeat(m.length),
    ),
    /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/g,
    (m) => m[0] + " ".repeat(Math.max(0, m.length - 2)) + m[m.length - 1],
  );

  const errors: string[] = [];

  // ── Preprocessor: collect #define names, then blank those lines out ──
  const declared = new Set<string>();
  const body = stripped.replace(/^[ \t]*#[ \t]*(\w+)([^\n]*)$/gm, (line, directive: string, rest: string) => {
    if (directive === "define") {
      const nm = /^\s*([A-Za-z_]\w*)/.exec(rest);
      if (nm) declared.add(nm[1]);
      // Macro parameters are declared inside the macro body.
      const params = /^\s*[A-Za-z_]\w*\(([^)]*)\)/.exec(rest);
      if (params) params[1].split(",").forEach((p) => { const n = p.trim(); if (n) declared.add(n); });
    }
    return " ".repeat(line.length);
  });

  // ── Required functions and empty sketch ──
  const setupBody = findBody(body, "setup");
  const loopBody = findBody(body, "loop");
  if (setupBody === null) errors.push("Missing setup() function.");
  if (loopBody === null) errors.push("Missing loop() function.");
  if (setupBody !== null && loopBody !== null && !setupBody.trim() && !loopBody.trim()) {
    errors.push("setup() and loop() are both empty. Add code that does something, like pinMode() and digitalWrite().");
  }

  // ── Declarations ──
  const typeNames = /\b(?:struct|class|enum|union)\s+([A-Za-z_]\w*)/g;
  for (const m of body.matchAll(typeNames)) declared.add(m[1]);
  for (const m of body.matchAll(/\btypedef\b[^;{}]*?([A-Za-z_]\w*)\s*;/g)) declared.add(m[1]);
  for (const m of body.matchAll(/\benum\s*(?:[A-Za-z_]\w*)?\s*\{([^}]*)\}/g)) {
    m[1].split(",").forEach((e) => { const n = /^\s*([A-Za-z_]\w*)/.exec(e); if (n) declared.add(n[1]); });
  }

  const declRe = /\b([A-Za-z_]\w*)(?:\s*[*&]+\s*|\s+)([A-Za-z_]\w*)\s*(?==|;|,|\[|\(|\))/g;
  for (const m of body.matchAll(declRe)) {
    if (NOT_A_TYPE.has(m[1])) continue;
    declared.add(m[2]);
    // The first word is a type name (e.g. a library class such as arduinoFFT), so it is known too.
    declared.add(m[1]);
    // Further declarators in the same statement: int a = 1, b, c[3];
    const follow = body[m.index! + m[0].length];
    if (follow === "=" || follow === "," || follow === ";" || follow === "[") {
      let depth = 0;
      let seg = "";
      const segs: string[] = [];
      for (let i = m.index! + m[0].length; i < body.length; i++) {
        const c = body[i];
        if (c === "(" || c === "[" || c === "{") depth++;
        else if (c === ")" || c === "]" || c === "}") { depth--; if (depth < 0) break; }
        if (depth === 0 && (c === ";")) break;
        if (depth === 0 && c === ",") { segs.push(seg); seg = ""; continue; }
        seg += c;
      }
      segs.push(seg);
      segs.slice(1).forEach((s) => {
        const n = /^\s*[*&]*\s*([A-Za-z_]\w*)\s*(?:=|\[|$)/.exec(s);
        if (n) declared.add(n[1]);
      });
    }
  }

  // ── Undeclared names. Only lowercase-first identifiers are checked: capitalised and ALL_CAPS
  //    names are classes, constants and library types we cannot know about. ──
  const reported = new Set<string>();
  const known = [...BUILTINS, ...declared];
  for (const m of body.matchAll(/\b[A-Za-z_]\w*\b/g)) {
    const word = m[0];
    if (!/^[a-z]/.test(word)) continue;
    if (KEYWORDS.has(word) || BUILTINS.has(word) || declared.has(word) || reported.has(word)) continue;
    if (/^(?:u?int(?:8|16|32|64)_t|u?intptr_t|size_t|ptrdiff_t|time_t|wchar_t)$/.test(word)) continue;
    // Member access and scope resolution: lcd.print, ptr->x, std::min
    const before = body.slice(Math.max(0, m.index! - 2), m.index!).replace(/\s+$/, "");
    const prev = body.slice(0, m.index!).replace(/\s+$/, "");
    if (prev.endsWith(".") || prev.endsWith("->") || prev.endsWith("::") || before.endsWith("::")) continue;
    reported.add(word);
    const suggestion = known.filter((k) => k.length >= 3 && distance(word, k) <= 2).sort((x, y) => distance(word, x) - distance(word, y))[0];
    errors.push(
      `Line ${lineOf(body, m.index!)}: '${word}' was not declared in this scope.${suggestion ? ` Did you mean '${suggestion}'?` : ""}`,
    );
  }

  if (/delay\(\d+;/.test(body)) errors.push("Missing closing parenthesis ')' in delay().");
  if (/\/\/\s*TODO:\s*(Initialize|Write your)/.test(code)) {
    errors.push("There are still TODO sections. Fill them in before running.");
  }

  // ── Bracket balance ──
  const pairs: Array<[string, string, string]> = [["{", "}", "curly braces { }"], ["(", ")", "parentheses ( )"], ["[", "]", "square brackets [ ]"]];
  for (const [open, close, label] of pairs) {
    const opens = body.split(open).length - 1;
    const closes = body.split(close).length - 1;
    if (opens !== closes) errors.push(`Unbalanced ${label}: ${opens} opening and ${closes} closing.`);
  }

  return errors;
}
// Compiles an Arduino sketch on the remote build server via the compile-sketch
// edge function. Board-agnostic and port-agnostic — used both for a plain
// "check my code" pass and as the first step before flashing a physical board.
export async function compileSketch(code: string, fqbn: string): Promise<CompileResult> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) return { ok: false, error: "Please log in to compile code.", unavailable: true };

  let response: Response;
  try {
    response = await fetch(COMPILE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ code, fqbn }),
    });
  } catch {
    return { ok: false, error: "Could not reach the compile server. It may be offline.", unavailable: true };
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ok === false) {
    const unavailable = [401, 403, 404, 502, 503, 504].includes(response.status);
    return { ok: false, error: result.error || result.log || "Compilation failed.", log: result.log, unavailable };
  }
  return { ok: true, hex: result.hex, log: result.log };
}
