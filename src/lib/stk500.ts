// Minimal STK500v1 programmer (the protocol optiboot/the Arduino Uno/Nano/Mega
// bootloader speaks) implemented directly over the Web Serial API. This is the
// same protocol avrdude uses under `-c arduino`; no external binary needed.
//
// Reference: https://ww1.microchip.com/downloads/en/Appnotes/doc2525.pdf

const STK_OK = 0x10;
const STK_INSYNC = 0x14;
const CRC_EOP = 0x20;
const STK_GET_SYNC = 0x30;
const STK_ENTER_PROGMODE = 0x50;
const STK_LEAVE_PROGMODE = 0x51;
const STK_LOAD_ADDRESS = 0x55;
const STK_PROG_PAGE = 0x64;
const STK_READ_PAGE = 0x74;

export interface FlashBoardProfile {
  fqbn: string;
  bootloaderBaud: number;
  pageSize: number;
}

export const BOARD_PROFILES: Record<string, FlashBoardProfile> = {
  "arduino:avr:uno": { fqbn: "arduino:avr:uno", bootloaderBaud: 115200, pageSize: 128 },
  "arduino:avr:nano": { fqbn: "arduino:avr:nano", bootloaderBaud: 57600, pageSize: 128 },
  "arduino:avr:mega": { fqbn: "arduino:avr:mega", bootloaderBaud: 57600, pageSize: 256 },
  "arduino:avr:leonardo": { fqbn: "arduino:avr:leonardo", bootloaderBaud: 57600, pageSize: 128 },
};

class Stk500Timeout extends Error {}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readExact(reader: ReadableStreamDefaultReader<Uint8Array>, n: number, timeoutMs: number): Promise<Uint8Array> {
  const out = new Uint8Array(n);
  let filled = 0;
  const deadline = Date.now() + timeoutMs;
  while (filled < n) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new Stk500Timeout(`Timed out waiting for ${n} bytes from board (got ${filled})`);
    const { value, done } = await Promise.race([
      reader.read(),
      delay(remaining).then(() => ({ value: undefined, done: false } as ReadableStreamReadResult<Uint8Array>)),
    ]);
    if (done) throw new Stk500Timeout("Serial port closed while reading");
    if (!value) throw new Stk500Timeout(`Timed out waiting for ${n} bytes from board (got ${filled})`);
    out.set(value.subarray(0, Math.min(value.length, n - filled)), filled);
    filled += value.length;
  }
  return out;
}

async function sendCommand(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  reader: ReadableStreamDefaultReader<Uint8Array>,
  body: number[],
  responseExtraBytes = 0,
  timeoutMs = 2000
): Promise<Uint8Array> {
  await writer.write(new Uint8Array([...body, CRC_EOP]));
  const resp = await readExact(reader, 2 + responseExtraBytes, timeoutMs);
  if (resp[0] !== STK_INSYNC) throw new Error(`Bootloader out of sync (expected INSYNC, got 0x${resp[0].toString(16)})`);
  if (resp[resp.length - 1] !== STK_OK) throw new Error(`Bootloader rejected command (expected STK_OK, got 0x${resp[resp.length - 1].toString(16)})`);
  return resp.slice(1, resp.length - 1);
}

async function sync(writer: WritableStreamDefaultWriter<Uint8Array>, reader: ReadableStreamDefaultReader<Uint8Array>) {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      await sendCommand(writer, reader, [STK_GET_SYNC], 0, 400);
      return;
    } catch (err) {
      lastErr = err;
      await delay(100);
    }
  }
  throw new Error(`Could not sync with bootloader: ${lastErr instanceof Error ? lastErr.message : lastErr}`);
}

export interface FlashOptions {
  profile?: FlashBoardProfile;
  onLog?: (line: string) => void;
}

// Resets the board into its bootloader via the DTR auto-reset circuit every
// Uno/Nano/Mega/Leonardo board has (a transistor tied to the DTR line).
async function resetIntoBootloader(port: any) {
  await port.setSignals({ dataTerminalReady: false, requestToSend: false });
  await delay(50);
  await port.setSignals({ dataTerminalReady: true, requestToSend: true });
  await delay(50);
  await port.setSignals({ dataTerminalReady: false, requestToSend: false });
  await delay(50);
}

// Flashes a raw flash-image byte array to the board over the given (already-
// closed) SerialPort. Opens the port itself at the bootloader baud rate and
// closes it again when done — caller is responsible for reopening at the
// sketch's runtime baud rate afterward if it wants the serial monitor back.
export async function flashViaStk500(port: any, flashImage: Uint8Array, options: FlashOptions = {}): Promise<void> {
  const profile = options.profile ?? BOARD_PROFILES["arduino:avr:uno"];
  const log = options.onLog ?? (() => {});

  log(`Opening port at ${profile.bootloaderBaud} baud (bootloader speed)...`);
  await port.open({ baudRate: profile.bootloaderBaud });

  try {
    log("Pulsing DTR to reset board into bootloader...");
    await resetIntoBootloader(port);
    await delay(300); // bootloader watchdog window

    const writer = port.writable.getWriter();
    const reader = port.readable.getReader();

    try {
      log("Syncing with bootloader...");
      await sync(writer, reader);

      log("Entering programming mode...");
      await sendCommand(writer, reader, [STK_ENTER_PROGMODE]);

      const pageSize = profile.pageSize;
      const totalPages = Math.ceil(flashImage.length / pageSize);
      log(`Writing ${flashImage.length} bytes in ${totalPages} page(s) of ${pageSize}...`);

      for (let page = 0; page < totalPages; page++) {
        const byteAddress = page * pageSize;
        const wordAddress = byteAddress >> 1;
        await sendCommand(writer, reader, [STK_LOAD_ADDRESS, wordAddress & 0xff, (wordAddress >> 8) & 0xff]);

        const pageData = new Uint8Array(pageSize).fill(0xff);
        const slice = flashImage.subarray(byteAddress, Math.min(byteAddress + pageSize, flashImage.length));
        pageData.set(slice);

        await sendCommand(writer, reader, [
          STK_PROG_PAGE,
          (pageSize >> 8) & 0xff,
          pageSize & 0xff,
          0x46, // 'F' = flash memory
          ...pageData,
        ], 0, 3000);

        if (page % 4 === 0 || page === totalPages - 1) {
          log(`  page ${page + 1}/${totalPages} written`);
        }
      }

      log("Verifying written pages...");
      for (let page = 0; page < totalPages; page++) {
        const byteAddress = page * pageSize;
        const wordAddress = byteAddress >> 1;
        await sendCommand(writer, reader, [STK_LOAD_ADDRESS, wordAddress & 0xff, (wordAddress >> 8) & 0xff]);
        const readBack = await sendCommand(writer, reader, [STK_READ_PAGE, (pageSize >> 8) & 0xff, pageSize & 0xff, 0x46], pageSize, 3000);
        const expected = new Uint8Array(pageSize).fill(0xff);
        expected.set(flashImage.subarray(byteAddress, Math.min(byteAddress + pageSize, flashImage.length)));
        for (let i = 0; i < pageSize; i++) {
          if (readBack[i] !== expected[i]) {
            throw new Error(`Verification failed at byte ${byteAddress + i}: wrote 0x${expected[i].toString(16)}, read back 0x${readBack[i].toString(16)}`);
          }
        }
      }
      log("Verification OK.");

      log("Leaving programming mode...");
      await sendCommand(writer, reader, [STK_LEAVE_PROGMODE]);
    } finally {
      reader.releaseLock();
      writer.releaseLock();
    }
  } finally {
    await port.close();
  }
}
