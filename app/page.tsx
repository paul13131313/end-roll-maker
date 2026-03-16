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
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
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
