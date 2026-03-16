import { EndRollData } from "./types";

export function encodeData(data: EndRollData): string {
  const json = JSON.stringify(data);
  // Use TextEncoder + base64 for Unicode support
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

export function decodeData(encoded: string): EndRollData | null {
  try {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as EndRollData;
  } catch {
    return null;
  }
}
