import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { getEmpresa, getSesionUsuario } from "@/lib/actions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema de Facturación",
  description: "Gestión y generación de facturas electrónicas en PDF",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [empresa, usuario] = await Promise.all([
    getEmpresa(),
    getSesionUsuario()
  ]);

  if (!usuario) {
    return (
      <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
        <body className="h-full bg-slate-950 text-slate-100 flex flex-col">
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="h-full bg-slate-950 text-slate-100 flex flex-col lg:flex-row overflow-hidden">
        <Sidebar
          empresaNombre={empresa.nombre}
          empresaLogo={empresa.logo}
          usuario={usuario}
        />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
