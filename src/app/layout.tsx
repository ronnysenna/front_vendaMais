import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import "./bootstrap-custom.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
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
        className={`${inter.variable} ${robotoMono.variable} antialiased min-vh-100 bg-white`}
      >
        {children}
      </body>
    </html>
  );
}
