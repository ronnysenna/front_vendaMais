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
  title: "VendaMais - Gestão de Vendas por WhatsApp",
  description:
    "Automatize seu atendimento, organize seus produtos e aumente suas vendas",
  // Adicionando metadados para prevenir cache a nível de navegador
  other: {
    "Cache-Control": "no-cache, no-store, must-revalidate, private",
    "Pragma": "no-cache",
    "Expires": "0",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-100">
      <head>
        {/* Metadados para prevenir cache e forçar carregamento da versão mais recente */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate, private" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        {/* Tag para forçar recarregamento em caso de alteração na versão */}
        <meta name="build-id" content={process.env.NEXT_PUBLIC_BUILD_ID || `build-${Date.now()}`} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-vh-100 bg-white`}
      >
        {children}
        {/* No-Script para limpar o cache do navegador em produção */}
        <noscript>
          <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
          <meta httpEquiv="Pragma" content="no-cache" />
          <meta httpEquiv="Expires" content="0" />
        </noscript>
      </body>
    </html>
  );
}
