import { EndRollData } from "./types";

// URL-safe base64: replace + → -, / → _, remove =
function toUrlSafe(b64: string): string {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromUrlSafe(safe: string): string {
  let b64 = safe.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  return b64;
}

export function encodeData(data: EndRollData): string {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return toUrlSafe(btoa(binary));
}

export function decodeData(encoded: string): EndRollData | null {
  try {
    const b64 = fromUrlSafe(encoded);
    const binary = atob(b64);
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
