"use client";

import { useState } from "react";
import { updateFacturaEstado, getFacturas } from "@/lib/actions";
import { generateInvoicePDF } from "@/lib/pdf-generator";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Search,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  X,
  FileText,
  Filter,
  RefreshCw
} from "lucide-react";

interface Cliente {
  tipoIdentificacion: string;
  documento: string;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  pais: string;
}

interface Detalle {
  codigo: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  impuesto: number | null;
  subtotal: number;
  total: number;
}

interface Factura {
  id: string;
  numero: string;
  clienteId: string;
  fechaEmision: Date | string;
  fechaVencimiento: Date | string;
  subtotal: number;
  impuestos: number;
  descuento: number;
  descuentoValor: number;
  total: number;
  notas: string | null;
  condicionesPago: string | null;
  estado: string;
  createdAt: Date;
  cliente: Cliente;
  detalles?: Detalle[];
}

interface FacturasContentProps {
  initialFacturas: Factura[];
  empresa: any;
}

export default function FacturasContent({
  initialFacturas,
  empresa
}: FacturasContentProps) {
  const [facturas, setFacturas] = useState<Factura[]>(initialFacturas);

  const [search, setSearch] = useState("");
  const [filterCliente, setFilterCliente] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterMinVal, setFilterMinVal] = useState("");
  const [filterMaxVal, setFilterMaxVal] = useState("");

  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [downloadLoadingId, setDownloadLoadingId] = useState<string | null>(null);

  const refreshList = async () => {
    const data = await getFacturas();
    setFacturas(data as any);
  };

  const handleDownloadPDF = async (factura: Factura) => {
    if (downloadLoadingId === factura.id) return; // evitar doble click
    setDownloadLoadingId(factura.id);
    try {
      let fullFactura = factura;
      // Si aún no tenemos los detalles, los solicitamos
      if (!factura.detalles || factura.detalles.length === 0) {
        const res = await fetch(`/api/facturas/${factura.id}`);
        if (!res.ok) {
          throw new Error(`Error al obtener la factura: ${res.status} ${res.statusText}`);
        }
        fullFactura = await res.json();
      }
      if (!fullFactura.detalles || fullFactura.detalles.length === 0) {
        throw new Error("La factura no tiene detalles para generar el PDF.");
      }
      generateInvoicePDF(fullFactura as any, empresa);
    } catch (err) {
      console.error("[PDF] Error al generar la factura:", err);
      alert(`No se pudo generar el PDF: ${err instanceof Error ? err.message : "Error desconocido"}`);
    } finally {
      setDownloadLoadingId(null);
    }
  };

  const handleOpenDetail = async (factura: Factura) => {
    setSelectedFactura(factura);
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/facturas/${factura.id}`);
      if (res.ok) {
        const fullFactura = await res.json();
        setSelectedFactura(fullFactura);
      }
    } catch {
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, nuevoEstado: string) => {
    setActionLoadingId(id);
    try {
      await updateFacturaEstado(id, nuevoEstado);
      if (selectedFactura && selectedFactura.id === id) {
        setSelectedFactura((prev) => (prev ? { ...prev, estado: nuevoEstado } : null));
      }
      await refreshList();
    } catch {
    } finally {
      setActionLoadingId(null);
    }
  };

  const clientsList = Array.from(
    new Map(facturas.map((f) => [f.clienteId, f.cliente.nombre])).entries()
  );

  const filteredFacturas = facturas.filter((f) => {
    const matchesSearch = f.numero.toLowerCase().includes(search.toLowerCase());
    const matchesCliente =
      filterCliente === "todos" || f.clienteId === filterCliente;
    const matchesEstado = filterEstado === "todos" || f.estado === filterEstado;

    const min = parseFloat(filterMinVal);
    const max = parseFloat(filterMaxVal);
    const matchesMinVal = isNaN(min) || f.total >= min;
    const matchesMaxVal = isNaN(max) || f.total <= max;

    return (
      matchesSearch &&
      matchesCliente &&
      matchesEstado &&
      matchesMinVal &&
      matchesMaxVal
    );
  });

  const getStatusStyle = (estado: string) => {
    switch (estado) {
      case "pagada":
        return "bg-emerald-950/40 text-emerald-400 border-emerald-800/30";
      case "anulada":
        return "bg-red-950/40 text-red-400 border-red-800/30";
      case "vencida":
        return "bg-amber-950/40 text-amber-400 border-amber-800/30";
      default:
        return "bg-blue-950/40 text-blue-400 border-blue-800/30";
    }
  };

  const getStatusText = (estado: string) => {
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Historial de Facturas
          </h1>
          <p className="text-slate-400 mt-1">
            Consulta, filtra y gestiona el historial de facturas generadas.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            N° Factura
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 w-full rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Cliente
          </label>
          <select
            value={filterCliente}
            onChange={(e) => setFilterCliente(e.target.value)}
            className="px-3 py-2 w-full rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white cursor-pointer"
          >
            <option value="todos">Todos</option>
            {clientsList.map(([id, nombre]) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Estado
          </label>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-3 py-2 w-full rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white cursor-pointer"
          >
            <option value="todos">Todos</option>
            <option value="emitida">Emitida</option>
            <option value="pagada">Pagada</option>
            <option value="anulada">Anulada</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Valor Mínimo
          </label>
          <input
            type="number"
            placeholder="Min $"
            value={filterMinVal}
            onChange={(e) => setFilterMinVal(e.target.value)}
            className="px-3 py-1.5 w-full rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Valor Máximo
          </label>
          <input
            type="number"
            placeholder="Max $"
            value={filterMaxVal}
            onChange={(e) => setFilterMaxVal(e.target.value)}
            className="px-3 py-1.5 w-full rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800/80 rounded-xl shadow-xs overflow-hidden">
        {filteredFacturas.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-slate-650 mx-auto mb-3" />
            <h3 className="font-semibold text-white text-sm">
              No se encontraron facturas
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto">
              Intenta cambiar los criterios de búsqueda o emite una nueva factura.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-950/40 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Número</th>
                  <th className="px-6 py-3.5">Cliente</th>
                  <th className="px-6 py-3.5">Emisión</th>
                  <th className="px-6 py-3.5">Vencimiento</th>
                  <th className="px-6 py-3.5 text-right">Total</th>
                  <th className="px-6 py-3.5 text-center">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredFacturas.map((factura) => (
                  <tr
                    key={factura.id}
                    className="hover:bg-slate-850/20 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-indigo-400">
                      {factura.numero}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">
                        {factura.cliente.nombre}
                      </div>
                      <div className="text-xs text-slate-500">
                        {factura.cliente.documento}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-medium">
                      {formatDate(factura.fechaEmision)}
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-medium">
                      {formatDate(factura.fechaVencimiento)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-white">
                      {formatCurrency(factura.total)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full border text-2xs font-semibold uppercase tracking-wider ${getStatusStyle(
                          factura.estado
                        )}`}
                      >
                        {getStatusText(factura.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleOpenDetail(factura)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                          title="Ver Detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(factura)}
                          disabled={downloadLoadingId === factura.id}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Descargar PDF"
                        >
                          {downloadLoadingId === factura.id
                            ? <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
                            : <Download className="h-4 w-4" />}
                        </button>
                        {factura.estado === "emitida" && (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateStatus(factura.id, "pagada")
                              }
                              disabled={actionLoadingId === factura.id}
                              className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition-colors"
                              title="Marcar como Pagada"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(factura.id, "anulada")
                              }
                              disabled={actionLoadingId === factura.id}
                              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                              title="Anular Factura"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isDetailModalOpen && selectedFactura && (
        <div className="fixed inset-0 z-50 bg-slate-955/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl w-full max-w-3xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white">
                  Detalle de Factura
                </h2>
                <span className="font-mono text-sm text-slate-500">
                  {selectedFactura.numero}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full border text-2xs font-semibold uppercase tracking-wider ${getStatusStyle(
                    selectedFactura.estado
                  )}`}
                >
                  {getStatusText(selectedFactura.estado)}
                </span>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {detailLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-500 text-sm">
                  <RefreshCw className="h-8 w-8 animate-spin text-indigo-400" />
                  <span>Cargando conceptos...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Cliente
                      </h4>
                      <p className="font-semibold text-white">
                        {selectedFactura.cliente.nombre}
                      </p>
                      <p className="text-xs text-slate-400">
                        {selectedFactura.cliente.tipoIdentificacion}:{" "}
                        {selectedFactura.cliente.documento}
                      </p>
                      <p className="text-xs text-slate-400">
                        {selectedFactura.cliente.correo} | Tel:{" "}
                        {selectedFactura.cliente.telefono}
                      </p>
                    </div>

                    <div className="space-y-1 md:text-right">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Fechas de Control
                      </h4>
                      <p className="text-sm text-slate-300">
                        <span className="font-medium">Emisión:</span>{" "}
                        {formatDate(selectedFactura.fechaEmision)}
                      </p>
                      <p className="text-sm text-slate-300">
                        <span className="font-medium">Vencimiento:</span>{" "}
                        {formatDate(selectedFactura.fechaVencimiento)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-white">
                      Conceptos Facturados
                    </h4>
                    <div className="border border-slate-800 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="bg-slate-950/40 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            <th className="px-4 py-2.5">Código</th>
                            <th className="px-4 py-2.5">Descripción</th>
                            <th className="px-4 py-2.5 text-center">Cant</th>
                            <th className="px-4 py-2.5 text-right">Precio Unit</th>
                            <th className="px-4 py-2.5 text-center">IVA</th>
                            <th className="px-4 py-2.5 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {selectedFactura.detalles?.map((d, index) => (
                            <tr key={index} className="text-xs hover:bg-slate-850/10">
                              <td className="px-4 py-2 font-mono text-slate-400">
                                {d.codigo}
                              </td>
                              <td className="px-4 py-2 font-medium text-white">
                                {d.nombre}
                              </td>
                              <td className="px-4 py-2 text-center text-slate-300">
                                {d.cantidad}
                              </td>
                              <td className="px-4 py-2 text-right text-slate-300">
                                {formatCurrency(d.precioUnitario)}
                              </td>
                              <td className="px-4 py-2 text-center text-slate-300">
                                {d.impuesto ? `${d.impuesto}%` : "0%"}
                              </td>
                              <td className="px-4 py-2 text-right font-semibold text-white">
                                {formatCurrency(d.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                    <div className="space-y-3">
                      {selectedFactura.notas && (
                        <div className="text-xs">
                          <h4 className="font-semibold text-slate-350">
                            Notas del Documento
                          </h4>
                          <p className="text-slate-400 mt-1 whitespace-pre-line">
                            {selectedFactura.notas}
                          </p>
                        </div>
                      )}
                      {(selectedFactura.condicionesPago || empresa.condicionesPago) && (
                        <div className="text-xs">
                          <h4 className="font-semibold text-slate-355">
                            Condiciones de Pago
                          </h4>
                          <p className="text-slate-400 mt-1">
                            {selectedFactura.condicionesPago || empresa.condicionesPago}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-slate-400 self-end">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-semibold text-slate-200">
                          {formatCurrency(selectedFactura.subtotal)}
                        </span>
                      </div>
                      {selectedFactura.descuento > 0 && (
                        <div className="flex justify-between">
                          <span>Descuento ({selectedFactura.descuento}%):</span>
                          <span className="font-semibold text-red-400">
                            -{formatCurrency(selectedFactura.descuentoValor)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Impuestos (IVA):</span>
                        <span className="font-semibold text-slate-200">
                          {formatCurrency(selectedFactura.impuestos)}
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-dashed border-slate-800">
                        <span>Total Factura:</span>
                        <span className="text-indigo-400">
                          {formatCurrency(selectedFactura.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-800 flex justify-between items-center bg-slate-950/50">
              <div className="flex gap-2">
                {selectedFactura.estado === "emitida" && (
                  <>
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedFactura.id, "pagada")
                      }
                      disabled={actionLoadingId === selectedFactura.id}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Marcar Pagada
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedFactura.id, "anulada")
                      }
                      disabled={actionLoadingId === selectedFactura.id}
                      className="inline-flex items-center gap-1.5 bg-red-650 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Anular Factura
                    </button>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadPDF(selectedFactura)}
                  disabled={downloadLoadingId === selectedFactura.id}
                  className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-lg shadow-indigo-600/10 cursor-pointer"
                >
                  {downloadLoadingId === selectedFactura.id ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Generando PDF...
                    </>
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5" />
                      Descargar PDF
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors text-xs font-semibold cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
