"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  PlusCircle,
  FileText,
  BarChart3,
  Settings,
  Menu,
  X,
  FileSpreadsheet,
  LogOut
} from "lucide-react";
import { logoutAction } from "@/lib/actions";

interface SidebarProps {
  empresaNombre: string;
  empresaLogo: string | null;
  usuario: { nombre: string; email: string } | null;
}

export default function Sidebar({ empresaNombre, empresaLogo, usuario }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Crear Factura", href: "/facturas/nueva", icon: PlusCircle },
    { name: "Facturas", href: "/facturas", icon: FileText },
    { name: "Clientes", href: "/clientes", icon: Users },
    { name: "Productos", href: "/productos", icon: Package },
    { name: "Estadísticas", href: "/estadisticas", icon: BarChart3 },
    { name: "Configuración", href: "/configuracion", icon: Settings }
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <header className="lg:hidden flex items-center justify-between bg-slate-900 text-white px-4 py-3 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          {empresaLogo ? (
            <img
              src={empresaLogo}
              alt="Logo"
              className="h-8 w-8 rounded object-contain bg-white"
            />
          ) : (
            <FileSpreadsheet className="h-6 w-6 text-indigo-400" />
          )}
          <span className="font-bold truncate max-w-[200px]">
            {empresaNombre}
          </span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded text-slate-300 hover:text-white focus:outline-none"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-6 py-6 px-4">
          <div className="flex items-center gap-3 px-2">
            {empresaLogo ? (
              <img
                src={empresaLogo}
                alt="Logo"
                className="h-10 w-10 rounded object-contain bg-white shadow-inner"
              />
            ) : (
              <div className="h-10 w-10 rounded bg-indigo-600 flex items-center justify-center text-white">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-white truncate text-sm">
                {empresaNombre}
              </span>
              <span className="text-xs text-slate-400">Facturación</span>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : item.href === "/facturas"
                  ? pathname === "/facturas"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                      : "hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 flex flex-col gap-3">
          {usuario && (
            <div className="flex flex-col min-w-0 px-2">
              <span className="text-sm font-semibold text-white truncate">
                {usuario.nombre}
              </span>
              <span className="text-2xs text-slate-400 truncate">
                {usuario.email}
              </span>
            </div>
          )}
          <button
            onClick={async () => {
              await logoutAction();
              window.location.href = "/login";
            }}
            className="w-full text-left flex items-center gap-3 px-2 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </button>
          <div className="text-center text-2xs text-slate-500 pt-1">
            Facturas App v1.0.0
          </div>
        </div>
      </aside>
    </>
  );
}
