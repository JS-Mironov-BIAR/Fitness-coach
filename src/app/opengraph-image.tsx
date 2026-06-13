import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "halvafit — занятия и питание";

export default async function OpengraphImage() {
  const font = await readFile(join(process.cwd(), "public/fonts/Roboto-Bold.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          background: "linear-gradient(135deg, #c084fc 0%, #a855f7 45%, #7c3aed 100%)",
          color: "#ffffff",
          fontFamily: "Roboto",
        }}
      >
        <div style={{ fontSize: 88, fontWeight: 700 }}>halvafit</div>
        <div style={{ fontSize: 44, marginTop: 24, opacity: 0.96 }}>
          Занятия и питание — мягко и под тебя
        </div>
        <div style={{ fontSize: 30, marginTop: 18, opacity: 0.85 }}>Гомель · онлайн и очно</div>
      </div>
    ),
    { ...size, fonts: [{ name: "Roboto", data: font, weight: 700, style: "normal" }] },
  );
}
