import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from "next";
import { Archivo_Black, Public_Sans, IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const archivoBlack = Archivo_Black({ variable: "--ff-display", subsets: ["latin"], weight: "400" });
const publicSans = Public_Sans({ variable: "--ff-body", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const ibmPlexMono = IBM_Plex_Mono({ variable: "--ff-stat", subsets: ["latin"], weight: ["500", "600", "700"] });
const spaceGrotesk = Space_Grotesk({ variable: "--ff-wordmark", subsets: ["latin"], weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://shotcaller-game.vercel.app"),
  title: "Shotcaller",
  description:
    "A daily NBA guessing game. Read the shot chart and guess the NBA player.",
  openGraph: {
    title: "Shotcaller",
    description: "A daily NBA guessing game. Read the shot chart and guess the NBA player.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shotcaller",
    description: "A daily NBA guessing game. Read the shot chart and guess the NBA player.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${archivoBlack.variable} ${publicSans.variable} ${ibmPlexMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
