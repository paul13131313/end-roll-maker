"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EndRollData } from "@/lib/types";
import { loadData } from "@/lib/storage";

type Sequence =
  | { type: "fade-in" }
  | { type: "title"; text: string }
  | { type: "info"; lines: string[] }
  | { type: "motto"; text: string }
  | { type: "photo"; src: string }
  | { type: "section-title"; text: string }
  | { type: "credit"; name: string; relation: string; message: string }
  | { type: "lead-label" }
  | { type: "lead-name"; text: string }
  | { type: "gratitude"; text: string }
  | { type: "fin" }
  | { type: "fade-out" };

function buildSequence(data: EndRollData): Sequence[] {
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

  if (data.settings.showPhotos && data.profile.photos.length > 0) {
    data.profile.photos.forEach((src) => {
      seq.push({ type: "photo", src });
    });
  }

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

interface RenderItem {
  y: number;
  height: number;
  render: (ctx: CanvasRenderingContext2D) => void;
}

function buildRenderItems(
  sequence: Sequence[],
  W: number,
  H: number,
  scale: number,
  loadedImages: Map<string, HTMLImageElement>
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
          y: startY,
          height: h,
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
          y: startY,
          height: h,
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
          y: startY,
          height: h,
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
      case "photo": {
        const h = H * 0.7;
        const startY = y;
        const src = item.src;
        items.push({
          y: startY,
          height: h,
          render: (ctx) => {
            const img = loadedImages.get(src);
            if (!img) return;
            ctx.save();
            const maxW = W * 0.6;
            const maxH = h * 0.8;
            let dw = img.naturalWidth;
            let dh = img.naturalHeight;
            const ratio = Math.min(maxW / dw, maxH / dh);
            dw *= ratio;
            dh *= ratio;
            ctx.drawImage(img, (W - dw) / 2, startY + (h - dh) / 2, dw, dh);
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
          y: startY,
          height: h,
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
          y: startY,
          height: h,
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
          y: startY,
          height: h,
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
          y: startY,
          height: h,
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
          y: startY,
          height: h,
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
          y: startY,
          height: h,
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

const SPEED_MAP = { slow: 0.4, normal: 0.7, fast: 1.2 };

export default function PreviewPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [data, setData] = useState<EndRollData | null>(null);
  const rafRef = useRef<number>(0);
  const loadedImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    const d = loadData();
    setData(d);

    if (d.settings.showPhotos && d.profile.photos.length > 0) {
      d.profile.photos.forEach((src) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          loadedImagesRef.current.set(src, img);
        };
      });
    }
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !data) return;

    const isVertical = data.settings.aspect === "9:16";
    const containerW = container.clientWidth;
    const containerH = container.clientHeight;

    let w: number, h: number;
    if (isVertical) {
      const ratio = 9 / 16;
      h = containerH;
      w = h * ratio;
      if (w > containerW) {
        w = containerW;
        h = w / ratio;
      }
    } else {
      const ratio = 16 / 9;
      w = containerW;
      h = w / ratio;
      if (h > containerH) {
        h = containerH;
        w = h * ratio;
      }
    }

    canvas.width = w * 2;
    canvas.height = h * 2;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  }, [data]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  const play = useCallback(() => {
    if (!data || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Ensure canvas is sized
    resizeCanvas();

    setPlaying(true);

    const sequence = buildSequence(data);
    const speed = SPEED_MAP[data.settings.speed];
    const W = canvas.width;
    const H = canvas.height;
    const scale = W / 800;

    const { items, totalHeight } = buildRenderItems(
      sequence, W, H, scale, loadedImagesRef.current
    );

    let scrollY = 0;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      scrollY += speed * 60 * dt * scale;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);

      // Fade in
      if (scrollY < H * 0.3) {
        ctx.globalAlpha = scrollY / (H * 0.3);
      } else {
        ctx.globalAlpha = 1;
      }

      // Fade out near end
      const distFromEnd = totalHeight - H - scrollY;
      if (distFromEnd < H * 0.5 && distFromEnd > 0) {
        ctx.globalAlpha = distFromEnd / (H * 0.5);
      }

      // Render visible items
      for (const ri of items) {
        const screenY = ri.y - scrollY;
        if (screenY + ri.height < -100 || screenY > H + 100) continue;

        ctx.save();
        ctx.translate(0, -scrollY);
        ri.render(ctx);
        ctx.restore();
      }

      ctx.globalAlpha = 1;

      if (scrollY < totalHeight - H) {
        rafRef.current = requestAnimationFrame(render);
      } else {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, W, H);
        setPlaying(false);
      }
    };

    rafRef.current = requestAnimationFrame(render);
  }, [data, resizeCanvas]);

  const stop = () => {
    cancelAnimationFrame(rafRef.current);
    setPlaying(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div style={{ color: "#555", fontFamily: "'Courier New',monospace", fontSize: 12, letterSpacing: "0.3em" }}>
          LOADING...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Controls */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)",
        }}
      >
        <button
          onClick={() => {
            stop();
            router.push("/edit");
          }}
          style={{
            fontFamily: "'Courier New',monospace",
            fontSize: 11,
            letterSpacing: "0.15em",
            color: "#888",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          ← EDIT
        </button>
        <button
          onClick={playing ? stop : play}
          style={{
            fontFamily: "'Courier New',monospace",
            fontSize: 11,
            letterSpacing: "0.3em",
            color: "#ddd8c8",
            background: "none",
            border: "1px solid rgba(200,190,170,0.3)",
            padding: "8px 24px",
            cursor: "pointer",
          }}
        >
          {playing ? "STOP" : "PLAY"}
        </button>
      </div>

      {/* Canvas container */}
      <div
        ref={containerRef}
        style={{
          width: "90%",
          height: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            background: "#000",
            boxShadow: "0 0 60px rgba(20,30,60,0.3)",
          }}
        />
      </div>
    </div>
  );
}
