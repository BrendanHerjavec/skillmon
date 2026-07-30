import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Atmosphere } from "@/components/Atmosphere";
import { AutoplayOverlay } from "@/components/AutoplayOverlay";
import { SoundToggle } from "@/components/SoundToggle";

// Display: a warm, characterful serif — the "field guide" voice.
const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["SOFT", "WONK"], // variable weight axis stays enabled by omitting `weight`
});

// UI: friendly geometric sans, deliberately not Inter/system default.
const body = Plus_Jakarta_Sans({
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VIVARIA — level up for real",
  description:
    "A creature-collecting RPG where your monster's power comes from real skills you learn. Pass an AI quiz battle, earn XP, evolve.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <Atmosphere />
        {children}
        <AutoplayOverlay />
        <SoundToggle />
      </body>
    </html>
  );
}
