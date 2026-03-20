import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0F172A",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Saffron glow top */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "400px",
            background:
              "radial-gradient(ellipse," +
              "rgba(249,115,22,0.25) 0%," +
              "transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Tricolor bar top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background:
              "linear-gradient(90deg," +
              "#FF9933 33%," +
              "#FFFFFF 33% 66%," +
              "#138808 66%)",
            display: "flex",
          }}
        />

        {/* Flag icon */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "#1E293B",
            border: "3px solid #F97316",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
            marginBottom: "24px",
          }}
        >
          🇮🇳
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: 800,
            color: "white",
            letterSpacing: "-2px",
            marginBottom: "16px",
            display: "flex",
          }}
        >
          Yojana
          <span style={{ color: "#F97316" }}>AI</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.65)",
            marginBottom: "40px",
            textAlign: "center",
            maxWidth: "700px",
          }}
        >
          Find every Indian government scheme you qualify for
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: "24px",
          }}
        >
          {(
            [
              ["770+", "Schemes"],
              ["8", "Languages"],
              ["60s", "Results"],
              ["Free", "Always"],
            ] as const
          ).map(([num, label]) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "16px",
                padding: "16px 28px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                  color: "#F97316",
                }}
              >
                {num}
              </span>
              <span
                style={{
                  fontSize: "16px",
                  color: "rgba(255,255,255,0.5)",
                  marginTop: "4px",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            fontSize: "18px",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          yojanai-rosy.vercel.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
