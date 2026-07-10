// Parses Intel HEX (the format avr-gcc/arduino-cli emits) into a flat flash-image byte array.
// Supports record types 00 (data), 01 (EOF), 04 (extended linear address) — the set avr-gcc output uses.

export interface ParsedHex {
  bytes: Uint8Array; // flash image starting at address 0
  size: number; // highest written address + 1
}

export function parseIntelHex(hexText: string): ParsedHex {
  const lines = hexText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  // AVR flash on the boards we target tops out at 256KB (Mega); allocate generously, trim after.
  const MAX_FLASH = 256 * 1024;
  const bytes = new Uint8Array(MAX_FLASH);
  let highWater = 0;
  let upperAddress = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line.startsWith(":")) continue;
    const byteCount = parseInt(line.slice(1, 3), 16);
    const address = parseInt(line.slice(3, 7), 16);
    const recordType = parseInt(line.slice(7, 9), 16);
    const dataHex = line.slice(9, 9 + byteCount * 2);

    if (recordType === 0x00) {
      const fullAddress = upperAddress + address;
      for (let i = 0; i < byteCount; i++) {
        const byte = parseInt(dataHex.slice(i * 2, i * 2 + 2), 16);
        const pos = fullAddress + i;
        if (pos >= MAX_FLASH) {
          throw new Error("Hex file exceeds supported flash size");
        }
        bytes[pos] = byte;
        if (pos + 1 > highWater) highWater = pos + 1;
      }
    } else if (recordType === 0x04) {
      const upper16 = parseInt(dataHex, 16);
      upperAddress = upper16 << 16;
    } else if (recordType === 0x01) {
      break; // EOF
    }
    // other record types (02 extended segment, 03/05 start address) don't affect flash contents
  }

  return { bytes: bytes.slice(0, highWater), size: highWater };
}
