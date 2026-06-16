import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Try GLM-5.2 in Claude Code after Fable 5 suspension";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background:
            "linear-gradient(135deg, #f7ead8 0%, #f5e2c5 45%, #e6c3a2 100%)",
          color: "#201916",
          fontFamily: "Arial",
          padding: "56px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            border: "2px solid rgba(32,25,22,0.12)",
            borderRadius: "32px",
            padding: "44px",
            background: "rgba(255,255,255,0.55)",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 28,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#8f4b2e",
            }}
          >
            Fable 5 Suspended
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            <div
              style={{
                display: "flex",
                fontSize: 72,
                fontWeight: 700,
                lineHeight: 1.05,
                maxWidth: "920px",
              }}
            >
              Try GLM-5.2 in Claude Code
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 30,
                lineHeight: 1.4,
                color: "#4a3a34",
                maxWidth: "860px",
              }}
            >
              Copy-ready settings.json block, backup, rollback, and official docs
              for a temporary Fable 5 replacement.
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 24,
              color: "#6a5248",
            }}
          >
            <div style={{ display: "flex" }}>glm52-claude-code.vercel.app</div>
            <div style={{ display: "flex" }}>GLM-5.2 Claude Code Setup</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
