import type { Metadata } from "next";
import { Manrope, Prata } from "next/font/google";
import "./globals.css";
import editorialStyles from "@/src/shared/ui/editorial.module.css";
import motionStyles from "@/src/shared/ui/motion.module.css";
import typographyStyles from "@/src/shared/ui/typography.module.css";
import strictTypographyStyles from "@/src/shared/ui/strict-typography.module.css";
import { CookieConsent } from "@/src/features/cookie-consent";
import { absoluteUrl, siteDescription, siteName, siteUrl } from "@/src/shared/lib/site";

const manrope = Manrope({ subsets: ["cyrillic", "latin"], variable: "--font-manrope", display: "swap" });
const prata = Prata({ weight: "400", subsets: ["cyrillic", "latin"], variable: "--font-prata", display: "swap" });

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Фасадная симфония — навесные фасады под ключ",
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/icon.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName,
    title: "Фасадная симфония — навесные фасады под ключ",
    description: siteDescription,
    images: [{ url: "/about-hero-v2.webp", alt: siteName }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Фасадная симфония — навесные фасады под ключ",
    description: siteDescription,
    images: ["/about-hero-v2.webp"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/icon.png"),
    telephone: "+7 499 957-80-30",
    address: {
      "@type": "PostalAddress",
      postalCode: "121099",
      addressLocality: "Москва",
      streetAddress: "Панфиловский пер., д. 4, стр. 1, помещ. 5/4/2",
      addressCountry: "RU",
    },
  };
  return (
    <html lang="ru" className={`${manrope.variable} ${prata.variable} ${editorialStyles.scope} ${motionStyles.scope} ${typographyStyles.scope} ${strictTypographyStyles.scope}`}>
      <body>
        {children}
        <CookieConsent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
