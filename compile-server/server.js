const express = require("express");
const { execFile } = require("child_process");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const app = express();
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 8080;
const AUTH_TOKEN = process.env.COMPILE_SERVER_TOKEN; // shared secret with the Supabase edge function
const DEFAULT_FQBN = "arduino:avr:uno";
const ALLOWED_FQBNS = new Set([
  "arduino:avr:uno",
  "arduino:avr:nano",
  "arduino:avr:mega",
  "arduino:avr:leonardo",
]);

function auth(req, res, next) {
  if (!AUTH_TOKEN) return next(); // no token configured = open (fine for local/dev only)
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (token !== AUTH_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/compile", auth, async (req, res) => {
  const { code, fqbn } = req.body || {};
  if (typeof code !== "string" || !code.trim()) {
    return res.status(400).json({ error: "Missing 'code' string" });
  }
  const board = ALLOWED_FQBNS.has(fqbn) ? fqbn : DEFAULT_FQBN;

  const id = crypto.randomUUID();
  const sketchDir = path.join(os.tmpdir(), `sketch-${id}`, "sketch");
  const outDir = path.join(os.tmpdir(), `sketch-${id}`, "out");

  try {
    await fs.mkdir(sketchDir, { recursive: true });
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(path.join(sketchDir, "sketch.ino"), code, "utf8");

    const { stdout, stderr } = await runCompile(sketchDir, outDir, board);

    const hexPath = path.join(outDir, "sketch.ino.hex");
    const hex = await fs.readFile(hexPath, "utf8");

    res.json({ ok: true, hex, fqbn: board, log: stdout + stderr });
  } catch (err) {
    res.status(422).json({
      ok: false,
      error: "Compilation failed",
      log: err.stderr || err.stdout || err.message || String(err),
    });
  } finally {
    fs.rm(path.join(os.tmpdir(), `sketch-${id}`), { recursive: true, force: true }).catch(() => {});
  }
});

function runCompile(sketchDir, outDir, fqbn) {
  return new Promise((resolve, reject) => {
    execFile(
      "arduino-cli",
      ["compile", "--fqbn", fqbn, "--output-dir", outDir, sketchDir],
      { timeout: 60_000, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          reject(Object.assign(error, { stdout, stderr }));
        } else {
          resolve({ stdout, stderr });
        }
      }
    );
  });
}

app.listen(PORT, () => {
  console.log(`arduino-compile-server listening on :${PORT}`);
});
