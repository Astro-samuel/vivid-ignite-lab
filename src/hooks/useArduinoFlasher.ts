import { useCallback, useRef, useState } from "react";
import { toast as sonnerToast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { parseIntelHex } from "@/lib/intelHex";
import { flashViaStk500, BOARD_PROFILES } from "@/lib/stk500";

const COMPILE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compile-sketch`;

// Shared Web Serial + real STK500 flashing logic for pages with an Arduino IDE panel.
// Handles: connecting to a board, live Serial Monitor output, and a real
// compile (via the compile-sketch edge function) + flash (via stk500.ts) upload.
export function useArduinoFlasher() {
  const [serialPort, setSerialPort] = useState<any>(null);
  const [serialConnected, setSerialConnected] = useState(false);
  const [serialLogs, setSerialLogs] = useState<string[]>([]);
  const [showSerialConsole, setShowSerialConsole] = useState(false);
  const [uploading, setUploading] = useState(false);

  const readerRef = useRef<any>(null);
  const stopMonitorRef = useRef(false);
  const pausedForUploadRef = useRef(false);

  const appendLog = useCallback((line: string) => {
    setSerialLogs((prev) => [...prev, line]);
  }, []);

  const readSerialLoop = useCallback(async (port: any) => {
    const decoder = new TextDecoder();
    while (port.readable && !stopMonitorRef.current) {
      const reader = port.readable.getReader();
      readerRef.current = reader;
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            const decoded = decoder.decode(value);
            setSerialLogs((prev) => [...prev, ...decoded.split("\n").filter((line) => line.trim() !== "")]);
          }
        }
      } catch (err) {
        console.error(err);
        break;
      } finally {
        reader.releaseLock();
        readerRef.current = null;
      }
    }
    if (!pausedForUploadRef.current) {
      setSerialConnected(false);
      setSerialPort(null);
    }
  }, []);

  const connectSerial = useCallback(async () => {
    if (!("serial" in navigator)) {
      sonnerToast.error("Web Serial API is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 9600 });
      setSerialPort(port);
      setSerialConnected(true);
      stopMonitorRef.current = false;
      appendLog("🔌 Connected to physical Arduino board!");
      appendLog("🚀 Port opened successfully at 9600 baud.");
      sonnerToast.success("🔌 Connected to board!");
      readSerialLoop(port);
    } catch (err) {
      console.error(err);
      sonnerToast.error("Failed to open connection.");
    }
  }, [appendLog, readSerialLoop]);

  const disconnectSerial = useCallback(async () => {
    if (serialPort) {
      stopMonitorRef.current = true;
      try {
        await readerRef.current?.cancel();
      } catch {
        // reader may already be gone
      }
      try {
        await serialPort.close();
      } catch {
        // already closed
      }
      setSerialPort(null);
      setSerialConnected(false);
      appendLog("🔌 Disconnected from board.");
      sonnerToast.info("🔌 Disconnected from board");
    }
  }, [serialPort, appendLog]);

  const uploadToBoard = useCallback(async (code: string, fqbn = "arduino:avr:uno"): Promise<boolean> => {
    if (!serialPort) return false;
    setUploading(true);
    let success = false;
    const profile = BOARD_PROFILES[fqbn] ?? BOARD_PROFILES["arduino:avr:uno"];

    try {
      appendLog("📦 Compiling sketch on remote build server...");
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Please log in to upload code.");

      const response = await fetch(COMPILE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code, fqbn }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.ok === false) {
        const log: string = result.log || result.error || "Unknown compile error";
        appendLog("❌ Compile failed:");
        log.split("\n").slice(0, 25).forEach((l: string) => appendLog(`   ${l}`));
        throw new Error(result.error || "Compilation failed. See log above.");
      }
      appendLog("✓ Compiled successfully.");

      const { bytes } = parseIntelHex(result.hex);
      appendLog(`📤 Flashing ${bytes.length} bytes to board via STK500...`);

      // Hand the port over to the flasher: pause the monitor's read loop and
      // close the port so stk500.ts can reopen it at bootloader baud.
      pausedForUploadRef.current = true;
      stopMonitorRef.current = true;
      try {
        await readerRef.current?.cancel();
      } catch {
        // no active reader
      }
      try {
        await serialPort.close();
      } catch {
        // already closed
      }
      await new Promise((r) => setTimeout(r, 50));

      await flashViaStk500(serialPort, bytes, { profile, onLog: appendLog });

      appendLog("✅ Upload complete — board is now running your code.");
      sonnerToast.success("🚀 Upload complete!");
      success = true;
    } catch (err: any) {
      appendLog(`❌ Upload failed: ${err.message || err}`);
      sonnerToast.error(err.message || "Upload failed");
    } finally {
      // Resume the serial monitor at the sketch's runtime baud rate.
      try {
        if (!serialPort.readable) {
          await serialPort.open({ baudRate: 9600 });
        }
        stopMonitorRef.current = false;
        pausedForUploadRef.current = false;
        readSerialLoop(serialPort);
      } catch (err) {
        console.error("Failed to resume serial monitor after upload:", err);
        setSerialConnected(false);
        setSerialPort(null);
      }
      setUploading(false);
    }
    return success;
  }, [serialPort, appendLog, readSerialLoop]);

  return {
    serialPort,
    serialConnected,
    serialLogs,
    showSerialConsole,
    setShowSerialConsole,
    uploading,
    connectSerial,
    disconnectSerial,
    uploadToBoard,
    clearLogs: () => setSerialLogs([]),
  };
}
