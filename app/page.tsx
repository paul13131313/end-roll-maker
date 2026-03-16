"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let raf: number;
    const loop = () => {
      setTime(Date.now());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const sway = Math.sin(time / 2000) * 10;
  const opacity = 0.75 + Math.sin(time / 3500) * 0.25;
  const glowOpacity = 0.3 + Math.sin(time / 2800) * 0.15;

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
        overflow: "hidden",
      }}
    >
      <svg
        viewBox="0 0 1200 700"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="screenGlow" cx="50%" cy="0%" r="80%">
            <stop offset="0%" stopColor="#0d1f45" />
            <stop offset="100%" stopColor="#000008" />
          </radialGradient>
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.85" />
          </radialGradient>
        </defs>
        <rect width="1200" height="700" fill="#00000f" />
        <rect x="120" y="15" width="960" height="200" rx="3" fill="url(#screenGlow)" />
        <rect
          x="120"
          y="15"
          width="960"
          height="200"
          rx="3"
          fill="none"
          stroke="#1a2e5a"
          strokeWidth="1.5"
          opacity="0.7"
        />
        <rect x="130" y="23" width="940" height="184" rx="2" fill="#040d20" />
        <rect x="130" y="23" width="940" height="3" rx="1" fill="#1e3878" opacity="0.4" />
        <polygon points="555,700 645,700 710,225 490,225" fill="#02020c" />
        <polygon points="575,700 625,700 650,400 550,400" fill="#060616" opacity="0.8" />
        {[
          { y: 238, count: 12, width: 580 },
          { y: 278, count: 14, width: 640 },
          { y: 322, count: 16, width: 710 },
          { y: 370, count: 18, width: 780 },
          { y: 422, count: 20, width: 850 },
          { y: 478, count: 22, width: 920 },
          { y: 538, count: 24, width: 990 },
          { y: 602, count: 26, width: 1060 },
          { y: 648, count: 28, width: 1120 },
        ].map((row, rowIdx) => {
          const startX = (1200 - row.width) / 2;
          const sp = row.width / row.count;
          return Array.from({ length: row.count }, (_, i) => {
            const sx = startX + sp * i + sp / 2;
            if (sx > 540 && sx < 660) return null;
            const seatW = sp * 0.72;
            const seatH = 16 + rowIdx * 1.5;
            const d = 4 + rowIdx * 1.2;
            return (
              <g key={`${rowIdx}-${i}`}>
                <rect
                  x={sx - seatW / 2}
                  y={row.y}
                  width={seatW}
                  height={seatH}
                  rx="2.5"
                  fill={`hsl(230,18%,${d}%)`}
                  stroke="#000018"
                  strokeWidth="0.8"
                />
                <rect
                  x={sx - seatW / 2 + 2}
                  y={row.y}
                  width={seatW - 4}
                  height={3}
                  rx="1.5"
                  fill={`hsl(230,22%,${d + 3}%)`}
                  opacity="0.7"
                />
              </g>
            );
          });
        })}
        <rect width="1200" height="700" fill="url(#vignette)" />
      </svg>

      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          transform: `translateX(${sway}px)`,
        }}
      >
        <div
          style={{
            fontFamily: "'IM Fell English','Playfair Display','Times New Roman',serif",
            fontStyle: "italic",
            fontSize: "clamp(42px,7.5vw,92px)",
            fontWeight: 400,
            letterSpacing: "0.12em",
            color: `rgba(228,220,200,${opacity})`,
            textShadow: `0 0 80px rgba(80,110,200,${glowOpacity}),0 0 30px rgba(80,110,200,${glowOpacity * 0.5})`,
            lineHeight: 1,
            marginBottom: "20px",
          }}
        >
          end roll maker
        </div>
        <div
          style={{
            fontFamily: "'Courier New',monospace",
            fontSize: "10px",
            letterSpacing: "0.45em",
            color: `rgba(180,165,140,${opacity * 0.5})`,
            textTransform: "uppercase",
          }}
        >
          your life · your credits
        </div>
      </div>

      <a
        href="/edit"
        style={{
          position: "absolute",
          bottom: "60px",
          zIndex: 10,
          fontFamily: "'Courier New',monospace",
          fontSize: "11px",
          letterSpacing: "0.4em",
          color: "rgba(200,190,170,0.6)",
          textDecoration: "none",
          textTransform: "uppercase",
          border: "1px solid rgba(200,190,170,0.2)",
          padding: "12px 32px",
          transition: "all 0.3s",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLElement).style.color = "rgba(228,220,200,0.9)";
          (e.target as HTMLElement).style.borderColor = "rgba(228,220,200,0.5)";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.color = "rgba(200,190,170,0.6)";
          (e.target as HTMLElement).style.borderColor = "rgba(200,190,170,0.2)";
        }}
      >
        はじめる
      </a>
    </div>
  );
}
