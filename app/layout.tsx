import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Фасадная симфония — навесные фасады под ключ",
  description: "Проектирование, производство и монтаж навесных фасадов на знаковых объектах Москвы.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
