import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Sen — self-hosted (variable, poids 400→800). Aucune dépendance Google Fonts.
const sen = localFont({
  src: [{ path: "./fonts/Sen-latin.woff2", weight: "400 800", style: "normal" }],
  variable: "--font-sen",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClimaData : le climat de votre commune en 2050",
  description:
    "Découvrez les projections climatiques de votre commune à l'horizon 2030, 2040 et 2050. Data-journalisme climatique, sérieux et porteur d'espoir.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${sen.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
