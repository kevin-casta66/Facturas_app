"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFactura } from "@/lib/actions";
import { generateInvoicePDF } from "@/lib/pdf-generator";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Save,
  User,
  Package,
  Calendar,
  Percent,
  FileText
} from "lucide-react";

interface Cliente {
  id: string;
  nombre: string;
  documento: string;
  tipoIdentificacion: string;
  correo: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  pais: string;
  estado: string;
}

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  precioUnitario: number;
  impuesto: number | null;
  categoria: string;
  estado: string;
}

interface Empresa {
  nombre: string;
  nit: string;
  correo: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  pais: string;
  condicionesPago: string | null;
  footerTexto: string | null;
  logo: string | null;
}

interface NuevaFacturaFormProps {
  clientes: Cliente[];
  productos: Producto[];
  empresa: Empresa;
}

interface ItemFactura {
  productoId: string;
  codigo: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  impuesto: number;
  subtotal: number;
}

export default function NuevaFacturaForm({
  clientes,
  productos,
  empresa
}: NuevaFacturaFormProps) {
  const router = useRouter();

  const [clienteId, setClienteId] = useState("");
  const [fechaEmision, setFechaEmision] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [fechaVencimiento, setFechaVencimiento] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [descuento, setDescuento] = useState(0);
  const [notas, setNotas] = useState("");

  const [items, setItems] = useState<ItemFactura[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddProduct = () => {
    if (!selectedProductId) return;
    const prod = productos.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const existingItemIdx = items.findIndex((i) => i.productoId === prod.id);
    if (existingItemIdx > -1) {
      const updated = [...items];
      updated[existingItemIdx].cantidad += 1;
      updated[existingItemIdx].subtotal =
        updated[existingItemIdx].cantidad * updated[existingItemIdx].precioUnitario;
      setItems(updated);
    } else {
      setItems((prev) => [
        ...prev,
        {
          productoId: prod.id,
          codigo: prod.codigo,
          nombre: prod.nombre,
          cantidad: 1,
          precioUnitario: prod.precioUnitario,
          impuesto: prod.impuesto || 0,
          subtotal: prod.precioUnitario
        }
      ]);
    }
    setSelectedProductId("");
  };

  const handleUpdateItemQty = (index: number, qty: number) => {
    if (qty < 1) return;
    const updated = [...items];
    updated[index].cantidad = qty;
    updated[index].subtotal = qty * updated[index].precioUnitario;
    setItems(updated);
  };

  const handleUpdateItemPrice = (index: number, price: number) => {
    if (price < 0) return;
    const updated = [...items];
    updated[index].precioUnitario = price;
    updated[index].subtotal = updated[index].cantidad * price;
    setItems(updated);
  };

  const handleUpdateItemTax = (index: number, tax: number) => {
    if (tax < 0 || tax > 100) return;
    const updated = [...items];
    updated[index].impuesto = tax;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
  const descuentoValor = subtotal * (descuento / 100);
  const subtotalConDescuento = subtotal - descuentoValor;

  const impuestos = items.reduce((acc, item) => {
    const itemSubtotal = item.cantidad * item.precioUnitario;
    const itemDescuentoProporcional = itemSubtotal * (descuento / 100);
    const itemBaseImponible = itemSubtotal - itemDescuentoProporcional;
    return acc + itemBaseImponible * (item.impuesto / 100);
  }, 0);

  const total = subtotalConDescuento + impuestos;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!clienteId) {
      setError("Debe seleccionar un cliente.");
      setLoading(false);
      return;
    }

    if (items.length === 0) {
      setError("Debe agregar al menos un producto a la factura.");
      setLoading(false);
      return;
    }

    try {
      const factura = await createFactura({
        clienteId,
        fechaEmision: new Date(fechaEmision),
        fechaVencimiento: new Date(fechaVencimiento),
        descuento,
        notas,
        condicionesPago: empresa.condicionesPago || "",
        detalles: items.map((i) => ({
          productoId: i.productoId,
          codigo: i.codigo,
          nombre: i.nombre,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
          impuesto: i.impuesto
        }))
      });

      const clientObj = clientes.find((c) => c.id === clienteId)!;

      const fullFacturaForPDF = {
        id: factura.id,
        numero: factura.numero,
        fechaEmision: factura.fechaEmision,
        fechaVencimiento: factura.fechaVencimiento,
        subtotal: factura.subtotal,
        impuestos: factura.impuestos,
        descuento: factura.descuento,
        descuentoValor: factura.descuentoValor,
        total: factura.total,
        notas: factura.notas,
        condicionesPago: factura.condicionesPago,
        estado: factura.estado,
        createdAt: factura.createdAt,
        updatedAt: factura.updatedAt,
        cliente: {
          tipoIdentificacion: clientObj.tipoIdentificacion,
          documento: clientObj.documento,
          nombre: clientObj.nombre,
          correo: clientObj.correo,
          telefono: clientObj.telefono,
          direccion: clientObj.direccion,
          ciudad: clientObj.ciudad,
          pais: clientObj.pais
        },
        detalles: items.map((i) => ({
          codigo: i.codigo,
          nombre: i.nombre,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
          impuesto: i.impuesto,
          subtotal: i.subtotal,
          total: i.subtotal * (1 - descuento / 100) * (1 + i.impuesto / 100)
        }))
      };

      try {
        generateInvoicePDF(fullFacturaForPDF, empresa);
      } catch {}

      router.push("/facturas");
    } catch (err: any) {
      setError(err.message || "Error al crear la factura.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-950/30 text-red-400 border border-red-800/40 rounded-lg flex items-center gap-3 text-sm font-medium">
          <span>{error}</span>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
            <User className="h-4 w-4 text-slate-500" />
            Seleccionar Cliente
          </label>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            required
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white cursor-pointer"
          >
            <option value="">-- Seleccionar cliente --</option>
            {clientes
              .filter((c) => c.estado === "activo")
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} ({c.documento})
                </option>
              ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-slate-500" />
            Fecha de Emisión
          </label>
          <input
            type="date"
            value={fechaEmision}
            onChange={(e) => setFechaEmision(e.target.value)}
            required
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-slate-500" />
            Fecha de Vencimiento
          </label>
          <input
            type="date"
            value={fechaVencimiento}
            onChange={(e) => setFechaVencimiento(e.target.value)}
            required
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 shadow-xs space-y-6">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Package className="h-5 w-5 text-indigo-400" />
          Conceptos y Productos
        </h3>

        <div className="flex flex-col sm:flex-row gap-4 items-end bg-slate-950 p-4 rounded-xl border border-slate-800/80">
          <div className="flex-1 flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-slate-300">
              Buscar e incluir producto
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white cursor-pointer w-full"
            >
              <option value="">-- Buscar producto/servicio --</option>
              {productos
                .filter((p) => p.estado === "activo")
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} - {p.nombre} ({formatCurrency(p.precioUnitario)})
                  </option>
                ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleAddProduct}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg font-medium text-sm transition-all shadow-lg shadow-indigo-600/10 shrink-0 cursor-pointer h-[38px] w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4" />
            Añadir
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
            <Package className="h-10 w-10 text-slate-600 mx-auto mb-2" />
            <span className="text-sm text-slate-500 font-medium">
              No has agregado productos a la factura
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-950/40 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Nombre / Descripción</th>
                  <th className="px-4 py-3 text-center w-24">Cantidad</th>
                  <th className="px-4 py-3 text-right w-36">Precio Unit. ($)</th>
                  <th className="px-4 py-3 text-center w-24">IVA (%)</th>
                  <th className="px-4 py-3 text-right w-36">Subtotal</th>
                  <th className="px-4 py-3 text-right w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-850/30">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      {item.codigo}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">
                      {item.nombre}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min={1}
                        value={item.cantidad}
                        onChange={(e) =>
                          handleUpdateItemQty(idx, parseInt(e.target.value) || 1)
                        }
                        className="w-16 px-2 py-1 bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 rounded-md text-center text-sm text-white"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        min={0}
                        step="any"
                        value={item.precioUnitario}
                        onChange={(e) =>
                          handleUpdateItemPrice(
                            idx,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-28 px-2 py-1 bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 rounded-md text-right text-sm text-white"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="any"
                        value={item.impuesto}
                        onChange={(e) =>
                          handleUpdateItemTax(
                            idx,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-16 px-2 py-1 bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 rounded-md text-center text-sm text-white"
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-white">
                      {formatCurrency(item.subtotal)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 text-slate-400 hover:text-red-400 rounded-md hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            Condiciones Adicionales
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-300">
              Descuento Comercial (%)
            </label>
            <div className="relative">
              <Percent className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="number"
                min={0}
                max={100}
                step="any"
                value={descuento}
                onChange={(e) =>
                  setDescuento(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))
                }
                className="pr-10 pl-3 py-2 w-full rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-300">
              Observaciones o Notas en Factura
            </label>
            <textarea
              rows={3}
              value={notas}
              name="notas"
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej. Cuentas bancarias de pago, hito del proyecto, etc."
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white resize-none"
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 shadow-xs divide-y divide-slate-800/60 space-y-4">
          <h3 className="text-base font-semibold text-white">Resumen Financiero</h3>

          <div className="space-y-3 pt-4 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-200">{formatCurrency(subtotal)}</span>
            </div>

            {descuento > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Descuento ({descuento}%):</span>
                <span className="font-semibold text-red-400">-{formatCurrency(descuentoValor)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-400">
              <span>Impuestos (IVA):</span>
              <span className="font-semibold text-slate-200">{formatCurrency(impuestos)}</span>
            </div>

            <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-dashed border-slate-800">
              <span>Total:</span>
              <span className="text-lg text-indigo-400">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/facturas")}
              className="px-4 py-2.5 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all shadow-lg shadow-indigo-600/10 active:scale-98 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {loading ? "Emitiendo..." : "Emitir Factura"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
