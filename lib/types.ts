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

export interface ProfileData {
  fullName: string;
  reading: string;
  birthDate: string;
  birthPlace: string;
  motto: string;
  favorites: {
    music: string;
    food: string;
    place: string;
  };
  threeWords: [string, string, string];
  photos: string[]; // base64 data URLs
  gratitudeMessage: string;
}

export interface SettingsData {
  aspect: "16:9" | "9:16";
  showPhotos: boolean;
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
  favorites: { music: "", food: "", place: "" },
  threeWords: ["", "", ""],
  photos: [],
  gratitudeMessage: "",
};

export const DEFAULT_SETTINGS: SettingsData = {
  aspect: "16:9",
  showPhotos: true,
  speed: "normal",
};
