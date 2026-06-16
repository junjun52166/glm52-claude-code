import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 64,
  height: 64,
};
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: "14px",
          color: "#fff8ef",
          fontSize: 30,
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
