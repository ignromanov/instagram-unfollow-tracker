/**
 * File Validation Utilities
 * Checks file format and validity before processing
 */

// ZIP magic bytes: PK\x03\x04 (0x504B0304)
const ZIP_MAGIC_BYTES = [0x50, 0x4b, 0x03, 0x04];

/**
 * Check if file is a valid ZIP by reading magic bytes
 * Falls back to extension check in test environment or if slice fails
 */
export async function isValidZipFile(file: File): Promise<boolean> {
  // Check extension first (quick check)
  if (!file.name.toLowerCase().endsWith('.zip')) {
    return false;
  }

  // In test environment, file.slice may not be available
  if (typeof file.slice !== 'function') {
    // Fall back to extension check only
    return true;
  }

  try {
    // Read first 4 bytes to verify ZIP signature
    const header = await file.slice(0, 4).arrayBuffer();
    const bytes = new Uint8Array(header);

    return (
      bytes.length >= 4 &&
      bytes[0] === ZIP_MAGIC_BYTES[0] &&
      bytes[1] === ZIP_MAGIC_BYTES[1] &&
      bytes[2] === ZIP_MAGIC_BYTES[2] &&
      bytes[3] === ZIP_MAGIC_BYTES[3]
    );
  } catch {
    // If reading fails, fall back to extension check
    return true;
  }
}
