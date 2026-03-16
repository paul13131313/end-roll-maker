"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  EndRollData,
  CastSection,
  CastMember,
  ProfileData,
  SettingsData,
  DEFAULT_SECTIONS,
  DEFAULT_PROFILE,
  DEFAULT_SETTINGS,
} from "@/lib/types";
import { loadData, saveData } from "@/lib/storage";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function EditPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [cast, setCast] = useState<CastSection[]>(DEFAULT_SECTIONS);
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const data = loadData();
    setCast(data.cast);
    setProfile(data.profile);
    setSettings(data.settings);
    setLoaded(true);
  }, []);

  const persist = useCallback(
    (c: CastSection[], p: ProfileData, s: SettingsData) => {
      saveData({ cast: c, profile: p, settings: s });
    },
    []
  );

  const addMember = (sectionId: string) => {
    const next = cast.map((sec) =>
      sec.id === sectionId
        ? {
            ...sec,
            members: [
              ...sec.members,
              { id: uid(), name: "", relation: "", message: "" },
            ],
          }
        : sec
    );
    setCast(next);
    persist(next, profile, settings);
  };

  const updateMember = (
    sectionId: string,
    memberId: string,
    field: keyof CastMember,
    value: string
  ) => {
    const next = cast.map((sec) =>
      sec.id === sectionId
        ? {
            ...sec,
            members: sec.members.map((m) =>
              m.id === memberId ? { ...m, [field]: value } : m
            ),
          }
        : sec
    );
    setCast(next);
    persist(next, profile, settings);
  };

  const removeMember = (sectionId: string, memberId: string) => {
    const next = cast.map((sec) =>
      sec.id === sectionId
        ? { ...sec, members: sec.members.filter((m) => m.id !== memberId) }
        : sec
    );
    setCast(next);
    persist(next, profile, settings);
  };

  const updateProfile = (updates: Partial<ProfileData>) => {
    const next = { ...profile, ...updates };
    setProfile(next);
    persist(cast, next, settings);
  };

  const updateSettings = (updates: Partial<SettingsData>) => {
    const next = { ...settings, ...updates };
    setSettings(next);
    persist(cast, profile, next);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = 10 - profile.photos.length;
    const toProcess = Array.from(files).slice(0, remaining);

    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setProfile((prev) => {
          const next = { ...prev, photos: [...prev.photos, result] };
          persist(cast, next, settings);
          return next;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    const next = {
      ...profile,
      photos: profile.photos.filter((_, i) => i !== index),
    };
    setProfile(next);
    persist(cast, next, settings);
  };

  const goPreview = () => {
    persist(cast, profile, settings);
    router.push("/preview");
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div style={{ color: "#555", fontFamily: "'Courier New',monospace", fontSize: 12, letterSpacing: "0.3em" }}>
          LOADING...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid #1a1a1a",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a
          href="/"
          style={{
            fontFamily: "'IM Fell English','Playfair Display',serif",
            fontStyle: "italic",
            fontSize: 18,
            color: "#ddd8c8",
            textDecoration: "none",
            letterSpacing: "0.08em",
          }}
        >
          end roll maker
        </a>
        <div style={{ display: "flex", gap: 4 }}>
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              style={{
                fontFamily: "'Courier New',monospace",
                fontSize: 11,
                letterSpacing: "0.15em",
                padding: "6px 16px",
                border: "1px solid",
                borderColor: step === s ? "#ddd8c8" : "#333",
                background: step === s ? "#ddd8c8" : "transparent",
                color: step === s ? "#000" : "#666",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              STEP {s}
            </button>
          ))}
        </div>
      </header>

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 120px" }}>
        {/* Step 1: Cast */}
        {step === 1 && (
          <div>
            <h2
              style={{
                fontFamily: "'IM Fell English','Playfair Display',serif",
                fontStyle: "italic",
                fontSize: 28,
                color: "#ddd8c8",
                marginBottom: 8,
                letterSpacing: "0.08em",
              }}
            >
              Cast
            </h2>
            <p style={{ color: "#666", fontSize: 13, marginBottom: 40, fontFamily: "'Courier New',monospace" }}>
              あなたの人生の出演者を登録してください
            </p>

            {cast.map((section) => (
              <div key={section.id} style={{ marginBottom: 40 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 15,
                      color: "#aaa",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {section.label}
                  </h3>
                  <button
                    onClick={() => addMember(section.id)}
                    style={{
                      fontFamily: "'Courier New',monospace",
                      fontSize: 10,
                      letterSpacing: "0.2em",
                      color: "#666",
                      background: "transparent",
                      border: "1px solid #333",
                      padding: "5px 14px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.borderColor = "#666";
                      (e.target as HTMLElement).style.color = "#aaa";
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.borderColor = "#333";
                      (e.target as HTMLElement).style.color = "#666";
                    }}
                  >
                    + ADD
                  </button>
                </div>

                {section.members.length === 0 && (
                  <div
                    style={{
                      border: "1px dashed #222",
                      padding: "20px",
                      textAlign: "center",
                      color: "#333",
                      fontSize: 12,
                      fontFamily: "'Courier New',monospace",
                    }}
                  >
                    まだ登録されていません
                  </div>
                )}

                {section.members.map((member) => (
                  <div
                    key={member.id}
                    style={{
                      border: "1px solid #1a1a1a",
                      padding: 16,
                      marginBottom: 8,
                      position: "relative",
                    }}
                  >
                    <button
                      onClick={() => removeMember(section.id, member.id)}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: "none",
                        border: "none",
                        color: "#444",
                        cursor: "pointer",
                        fontSize: 16,
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                      <input
                        placeholder="名前"
                        value={member.name}
                        onChange={(e) =>
                          updateMember(section.id, member.id, "name", e.target.value)
                        }
                      />
                      <input
                        placeholder="続柄・関係性"
                        value={member.relation}
                        onChange={(e) =>
                          updateMember(section.id, member.id, "relation", e.target.value)
                        }
                      />
                    </div>
                    <input
                      placeholder="一言メッセージ（任意）"
                      value={member.message}
                      onChange={(e) =>
                        updateMember(section.id, member.id, "message", e.target.value)
                      }
                      style={{ width: "100%" }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Profile */}
        {step === 2 && (
          <div>
            <h2
              style={{
                fontFamily: "'IM Fell English','Playfair Display',serif",
                fontStyle: "italic",
                fontSize: 28,
                color: "#ddd8c8",
                marginBottom: 8,
                letterSpacing: "0.08em",
              }}
            >
              Profile
            </h2>
            <p style={{ color: "#666", fontSize: 13, marginBottom: 40, fontFamily: "'Courier New',monospace" }}>
              あなた自身の情報を入力してください
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={labelStyle}>氏名</label>
                <input
                  value={profile.fullName}
                  onChange={(e) => updateProfile({ fullName: e.target.value })}
                  placeholder="山田 太郎"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={labelStyle}>読みがな</label>
                <input
                  value={profile.reading}
                  onChange={(e) => updateProfile({ reading: e.target.value })}
                  placeholder="やまだ たろう"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>生年月日</label>
                  <input
                    type="date"
                    value={profile.birthDate}
                    onChange={(e) => updateProfile({ birthDate: e.target.value })}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>出身地</label>
                  <input
                    value={profile.birthPlace}
                    onChange={(e) => updateProfile({ birthPlace: e.target.value })}
                    placeholder="東京都"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>モットー・座右の銘</label>
                <input
                  value={profile.motto}
                  onChange={(e) => updateProfile({ motto: e.target.value })}
                  placeholder="人生は一度きり"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={labelStyle}>好きだったもの</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <input
                    placeholder="音楽"
                    value={profile.favorites.music}
                    onChange={(e) =>
                      updateProfile({
                        favorites: { ...profile.favorites, music: e.target.value },
                      })
                    }
                  />
                  <input
                    placeholder="食べ物"
                    value={profile.favorites.food}
                    onChange={(e) =>
                      updateProfile({
                        favorites: { ...profile.favorites, food: e.target.value },
                      })
                    }
                  />
                  <input
                    placeholder="場所"
                    value={profile.favorites.place}
                    onChange={(e) =>
                      updateProfile({
                        favorites: { ...profile.favorites, place: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>自分を表す3つの言葉</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[0, 1, 2].map((i) => (
                    <input
                      key={i}
                      placeholder={`${i + 1}つ目`}
                      value={profile.threeWords[i]}
                      onChange={(e) => {
                        const next = [...profile.threeWords] as [string, string, string];
                        next[i] = e.target.value;
                        updateProfile({ threeWords: next });
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  写真（最大10枚）
                  <span style={{ color: "#555", marginLeft: 8 }}>
                    {profile.photos.length}/10
                  </span>
                </label>
                {profile.photos.length < 10 && (
                  <label
                    style={{
                      display: "inline-block",
                      border: "1px dashed #333",
                      padding: "12px 24px",
                      cursor: "pointer",
                      fontFamily: "'Courier New',monospace",
                      fontSize: 11,
                      letterSpacing: "0.15em",
                      color: "#666",
                      transition: "all 0.2s",
                    }}
                  >
                    + UPLOAD
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      multiple
                      onChange={handlePhotoUpload}
                      style={{ display: "none" }}
                    />
                  </label>
                )}
                {profile.photos.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, 1fr)",
                      gap: 8,
                      marginTop: 12,
                    }}
                  >
                    {profile.photos.map((photo, i) => (
                      <div key={i} style={{ position: "relative", aspectRatio: "1" }}>
                        <img
                          src={photo}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            border: "1px solid #222",
                          }}
                        />
                        <button
                          onClick={() => removePhoto(i)}
                          style={{
                            position: "absolute",
                            top: 2,
                            right: 2,
                            background: "rgba(0,0,0,0.7)",
                            border: "none",
                            color: "#888",
                            cursor: "pointer",
                            fontSize: 12,
                            width: 20,
                            height: 20,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>感謝のメッセージ</label>
                <textarea
                  value={profile.gratitudeMessage}
                  onChange={(e) => updateProfile({ gratitudeMessage: e.target.value })}
                  placeholder="エンドロールの最後に表示されるメッセージ"
                  rows={4}
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Settings */}
        {step === 3 && (
          <div>
            <h2
              style={{
                fontFamily: "'IM Fell English','Playfair Display',serif",
                fontStyle: "italic",
                fontSize: 28,
                color: "#ddd8c8",
                marginBottom: 8,
                letterSpacing: "0.08em",
              }}
            >
              Settings
            </h2>
            <p style={{ color: "#666", fontSize: 13, marginBottom: 40, fontFamily: "'Courier New',monospace" }}>
              再生設定を選択してください
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              <div>
                <label style={labelStyle}>構図</label>
                <div style={{ display: "flex", gap: 12 }}>
                  {(["16:9", "9:16"] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => updateSettings({ aspect: a })}
                      style={{
                        flex: 1,
                        padding: "16px",
                        border: "1px solid",
                        borderColor: settings.aspect === a ? "#ddd8c8" : "#333",
                        background: settings.aspect === a ? "#ddd8c8" : "transparent",
                        color: settings.aspect === a ? "#000" : "#666",
                        cursor: "pointer",
                        fontFamily: "'Courier New',monospace",
                        fontSize: 13,
                        letterSpacing: "0.1em",
                        transition: "all 0.2s",
                      }}
                    >
                      {a === "16:9" ? "横（16:9）" : "縦（9:16）"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>写真スライドショー</label>
                <div style={{ display: "flex", gap: 12 }}>
                  {[true, false].map((v) => (
                    <button
                      key={String(v)}
                      onClick={() => updateSettings({ showPhotos: v })}
                      style={{
                        flex: 1,
                        padding: "16px",
                        border: "1px solid",
                        borderColor: settings.showPhotos === v ? "#ddd8c8" : "#333",
                        background: settings.showPhotos === v ? "#ddd8c8" : "transparent",
                        color: settings.showPhotos === v ? "#000" : "#666",
                        cursor: "pointer",
                        fontFamily: "'Courier New',monospace",
                        fontSize: 13,
                        letterSpacing: "0.1em",
                        transition: "all 0.2s",
                      }}
                    >
                      {v ? "あり" : "なし"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>スクロール速度</label>
                <div style={{ display: "flex", gap: 12 }}>
                  {(["slow", "normal", "fast"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateSettings({ speed: s })}
                      style={{
                        flex: 1,
                        padding: "16px",
                        border: "1px solid",
                        borderColor: settings.speed === s ? "#ddd8c8" : "#333",
                        background: settings.speed === s ? "#ddd8c8" : "transparent",
                        color: settings.speed === s ? "#000" : "#666",
                        cursor: "pointer",
                        fontFamily: "'Courier New',monospace",
                        fontSize: 13,
                        letterSpacing: "0.1em",
                        transition: "all 0.2s",
                      }}
                    >
                      {s === "slow" ? "ゆっくり" : s === "normal" ? "標準" : "速め"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={goPreview}
              style={{
                marginTop: 60,
                width: "100%",
                padding: "18px",
                background: "#ddd8c8",
                color: "#000",
                border: "none",
                fontFamily: "'IM Fell English','Playfair Display',serif",
                fontStyle: "italic",
                fontSize: 18,
                letterSpacing: "0.15em",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = "#ddd8c8";
              }}
            >
              Preview
            </button>
          </div>
        )}
      </main>

      {/* Bottom nav */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: "1px solid #1a1a1a",
          background: "rgba(0,0,0,0.95)",
          backdropFilter: "blur(10px)",
          padding: "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 50,
        }}
      >
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          style={{
            fontFamily: "'Courier New',monospace",
            fontSize: 11,
            letterSpacing: "0.15em",
            color: step === 1 ? "#333" : "#888",
            background: "none",
            border: "none",
            cursor: step === 1 ? "default" : "pointer",
          }}
        >
          ← BACK
        </button>
        <span
          style={{
            fontFamily: "'Courier New',monospace",
            fontSize: 10,
            color: "#444",
            letterSpacing: "0.3em",
          }}
        >
          STEP {step} / 3
        </span>
        <button
          onClick={() => {
            if (step < 3) setStep(step + 1);
            else goPreview();
          }}
          style={{
            fontFamily: "'Courier New',monospace",
            fontSize: 11,
            letterSpacing: "0.15em",
            color: "#ddd8c8",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          {step === 3 ? "PREVIEW →" : "NEXT →"}
        </button>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "'Courier New',monospace",
  fontSize: 11,
  letterSpacing: "0.2em",
  color: "#888",
  marginBottom: 8,
  textTransform: "uppercase",
};
