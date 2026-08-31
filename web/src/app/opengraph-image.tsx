import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Shotcaller — a daily NBA guessing game";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori reads neither CSS variables nor oklch(), so the design tokens are
// resolved to sRGB here. Keep in sync with :root in globals.css.
const INK = "#0A0502";
const BG = "#FAF0E3";
const PAPER = "#FFFBF4";
const PRIMARY = "#CF4700";
const PRIMARY_TINT = "#FED4B9";

export default async function Image() {
  const dir = join(process.cwd(), "src", "app");
  const [font, chart] = await Promise.all([
    readFile(join(dir, "ArchivoBlack-Regular.ttf")),
    readFile(join(dir, "og-chart.svg"), "utf8"),
  ]);
  const chartSrc = `data:image/svg+xml;base64,${Buffer.from(chart).toString("base64")}`;

  return new ImageResponse(<Card chartSrc={chartSrc} />, {
    ...size,
    fonts: [{ name: "Archivo Black", data: font, weight: 400, style: "normal" }],
  });
}

function Card({ chartSrc }: { chartSrc: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 40,
        padding: 56,
        background: BG,
        fontFamily: "Archivo Black",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 28,
        }}
      >
        <Wordmark />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 62,
            lineHeight: 1.02,
            letterSpacing: "-0.02em",
            color: INK,
          }}
        >
          <span>READ THE</span>
          <span>CHART.</span>
          <span style={{ color: PRIMARY }}>NAME THE</span>
          <span style={{ color: PRIMARY }}>PLAYER.</span>
        </div>
        <div
          style={{
            display: "flex",
            padding: "10px 20px",
            fontSize: 20,
            letterSpacing: "0.04em",
            color: INK,
            background: PRIMARY_TINT,
            border: `3px solid ${INK}`,
            borderRadius: 999,
            boxShadow: `4px 4px 0 ${INK}`,
          }}
        >
          A DAILY NBA GUESSING GAME
        </div>
      </div>

      <div
        style={{
          display: "flex",
          width: 520,
          padding: 20,
          background: PAPER,
          border: `4px solid ${INK}`,
          borderRadius: 32,
          boxShadow: `10px 10px 0 ${INK}`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={chartSrc} width={480} height={360} alt="" />
      </div>
    </div>
  );
}

// Mirrors the header sticker in GameScreen.tsx. The Target icon is redrawn
// with nested divs because Satori has no lucide.
function Wordmark() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "10px 24px 10px 10px",
        background: PRIMARY,
        border: `4px solid ${INK}`,
        borderRadius: 20,
        boxShadow: `6px 6px 0 ${INK}`,
        transform: "rotate(-2deg)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 52,
          height: 52,
          background: INK,
          borderRadius: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            border: `4px solid ${PRIMARY}`,
            borderRadius: 999,
          }}
        >
          <div style={{ width: 8, height: 8, background: PRIMARY, borderRadius: 999 }} />
        </div>
      </div>
      <span style={{ fontSize: 40, letterSpacing: "-0.01em", color: INK }}>SHOTCALLER</span>
    </div>
  );
}
