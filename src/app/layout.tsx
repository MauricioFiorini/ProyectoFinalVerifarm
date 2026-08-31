import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Verifarm",
  description:
    "Gestion farmaceutica: trazabilidad de stock por lote y deteccion de interacciones medicamentosas.",
};

// Las props se tipan a mano y no con `LayoutProps<"/">`, el helper global de
// Next. Ese tipo lo genera Next dentro de `.next/types` al correr `dev` o
// `build`, asi que en un clon limpio —sin `.next`— no existe y `npm run check`
// falla con "Cannot find name 'LayoutProps'". Un comando de validacion no puede
// depender de artefactos generados: tiene que pasar en una maquina recien
// clonada, antes de haber levantado nada.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
