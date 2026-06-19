"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts";
import {
  TrendingUp,
  Users,
  Package,
  FileSpreadsheet,
  RefreshCw
} from "lucide-react";

interface StatsData {
  totalVendido: number;
  facturasEmitidasCount: number;
  clientesCount: number;
  topClientes: { nombre: string; total: number }[];
  topProductos: { nombre: string; cantidad: number; total: number }[];
  ventasPorMes: { mes: string; total: number }[];
  facturasPorEstado: { estado: string; cantidad: number }[];
  avgVenta: number;
}

interface EstadisticasContentProps {
  stats: StatsData;
}

export default function EstadisticasContent({ stats }: EstadisticasContentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#64748b"];

  const getEstadoName = (estado: string) => {
    switch (estado) {
      case "pagada":
        return "Pagada";
      case "anulada":
        return "Anulada";
      case "vencida":
        return "Vencida";
      default:
        return "Emitida";
    }
  };

  const pieData = stats.facturasPorEstado.map((item) => ({
    name: getEstadoName(item.estado),
    value: item.cantidad
  }));

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
        <span className="text-sm font-medium">Cargando gráficos interactivos...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Analítica Comercial</h1>
        <p className="text-slate-400 mt-1">
          Visualiza estadísticas de ventas, clientes recurrentes y productos más demandados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800/80 shadow-xs flex flex-col justify-between h-28">
          <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Facturación Neta</span>
          <span className="text-xl font-bold text-white">{formatCurrency(stats.totalVendido)}</span>
        </div>
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800/80 shadow-xs flex flex-col justify-between h-28">
          <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Ticket Promedio</span>
          <span className="text-xl font-bold text-white">{formatCurrency(stats.avgVenta)}</span>
        </div>
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800/80 shadow-xs flex flex-col justify-between h-28">
          <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Facturas Emitidas</span>
          <span className="text-xl font-bold text-white">{stats.facturasEmitidasCount}</span>
        </div>
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800/80 shadow-xs flex flex-col justify-between h-28">
          <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Clientes Activos</span>
          <span className="text-xl font-bold text-white">{stats.clientesCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 rounded-xl border border-slate-800/80 shadow-xs p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-6">
            <TrendingUp className="h-4 w-4 text-indigo-400" />
            Evolución de Ingresos Mensuales
          </h3>
          <div className="h-72 w-full">
            {stats.ventasPorMes.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-500">Sin datos de ventas</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.ventasPorMes} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="mes" stroke="#64748b" fontSize={11} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(value ? Number(value) : 0), "Ventas"]}
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px" }}
                    itemStyle={{ color: "#f8fafc" }}
                    labelStyle={{ color: "#94a3b8" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800/80 shadow-xs p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-6">
            <FileSpreadsheet className="h-4 w-4 text-emerald-450" />
            Facturas por Estado
          </h3>
          <div className="h-72 w-full flex items-center justify-center">
            {pieData.length === 0 ? (
              <div className="text-sm text-slate-500">Sin datos registrados</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px" }}
                    itemStyle={{ color: "#f8fafc" }}
                    labelStyle={{ color: "#94a3b8" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: "11px" }}
                    formatter={(value) => <span className="text-slate-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800/80 shadow-xs p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-6">
            <Users className="h-4 w-4 text-purple-450" />
            Facturación por Cliente (Top 5)
          </h3>
          <div className="h-72 w-full">
            {stats.topClientes.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-500">Sin datos registrados</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topClientes} layout="vertical" margin={{ left: 20, right: 10, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    type="number"
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis dataKey="nombre" type="category" stroke="#64748b" fontSize={10} width={100} />
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(value ? Number(value) : 0), "Total comprado"]}
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px" }}
                    itemStyle={{ color: "#f8fafc" }}
                    labelStyle={{ color: "#94a3b8" }}
                  />
                  <Bar dataKey="total" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800/80 shadow-xs p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-6">
            <Package className="h-4 w-4 text-orange-455" />
            Ingresos por Producto (Top 5)
          </h3>
          <div className="h-72 w-full">
            {stats.topProductos.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-500">Sin datos registrados</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topProductos} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="nombre" stroke="#64748b" fontSize={9} tickLine={false} height={40} interval={0} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(value ? Number(value) : 0), "Ingreso total"]}
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px" }}
                    itemStyle={{ color: "#f8fafc" }}
                    labelStyle={{ color: "#94a3b8" }}
                  />
                  <Bar dataKey="total" fill="#f87171" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
