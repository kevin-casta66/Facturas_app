import Link from "next/link";
import { revalidatePath } from "next/cache";
import { getFacturaStats, seedDemoData } from "@/lib/actions";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  FileText,
  Users,
  TrendingUp,
  Plus,
  ArrowRight,
  Package,
  Settings,
  Database
} from "lucide-react";

export default async function DashboardPage() {
  const stats = await getFacturaStats();

  async function handleSeed() {
    "use server";
    await seedDemoData();
    revalidatePath("/");
  }

  const showSeedBanner = stats.clientesCount === 0 && stats.facturasEmitidasCount === 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Resumen general de facturación y desempeño comercial.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/facturas/nueva"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-lg shadow-indigo-600/10 active:scale-98"
          >
            <Plus className="h-4 w-4" />
            Nueva Factura
          </Link>
        </div>
      </div>

      {showSeedBanner && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Database className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">¡Bienvenido al Sistema de Facturación!</h2>
              <p className="text-indigo-100 mt-1 max-w-xl">
                Parece que tu base de datos está vacía. Puedes cargar un conjunto de datos ficticios (clientes, productos y facturas) para comenzar a explorar y probar todas las funcionalidades inmediatamente.
              </p>
            </div>
          </div>
          <form action={handleSeed}>
            <button
              type="submit"
              className="bg-white hover:bg-slate-100 text-indigo-600 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Database className="h-4 w-4" />
              Cargar datos demo
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800/80 shadow-xs flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Facturado</span>
            <span className="text-2xl font-bold text-white">{formatCurrency(stats.totalVendido)}</span>
          </div>
          <div className="p-3 bg-emerald-950/40 text-emerald-400 border border-emerald-800/30 rounded-lg">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800/80 shadow-xs flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Facturas Generadas</span>
            <span className="text-2xl font-bold text-white">{stats.facturasEmitidasCount}</span>
          </div>
          <div className="p-3 bg-blue-950/40 text-blue-400 border border-blue-800/30 rounded-lg">
            <FileText className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800/80 shadow-xs flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clientes Activos</span>
            <span className="text-2xl font-bold text-white">{stats.clientesCount}</span>
          </div>
          <div className="p-3 bg-purple-950/40 text-purple-400 border border-purple-800/30 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800/80 shadow-xs flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ticket Promedio</span>
            <span className="text-2xl font-bold text-white">{formatCurrency(stats.avgVenta)}</span>
          </div>
          <div className="p-3 bg-orange-950/40 text-orange-400 border border-orange-800/30 rounded-lg">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800/80 shadow-xs p-6">
        <h3 className="text-base font-semibold text-white mb-4">Accesos Rápidos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/clientes?nuevo=true"
            className="flex items-center justify-between p-4 rounded-xl border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-950/10 group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-950/50 text-indigo-400 rounded-lg group-hover:bg-indigo-900/50 group-hover:text-indigo-300">
                <Users className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-sm text-white block">Registrar Cliente</span>
                <span className="text-xs text-slate-400">Añadir nuevo cliente al catálogo</span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            href="/productos?nuevo=true"
            className="flex items-center justify-between p-4 rounded-xl border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-950/10 group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-950/50 text-indigo-400 rounded-lg group-hover:bg-indigo-900/50 group-hover:text-indigo-300">
                <Package className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-sm text-white block">Agregar Producto</span>
                <span className="text-xs text-slate-400">Crear servicio o artículo de venta</span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            href="/configuracion"
            className="flex items-center justify-between p-4 rounded-xl border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-950/10 group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-950/50 text-indigo-400 rounded-lg group-hover:bg-indigo-900/50 group-hover:text-indigo-300">
                <Settings className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-sm text-white block">Ajustes Emisor</span>
                <span className="text-xs text-slate-400">Configurar NIT, dirección y logo</span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 rounded-xl border border-slate-800/80 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Clientes con Mayor Facturación</h3>
              <Link href="/clientes" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-0.5">
                Ver todos
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {stats.topClientes.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">Sin datos para mostrar</div>
            ) : (
              <div className="space-y-4">
                {stats.topClientes.map((cliente, idx) => {
                  const maxTotal = Math.max(...stats.topClientes.map((c) => c.total), 1);
                  const porcentaje = (cliente.total / maxTotal) * 100;
                  return (
                    <div key={idx} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-300 truncate max-w-[280px]">{cliente.nombre}</span>
                        <span className="font-semibold text-white">{formatCurrency(cliente.total)}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800/80 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Productos Más Vendidos</h3>
              <Link href="/productos" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-0.5">
                Ver todos
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {stats.topProductos.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">Sin datos para mostrar</div>
            ) : (
              <div className="space-y-4">
                {stats.topProductos.map((producto, idx) => {
                  const maxCant = Math.max(...stats.topProductos.map((p) => p.cantidad), 1);
                  const porcentaje = (producto.cantidad / maxCant) * 100;
                  return (
                    <div key={idx} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-slate-300 truncate max-w-[220px]">{producto.nombre}</span>
                          <span className="text-xs text-slate-500">{producto.cantidad} unidades vendidas</span>
                        </div>
                        <span className="font-semibold text-white">{formatCurrency(producto.total)}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
