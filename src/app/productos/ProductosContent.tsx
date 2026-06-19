"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  createProducto,
  updateProducto,
  deleteProducto,
  getProductos
} from "@/lib/actions";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  PackagePlus,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  precioUnitario: number;
  impuesto: number | null;
  categoria: string;
  estado: string;
}

interface ProductosContentProps {
  initialProductos: Producto[];
}

export default function ProductosContent({ initialProductos }: ProductosContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [productos, setProductos] = useState<Producto[]>(initialProductos);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterCategoria, setFilterCategoria] = useState("todos");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    precioUnitario: 0,
    impuesto: 0,
    categoria: "Servicios",
    estado: "activo"
  });

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get("nuevo") === "true") {
      openAddModal();
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("nuevo");
      router.replace(`/productos?${newParams.toString()}`);
    }
  }, [searchParams]);

  const refreshList = async () => {
    const data = await getProductos();
    setProductos(data);
  };

  const openAddModal = () => {
    setEditingProducto(null);
    setFormData({
      codigo: "",
      nombre: "",
      descripcion: "",
      precioUnitario: 0,
      impuesto: 19,
      categoria: "Servicios",
      estado: "activo"
    });
    setActionError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (producto: Producto) => {
    setEditingProducto(producto);
    setFormData({
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      precioUnitario: producto.precioUnitario,
      impuesto: producto.impuesto !== null ? producto.impuesto : 0,
      categoria: producto.categoria,
      estado: producto.estado
    });
    setActionError(null);
    setIsModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "precioUnitario" || name === "impuesto") {
      const val = parseFloat(value) || 0;
      setFormData((prev) => ({ ...prev, [name]: val }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    setIsSubmitting(true);

    try {
      if (editingProducto) {
        await updateProducto(editingProducto.id, formData);
        setActionSuccess("Producto actualizado exitosamente.");
      } else {
        await createProducto(formData);
        setActionSuccess("Producto creado exitosamente.");
      }
      setIsModalOpen(false);
      await refreshList();
    } catch (err: any) {
      setActionError(err.message || "Ocurrió un error al guardar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await deleteProducto(id);
      setActionSuccess("Producto eliminado exitosamente.");
      setConfirmDeleteId(null);
      await refreshList();
    } catch (err: any) {
      setActionError(err.message || "Error al eliminar el producto.");
      setConfirmDeleteId(null);
    }
  };

  const categories = Array.from(new Set(productos.map((p) => p.categoria)));

  const filteredProductos = productos.filter((p) => {
    const matchesSearch =
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo.toLowerCase().includes(search.toLowerCase());
    const matchesEstado =
      filterEstado === "todos" || p.estado === filterEstado;
    const matchesCategoria =
      filterCategoria === "todos" || p.categoria === filterCategoria;
    return matchesSearch && matchesEstado && matchesCategoria;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Productos y Servicios
          </h1>
          <p className="text-slate-400 mt-1">
            Administra el catálogo de servicios y productos comercializados.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-lg shadow-indigo-600/10 active:scale-98 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Agregar Producto
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-950/30 text-emerald-400 border border-emerald-800/40 rounded-lg flex items-center gap-3 text-sm font-medium">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-red-950/30 text-red-400 border border-red-800/40 rounded-lg flex items-center gap-3 text-sm font-medium">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800/80 shadow-xs">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
              Categoría:
            </label>
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white cursor-pointer"
            >
              <option value="todos">Todas</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
              Estado:
            </label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white cursor-pointer"
            >
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800/80 rounded-xl shadow-xs overflow-hidden">
        {filteredProductos.length === 0 ? (
          <div className="text-center py-12">
            <PackagePlus className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-semibold text-white text-sm">
              No se encontraron productos
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto">
              Intenta cambiar los filtros de búsqueda o agrega un nuevo producto.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-950/40 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Código / Ref</th>
                  <th className="px-6 py-3.5">Producto o Servicio</th>
                  <th className="px-6 py-3.5">Categoría</th>
                  <th className="px-6 py-3.5 text-right">Precio Unitario</th>
                  <th className="px-6 py-3.5 text-center">Impuesto</th>
                  <th className="px-6 py-3.5 text-center">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProductos.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-semibold bg-slate-850 text-slate-300 px-2 py-1 rounded-sm border border-slate-800">
                        {p.codigo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">
                        {p.nombre}
                      </div>
                      {p.descripcion && (
                        <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[260px]">
                          {p.descripcion}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-300">
                        {p.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-white">
                        {formatCurrency(p.precioUnitario)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-medium text-slate-300">
                        {p.impuesto !== null && p.impuesto > 0
                          ? `${p.impuesto}%`
                          : "Exento"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-2xs font-semibold uppercase tracking-wider border ${
                          p.estado === "activo"
                            ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/30"
                            : "bg-slate-800/60 text-slate-400 border-slate-700/30"
                        }`}
                      >
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(p.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">
                {editingProducto ? "Editar Producto" : "Agregar Producto"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-300">
                    Código de Referencia
                  </label>
                  <input
                    type="text"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej. PROD-100, SERV-20"
                    className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-300">
                    Categoría
                  </label>
                  <input
                    type="text"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej. Servicios, Licencias, Equipos"
                    className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-300">
                    Nombre del Producto o Servicio
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-300">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows={2}
                    className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-300">
                    Precio Unitario ($)
                  </label>
                  <input
                    type="number"
                    name="precioUnitario"
                    value={formData.precioUnitario}
                    onChange={handleInputChange}
                    required
                    min={0}
                    step="any"
                    className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-300">
                    Impuesto / IVA (%)
                  </label>
                  <input
                    type="number"
                    name="impuesto"
                    value={formData.impuesto}
                    onChange={handleInputChange}
                    min={0}
                    max={100}
                    step="any"
                    placeholder="Opcional. Ej. 19, 5, 0"
                    className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-300">
                    Estado
                  </label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white cursor-pointer"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white transition-colors text-sm font-medium cursor-pointer shadow-lg shadow-indigo-600/10"
                >
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">
              ¿Eliminar producto?
            </h3>
            <p className="text-sm text-slate-400">
              Esta acción no se puede deshacer. Se verificará que el producto
              no esté registrado en facturas vigentes antes de eliminarlo.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 rounded-lg bg-red-650 hover:bg-red-500 text-white transition-colors text-sm font-medium cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
