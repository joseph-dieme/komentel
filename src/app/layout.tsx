import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { KomentelProvider } from "@/context/KomentelContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Komentel - L'information vérifiée. Le débat est à vous.",
  description: "Suivez l'actualité nationale et internationale en temps réel, et donnez votre avis aux côtés d'une communauté engagée sur Komentel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <KomentelProvider>
          {children}
        </KomentelProvider>
      </body>
    </html>
  );
}
