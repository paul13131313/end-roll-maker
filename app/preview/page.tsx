"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EndRollData } from "@/lib/types";
import { loadData } from "@/lib/storage";
import { startBGM, stopBGM } from "@/lib/bgm";
import { buildSequence, buildRenderItems, SPEED_MAP } from "@/lib/renderer";
import { encodeData, minifyData } from "@/lib/share";

export default function PreviewPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [data, setData] = useState<EndRollData | null>(null);
  const [copied, setCopied] = useState(false);
  const rafRef = useRef<number>(0);
  const scrollYRef = useRef(0);
  const stoppedRef = useRef(false);

  useEffect(() => {
    setData(loadData());
  }, []);

  const sizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !data) return;

    const isVertical = data.settings.aspect === "9:16";
    const cw = container.clientWidth;
    const ch = container.clientHeight;

    let w: number, h: number;
    if (isVertical) {
      h = ch;
      w = h * (9 / 16);
      if (w > cw) { w = cw; h = w / (9 / 16); }
    } else {
      w = cw;
      h = w / (16 / 9);
      if (h > ch) { h = ch; w = h * (16 / 9); }
    }

    canvas.width = w * 2;
    canvas.height = h * 2;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  }, [data]);

  useEffect(() => {
    sizeCanvas();
    const onResize = () => sizeCanvas();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [sizeCanvas]);

  const play = useCallback(() => {
    if (!data || !canvasRef.current) return;

    sizeCanvas();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setPlaying(true);
    stoppedRef.current = false;
    scrollYRef.current = 0;
    startBGM();

    const sequence = buildSequence(data);
    const speed = SPEED_MAP[data.settings.speed] || 0.7;

    let lastTime = performance.now();

    const render = (now: number) => {
      if (stoppedRef.current) return;

      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const W = canvas.width;
      const H = canvas.height;
      const scale = W / 800;

      // Rebuild items each frame to handle resize
      const { items, totalHeight } = buildRenderItems(sequence, W, H, scale);

      scrollYRef.current += speed * 60 * dt * scale;
      const scrollY = scrollYRef.current;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);

      if (scrollY < H * 0.3) {
        ctx.globalAlpha = scrollY / (H * 0.3);
      } else {
        ctx.globalAlpha = 1;
      }

      const distFromEnd = totalHeight - H - scrollY;
      if (distFromEnd < H * 0.5 && distFromEnd > 0) {
        ctx.globalAlpha = distFromEnd / (H * 0.5);
      }

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
        stopBGM();
      }
    };

    rafRef.current = requestAnimationFrame(render);
  }, [data, sizeCanvas]);

  const stop = () => {
    stoppedRef.current = true;
    cancelAnimationFrame(rafRef.current);
    setPlaying(false);
    stopBGM();
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

  const share = async () => {
    if (!data) return;
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(minifyData(data)),
      });
      if (!res.ok) throw new Error("Save failed");
      const { id } = await res.json();
      const url = `${window.location.origin}/view?id=${id}`;
      await navigator.clipboard.writeText(url);
    } catch {
      // フォールバック: 従来の長いURL方式
      const encoded = encodeData(data);
      const url = `${window.location.origin}/view?d=${encoded}`;
      await navigator.clipboard.writeText(url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          onClick={() => { stop(); router.push("/edit"); }}
          style={{ fontFamily: "'Courier New',monospace", fontSize: 11, letterSpacing: "0.15em", color: "#888", background: "none", border: "none", cursor: "pointer" }}
        >
          ← EDIT
        </button>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={share}
            style={{ fontFamily: "'Courier New',monospace", fontSize: 11, letterSpacing: "0.2em", color: copied ? "#8f8" : "#888", background: "none", border: "1px solid rgba(200,190,170,0.2)", padding: "8px 16px", cursor: "pointer", transition: "all 0.3s" }}
          >
            {copied ? "COPIED!" : "SHARE"}
          </button>
          <button
            onClick={playing ? stop : play}
            style={{ fontFamily: "'Courier New',monospace", fontSize: 11, letterSpacing: "0.3em", color: "#ddd8c8", background: "none", border: "1px solid rgba(200,190,170,0.3)", padding: "8px 24px", cursor: "pointer" }}
          >
            {playing ? "STOP" : "PLAY"}
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        style={{ width: "90%", height: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <canvas
          ref={canvasRef}
          style={{ background: "#000", boxShadow: "0 0 60px rgba(20,30,60,0.3)" }}
        />
      </div>
    </div>
  );
}
