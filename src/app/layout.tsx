import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./bootstrap-custom.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agenda AI - Gestão de Agendamentos por WhatsApp",
  description:
    "Automatize seu atendimento, organize seus serviços e aumente seus agendamentos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-100">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-vh-100 bg-white`}
      >
        {children}
      </body>
    </html>
  );
}
