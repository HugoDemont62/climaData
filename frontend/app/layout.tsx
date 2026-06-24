import type { Metadata } from "next";
import { Inter, Space_Grotesk, Spectral } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClimaData — Le climat de votre commune en 2050",
  description:
    "Découvrez les projections climatiques de votre commune à l'horizon 2030, 2040 et 2050. Data-journalisme climatique, sérieux et porteur d'espoir.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${spectral.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
