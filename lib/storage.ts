import {
  EndRollData,
  DEFAULT_SECTIONS,
  DEFAULT_PROFILE,
  DEFAULT_SETTINGS,
} from "./types";

const STORAGE_KEY = "end-roll-maker-data";

export function loadData(): EndRollData {
  if (typeof window === "undefined") {
    return {
      cast: DEFAULT_SECTIONS,
      profile: DEFAULT_PROFILE,
      settings: DEFAULT_SETTINGS,
    };
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      cast: DEFAULT_SECTIONS,
      profile: DEFAULT_PROFILE,
      settings: DEFAULT_SETTINGS,
    };
  }

  const parsed = JSON.parse(raw) as EndRollData;
  return parsed;
}

export function saveData(data: EndRollData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
