// Pure-JS UUID v4 generator.
// Uses Math.random() — sufficient for client-generated idempotency keys
// (backend deduplicates on correlationId; collision probability is negligible).
// Does NOT use expo-crypto / Web Crypto — must work in any JS environment
// including Expo Go, Jest, and Node without native modules.

export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
