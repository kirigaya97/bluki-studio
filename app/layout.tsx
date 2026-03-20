import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/providers/LenisProvider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Bluki Studio",
  description: "Creative digital agency — visual content, photography, and brand strategy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={dmSans.variable}>
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
