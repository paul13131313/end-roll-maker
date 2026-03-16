import { EndRollData } from "./types";

type Sequence =
  | { type: "fade-in" }
  | { type: "title"; text: string }
  | { type: "info"; lines: string[] }
  | { type: "motto"; text: string }
  | { type: "favorites"; items: { label: string; value: string }[] }
  | { type: "three-words"; words: string[] }
  | { type: "section-title"; text: string }
  | { type: "credit"; name: string; relation: string; message: string }
  | { type: "lead-label" }
  | { type: "lead-name"; text: string }
  | { type: "gratitude"; text: string }
  | { type: "fin" }
  | { type: "fade-out" };

export function buildSequence(data: EndRollData): Sequence[] {
  const seq: Sequence[] = [];

  seq.push({ type: "fade-in" });
  seq.push({ type: "title", text: `${data.profile.fullName || "名前未設定"} の人生` });

  const infoLines: string[] = [];
  if (data.profile.birthPlace) infoLines.push(data.profile.birthPlace);
  if (data.profile.birthDate) {
    const d = new Date(data.profile.birthDate);
    infoLines.push(
      `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 生まれ`
    );
  }
  if (infoLines.length > 0) seq.push({ type: "info", lines: infoLines });

  if (data.profile.motto) seq.push({ type: "motto", text: data.profile.motto });

  const favItems: { label: string; value: string }[] = [];
  if (data.profile.favorites.music) favItems.push({ label: "音楽", value: data.profile.favorites.music });
  if (data.profile.favorites.food) favItems.push({ label: "食", value: data.profile.favorites.food });
  if (data.profile.favorites.place) favItems.push({ label: "場所", value: data.profile.favorites.place });
  if (favItems.length > 0) seq.push({ type: "favorites", items: favItems });

  const words = data.profile.threeWords.filter((w) => w.trim() !== "");
  if (words.length > 0) seq.push({ type: "three-words", words });

  const nonLead = data.cast.filter((s) => s.id !== "lead" && s.members.length > 0);
  nonLead.forEach((section) => {
    seq.push({ type: "section-title", text: section.label });
    section.members.forEach((m) => {
      seq.push({ type: "credit", name: m.name, relation: m.relation, message: m.message });
    });
  });

  const lead = data.cast.find((s) => s.id === "lead");
  if (lead && lead.members.length > 0) {
    seq.push({ type: "lead-label" });
    lead.members.forEach((m) => {
      seq.push({ type: "lead-name", text: m.name });
    });
  } else if (data.profile.fullName) {
    seq.push({ type: "lead-label" });
    seq.push({ type: "lead-name", text: data.profile.fullName });
  }

  if (data.profile.gratitudeMessage) {
    seq.push({ type: "gratitude", text: data.profile.gratitudeMessage });
  }

  seq.push({ type: "fin" });
  seq.push({ type: "fade-out" });

  return seq;
}

export interface RenderItem {
  y: number;
  height: number;
  render: (ctx: CanvasRenderingContext2D) => void;
}

