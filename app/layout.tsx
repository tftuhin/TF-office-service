import type { Metadata } from "next";
import { Fraunces, Public_Sans } from "next/font/google";
import "./globals.css";
import { SwRegister } from "@/components/sw-register";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600"] });
const sans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Themefisher — Office Service",
  description: "Office service ordering and management system",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Themefisher",
  },
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        {children}
        <SwRegister />
      </body>
    </html>
  );
}
