import type { Metadata } from "next";
import { Manrope, Prata } from "next/font/google";
import "./globals.css";
import editorialStyles from "@/src/shared/ui/editorial.module.css";
import motionStyles from "@/src/shared/ui/motion.module.css";
import typographyStyles from "@/src/shared/ui/typography.module.css";
import strictTypographyStyles from "@/src/shared/ui/strict-typography.module.css";
import { CookieConsent } from "@/src/shared/ui/cookie-consent";

const manrope = Manrope({ subsets: ["cyrillic", "latin"], variable: "--font-manrope", display: "swap" });
const prata = Prata({ weight: "400", subsets: ["cyrillic", "latin"], variable: "--font-prata", display: "swap" });

export const metadata: Metadata = {
  title: "Фасадная симфония — навесные фасады под ключ",
  description: "Проектирование, производство и монтаж навесных фасадов на знаковых объектах Москвы.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${manrope.variable} ${prata.variable} ${editorialStyles.scope} ${motionStyles.scope} ${typographyStyles.scope} ${strictTypographyStyles.scope}`}>
      <body>{children}<CookieConsent /></body>
    </html>
  );
}
