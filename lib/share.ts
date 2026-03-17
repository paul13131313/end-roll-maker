import { EndRollData } from "./types";
import pako from "pako";

// URL-safe base64
function toUrlSafe(b64: string): string {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromUrlSafe(safe: string): string {
  let b64 = safe.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  return b64;
}

// Minify data: strip empty fields, use short keys
function minify(data: EndRollData): object {
  const cast = data.cast
    .filter((s) => s.members.length > 0)
    .map((s) => ({
      i: s.id,
      l: s.label,
      m: s.members.map((m) => {
        const o: Record<string, string> = { n: m.name };
        if (m.relation) o.r = m.relation;
        if (m.message) o.g = m.message;
        return o;
      }),
    }));

  const p = data.profile;
  const profile: Record<string, unknown> = {};
  if (p.fullName) profile.n = p.fullName;
  if (p.reading) profile.rd = p.reading;
  if (p.birthDate) profile.bd = p.birthDate;
  if (p.birthPlace) profile.bp = p.birthPlace;
  if (p.motto) profile.mt = p.motto;
  const cr = (p.career || []).filter((e) => e.year || e.text);
  if (cr.length > 0) profile.cr = cr.map((e) => ({ y: e.year, t: e.text }));
  const ms = (p.milestones || []).filter((e) => e.year || e.text);
  if (ms.length > 0) profile.ms = ms.map((e) => ({ y: e.year, t: e.text }));
  const hb = (p.hobbies || []).filter((h) => h);
  if (hb.length > 0) profile.hb = hb;
  const fav: Record<string, string> = {};
  if (p.favorites.music) fav.m = p.favorites.music;
  if (p.favorites.food) fav.f = p.favorites.food;
  if (p.favorites.place) fav.p = p.favorites.place;
  if (Object.keys(fav).length > 0) profile.fv = fav;
  const tw = p.threeWords.filter((w) => w);
  if (tw.length > 0) profile.tw = tw;
  if (p.gratitudeMessage) profile.gm = p.gratitudeMessage;

  return {
    c: cast,
    p: profile,
    s: { a: data.settings.aspect, sp: data.settings.speed },
  };
}

// Expand minified data back to full EndRollData
function expand(obj: Record<string, unknown>): EndRollData | null {
  try {
    const castRaw = (obj.c || []) as Array<{
      i: string;
      l: string;
      m: Array<{ n: string; r?: string; g?: string }>;
    }>;
    const pRaw = (obj.p || {}) as Record<string, unknown>;
    const sRaw = (obj.s || {}) as Record<string, string>;
    const fvRaw = (pRaw.fv || {}) as Record<string, string>;
    const twRaw = (pRaw.tw || []) as string[];

    const DEFAULT_SECTION_IDS = [
      "family", "partner", "work", "mentor", "friends", "special", "lead",
    ];
    const DEFAULT_LABELS: Record<string, string> = {
      family: "両親・兄弟姉妹・親族",
      partner: "パートナー",
      work: "仕事でお世話になった方々",
      mentor: "恩師",
      friends: "友人",
      special: "Special Thanks",
      lead: "主演",
    };

    const castMap = new Map(
      castRaw.map((s) => [
        s.i,
        {
          id: s.i,
          label: s.l,
          members: s.m.map((m) => ({
            id: Math.random().toString(36).slice(2, 10),
            name: m.n || "",
            relation: m.r || "",
            message: m.g || "",
          })),
        },
      ])
    );

    const cast = DEFAULT_SECTION_IDS.map((id) =>
      castMap.get(id) || { id, label: DEFAULT_LABELS[id], members: [] }
    );

    return {
      cast,
      profile: {
        fullName: (pRaw.n as string) || "",
        reading: (pRaw.rd as string) || "",
        birthDate: (pRaw.bd as string) || "",
        birthPlace: (pRaw.bp as string) || "",
        motto: (pRaw.mt as string) || "",
        career: ((pRaw.cr || []) as Array<{ y: string; t: string }>).map((e) => ({
          id: Math.random().toString(36).slice(2, 10),
          year: e.y || "",
          text: e.t || "",
        })),
        milestones: ((pRaw.ms || []) as Array<{ y: string; t: string }>).map((e) => ({
          id: Math.random().toString(36).slice(2, 10),
          year: e.y || "",
          text: e.t || "",
        })),
        hobbies: ((pRaw.hb || []) as string[]),
        favorites: {
          music: fvRaw.m || "",
          food: fvRaw.f || "",
          place: fvRaw.p || "",
        },
        threeWords: [twRaw[0] || "", twRaw[1] || "", twRaw[2] || ""] as [
          string,
          string,
          string,
        ],
        gratitudeMessage: (pRaw.gm as string) || "",
      },
      settings: {
        aspect: (sRaw.a as "16:9" | "9:16") || "16:9",
        speed: (sRaw.sp as "slow" | "normal" | "fast") || "normal",
      },
    };
  } catch {
    return null;
  }
}

export function minifyData(data: EndRollData): object {
  return minify(data);
}

export function expandShared(obj: Record<string, unknown>): EndRollData | null {
  if (obj.cast) {
    return obj as unknown as EndRollData;
  }
  return expand(obj);
}

export function encodeData(data: EndRollData): string {
  const mini = minify(data);
  const json = JSON.stringify(mini);
  const utf8 = new TextEncoder().encode(json);
  const compressed = pako.deflate(utf8);
  let binary = "";
  compressed.forEach((b) => (binary += String.fromCharCode(b)));
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
    const decompressed = pako.inflate(bytes);
    const json = new TextDecoder().decode(decompressed);
    const obj = JSON.parse(json);

    if (obj.cast) {
      return obj as EndRollData;
    }
    return expand(obj);
  } catch {
    return null;
  }
}
