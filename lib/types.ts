export interface CastMember {
  id: string;
  name: string;
  relation: string;
  message: string;
}

export interface CastSection {
  id: string;
  label: string;
  members: CastMember[];
}

export interface TimelineEntry {
  id: string;
  year: string;
  text: string;
}

export interface ProfileData {
  fullName: string;
  reading: string;
  birthDate: string;
  birthPlace: string;
  motto: string;
  career: TimelineEntry[];
  milestones: TimelineEntry[];
  hobbies: string[];
  favorites: {
    music: string;
    food: string;
    place: string;
  };
  threeWords: [string, string, string];
  gratitudeMessage: string;
}

export interface SettingsData {
  aspect: "16:9" | "9:16";
  speed: "slow" | "normal" | "fast";
}

export interface EndRollData {
  cast: CastSection[];
  profile: ProfileData;
  settings: SettingsData;
}

export const DEFAULT_SECTIONS: CastSection[] = [
  { id: "family", label: "両親・兄弟姉妹・親族", members: [] },
  { id: "partner", label: "パートナー", members: [] },
  { id: "work", label: "仕事でお世話になった方々", members: [] },
  { id: "mentor", label: "恩師", members: [] },
  { id: "friends", label: "友人", members: [] },
  { id: "special", label: "Special Thanks", members: [] },
  { id: "lead", label: "主演", members: [] },
];

export const DEFAULT_PROFILE: ProfileData = {
  fullName: "",
  reading: "",
  birthDate: "",
  birthPlace: "",
  motto: "",
  career: [],
  milestones: [],
  hobbies: [],
  favorites: { music: "", food: "", place: "" },
  threeWords: ["", "", ""],
  gratitudeMessage: "",
};

export const DEFAULT_SETTINGS: SettingsData = {
  aspect: "16:9",
  speed: "normal",
};
