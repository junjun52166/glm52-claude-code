import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #8f4b2e 0%, #d38a58 100%)",
          borderRadius: "36px",
          color: "#fff8ef",
          fontSize: 88,
          fontWeight: 700,
          fontFamily: "Arial",
        }}
      >
        G5
      </div>
    ),
    size,
  );
}
