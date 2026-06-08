import type { Metadata } from "next";
import { Fraunces, Public_Sans } from "next/font/google";
import "./globals.css";
import { SwRegister } from "@/components/sw-register";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600"] });
const sans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Cafeteria — Office Canteen",
  description: "Order, prepare, and track office cafeteria meals.",
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