export function buildRenderItems(
  sequence: Sequence[],
  W: number,
  H: number,
  scale: number,
): { items: RenderItem[]; totalHeight: number } {
  const items: RenderItem[] = [];
  let y = H;

  for (const item of sequence) {
    switch (item.type) {
      case "fade-in": {
        const h = H * 0.5;
        const startY = y;
        items.push({ y: startY, height: h, render: () => {} });
        y += h;
        break;
      }
      case "title": {
        const h = H * 0.6;
        const startY = y;
        const text = item.text;
        items.push({
          y: startY, height: h,
          render: (ctx) => {
            ctx.save();
            ctx.font = `${32 * scale}px 'Noto Serif JP', serif`;
            ctx.fillStyle = "#ddd8c8";
            ctx.textAlign = "center";
            ctx.fillText(text, W / 2, startY + h / 2);
            ctx.restore();
          },
        });
        y += h;
        break;
      }
      case "info": {
        const lineH = 36 * scale;
        const h = lineH * item.lines.length + 80 * scale;
        const startY = y;
        const lines = item.lines;
        items.push({
          y: startY, height: h,
          render: (ctx) => {
            ctx.save();
            ctx.font = `${16 * scale}px 'Noto Serif JP', serif`;
            ctx.fillStyle = "#ddd8c8";
            ctx.textAlign = "center";
            ctx.globalAlpha = 0.7;
            lines.forEach((line, i) => {
              ctx.fillText(line, W / 2, startY + 40 * scale + lineH * (i + 1));
            });
            ctx.restore();
          },
        });
        y += h;
        break;
      }
      case "motto": {
        const h = H * 0.5;
        const startY = y;
        const text = item.text;
        items.push({
          y: startY, height: h,
          render: (ctx) => {
            ctx.save();
            ctx.font = `italic ${20 * scale}px 'Noto Serif JP', serif`;
            ctx.fillStyle = "#ddd8c8";
            ctx.textAlign = "center";
            ctx.globalAlpha = 0.8;
            ctx.fillText(`"${text}"`, W / 2, startY + h / 2);
            ctx.restore();
          },
        });
        y += h;
        break;
      }
      case "favorites": {
        const favItems = item.items;
        const lineH = 40 * scale;
        const h = lineH * favItems.length + 120 * scale;
        const startY = y;
        items.push({
          y: startY, height: h,
          render: (ctx) => {
            ctx.save();
            ctx.font = `${14 * scale}px 'Noto Serif JP', serif`;
            ctx.fillStyle = "#ddd8c8";
            ctx.textAlign = "center";
            ctx.globalAlpha = 0.4;
            ctx.fillText("好きだったもの", W / 2, startY + 50 * scale);
            favItems.forEach((fi, i) => {
              const iy = startY + 90 * scale + lineH * i;
              ctx.font = `${13 * scale}px 'Noto Serif JP', serif`;
              ctx.globalAlpha = 0.45;
              ctx.textAlign = "right";
              ctx.fillText(fi.label, W / 2 - 16 * scale, iy);
              ctx.font = `${17 * scale}px 'Noto Serif JP', serif`;
              ctx.globalAlpha = 0.85;
              ctx.textAlign = "left";
              ctx.fillText(fi.value, W / 2 + 16 * scale, iy);
            });
            ctx.restore();
          },
        });
        y += h;
        break;
      }
      case "three-words": {
        const words = item.words;
        const h = H * 0.45;
        const startY = y;
        items.push({
          y: startY, height: h,
          render: (ctx) => {
            ctx.save();
            ctx.font = `${14 * scale}px 'Noto Serif JP', serif`;
            ctx.fillStyle = "#ddd8c8";
            ctx.textAlign = "center";
            ctx.globalAlpha = 0.4;
            ctx.fillText("自分を表す言葉", W / 2, startY + h * 0.3);
            ctx.font = `${22 * scale}px 'Noto Serif JP', serif`;
            ctx.globalAlpha = 0.9;
            ctx.fillText(words.join("  ·  "), W / 2, startY + h * 0.55);
            ctx.restore();
          },
        });
        y += h;
        break;
      }
      case "section-title": {
        const h = 120 * scale;
        const startY = y;
        const text = item.text;
        items.push({
          y: startY, height: h,
          render: (ctx) => {
            ctx.save();
            ctx.font = `${22 * scale}px 'Noto Serif JP', serif`;
            ctx.fillStyle = "#ddd8c8";
            ctx.textAlign = "center";
            ctx.fillText(text, W / 2, startY + h * 0.65);
            const tw = ctx.measureText(text).width;
            ctx.strokeStyle = "#ddd8c8";
            ctx.globalAlpha = 0.3;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(W / 2 - tw / 2, startY + h * 0.65 + 10 * scale);
            ctx.lineTo(W / 2 + tw / 2, startY + h * 0.65 + 10 * scale);
            ctx.stroke();
            ctx.restore();
          },
        });
        y += h;
        break;
      }
      case "credit": {
        const h = item.message ? 80 * scale : 56 * scale;
        const startY = y;
        const name = item.name;
        const relation = item.relation;
        const message = item.message;
        items.push({
          y: startY, height: h,
          render: (ctx) => {
            ctx.save();
            ctx.font = `${14 * scale}px 'Noto Serif JP', serif`;
            ctx.fillStyle = "#ddd8c8";
            ctx.globalAlpha = 0.5;
            ctx.textAlign = "left";
            ctx.fillText(relation, W * 0.2, startY + 30 * scale);
            ctx.font = `${18 * scale}px 'Noto Serif JP', serif`;
            ctx.globalAlpha = 1;
            ctx.textAlign = "right";
            ctx.fillText(name, W * 0.8, startY + 30 * scale);
            if (message) {
              ctx.font = `italic ${12 * scale}px 'Noto Serif JP', serif`;
              ctx.globalAlpha = 0.4;
              ctx.textAlign = "center";
              ctx.fillText(message, W / 2, startY + 56 * scale);
            }
            ctx.restore();
          },
        });
        y += h;
        break;
      }
      case "lead-label": {
        const h = 160 * scale;
        const startY = y;
        items.push({
          y: startY, height: h,
          render: (ctx) => {
            ctx.save();
            ctx.font = `${18 * scale}px 'Noto Serif JP', serif`;
            ctx.fillStyle = "#ddd8c8";
            ctx.textAlign = "center";
            ctx.globalAlpha = 0.7;
            ctx.fillText("主 演", W / 2, startY + h * 0.65);
            ctx.restore();
          },
        });
        y += h;
        break;
      }
      case "lead-name": {
        const h = 200 * scale;
        const startY = y;
        const text = item.text;
        items.push({
          y: startY, height: h,
          render: (ctx) => {
            ctx.save();
            ctx.font = `bold ${42 * scale}px 'Noto Serif JP', serif`;
            ctx.fillStyle = "#ddd8c8";
            ctx.textAlign = "center";
            ctx.fillText(text, W / 2, startY + h / 2);
            ctx.restore();
          },
        });
        y += h;
        break;
      }
      case "gratitude": {
        const lines = item.text.split("\n");
        const lineH = 32 * scale;
        const h = lineH * lines.length + 200 * scale;
        const startY = y;
        items.push({
          y: startY, height: h,
          render: (ctx) => {
            ctx.save();
            ctx.font = `${16 * scale}px 'Noto Serif JP', serif`;
            ctx.fillStyle = "#ddd8c8";
            ctx.textAlign = "center";
            ctx.globalAlpha = 0.8;
            lines.forEach((line, i) => {
              ctx.fillText(line, W / 2, startY + 100 * scale + lineH * i);
            });
            ctx.restore();
          },
        });
        y += h;
        break;
      }
      case "fin": {
        const h = H * 0.8;
        const startY = y;
        items.push({
          y: startY, height: h,
          render: (ctx) => {
            ctx.save();
            ctx.font = `italic ${36 * scale}px 'IM Fell English','Playfair Display',serif`;
            ctx.fillStyle = "#ddd8c8";
            ctx.textAlign = "center";
            ctx.fillText("FIN", W / 2, startY + h / 2);
            ctx.restore();
          },
        });
        y += h;
        break;
      }
      case "fade-out": {
        const startY = y;
        items.push({ y: startY, height: H, render: () => {} });
        y += H;
        break;
      }
    }
  }

  return { items, totalHeight: y };
}

export const SPEED_MAP: Record<string, number> = { slow: 0.4, normal: 0.7, fast: 1.2 };
