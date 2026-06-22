"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  createCliente,
  updateCliente,
  deleteCliente,
  getClientes
} from "@/lib/actions";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  UserPlus,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

interface Cliente {
  id: string;
  tipoIdentificacion: string;
  documento: string;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  pais: string;
  observaciones: string | null;
  estado: string;
}

interface ClientesContentProps {
  initialClientes: Cliente[];
}

export default function ClientesContent({ initialClientes }: ClientesContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [clientes, setClientes] = useState<Cliente[]>(initialClientes);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  const [formData, setFormData] = useState({
    tipoIdentificacion: "NIT",
    documento: "",
    nombre: "",
    correo: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    pais: "",
    observaciones: "",
    estado: "activo",
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
      router.replace(`/clientes?${newParams.toString()}`);
    }
  }, [searchParams]);

  const refreshList = async () => {
    const data = await getClientes();
    setClientes(data);
  };

  const openAddModal = () => {
    setEditingCliente(null);
    setFormData({
      tipoIdentificacion: "NIT",
      documento: "",
      nombre: "",
      correo: "",
      telefono: "",
      direccion: "",
      ciudad: "",
      pais: "",
      observaciones: "",
      estado: "activo"
    });
    setActionError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      tipoIdentificacion: cliente.tipoIdentificacion,
      documento: cliente.documento,
      nombre: cliente.nombre,
      correo: cliente.correo,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
      ciudad: cliente.ciudad,
      pais: cliente.pais,
      observaciones: cliente.observaciones || "",
      estado: cliente.estado
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    setIsSubmitting(true);

    try {
      if (editingCliente) {
        await updateCliente(editingCliente.id, formData);
        setActionSuccess("Cliente actualizado exitosamente.");
      } else {
        await createCliente(formData);
        setActionSuccess("Cliente creado exitosamente.");
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
      await deleteCliente(id);
      setActionSuccess("Cliente eliminado exitosamente.");
      setConfirmDeleteId(null);
      await refreshList();
    } catch (err: any) {
      setActionError(err.message || "Error al eliminar el cliente.");
      setConfirmDeleteId(null);
    }
  };

  const filteredClientes = clientes.filter((c) => {
    const matchesSearch =
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.documento.toLowerCase().includes(search.toLowerCase()) ||
      c.correo.toLowerCase().includes(search.toLowerCase());
    const matchesEstado =
      filterEstado === "todos" || c.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Clientes
          </h1>
          <p className="text-slate-400 mt-1">
            Administra la base de datos de tus clientes y sus contactos.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-lg shadow-indigo-600/10 active:scale-98 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Registrar Cliente
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
            placeholder="Buscar por nombre o documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
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

      <div className="bg-slate-900 border border-slate-800/80 rounded-xl shadow-xs overflow-hidden">
        {filteredClientes.length === 0 ? (
          <div className="text-center py-12">
            <UserPlus className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-semibold text-white text-sm">
              No se encontraron clientes
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto">
              Intenta cambiar los filtros de búsqueda o agrega un nuevo cliente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-950/40 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Cliente</th>
                  <th className="px-6 py-3.5">Identificación</th>
                  <th className="px-6 py-3.5">Contacto</th>
                  <th className="px-6 py-3.5">Ubicación</th>
                  <th className="px-6 py-3.5 text-center">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredClientes.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">
                        {cliente.nombre}
                      </div>
                      {cliente.observaciones && (
                        <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[240px]">
                          {cliente.observaciones}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium bg-slate-850 text-slate-300 px-2 py-0.5 rounded-sm border border-slate-800">
                        {cliente.tipoIdentificacion}
                      </span>
                      <span className="font-medium text-slate-300 ml-2">
                        {cliente.documento}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300 font-medium">
                        {cliente.correo}
                      </div>
                      <div className="text-xs text-slate-400">
                        {cliente.telefono}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300 font-medium">
                        {cliente.direccion}
                      </div>
                      <div className="text-xs text-slate-400">
                        {cliente.ciudad}, {cliente.pais}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-2xs font-semibold uppercase tracking-wider border ${
                          cliente.estado === "activo"
                            ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/30"
                            : "bg-slate-800/60 text-slate-400 border-slate-700/30"
                        }`}
                      >
                        {cliente.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(cliente)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(cliente.id)}
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
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">
                {editingCliente ? "Editar Cliente" : "Registrar Cliente"}
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
                {/* Nombre — único campo obligatorio */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-300">
                    Nombre o Razón Social <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Tecnologías Modernas Ltda"
                    className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
                  />
                </div>

                {/* Identificación — opcional */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-300">
                    Tipo de Identificación
                    <span className="ml-1.5 text-xs font-normal text-slate-500">(opcional)</span>
                  </label>
                  <select
                    name="tipoIdentificacion"
                    value={formData.tipoIdentificacion}
                    onChange={handleInputChange}
                    className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white cursor-pointer"
                  >
                    <option value="">Sin especificar</option>
                    <option value="NIT">NIT</option>
                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                    <option value="CE">Cédula de Extranjería (CE)</option>
                    <option value="RUT">RUT</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-300">
                    Documento / NIT
                    <span className="ml-1.5 text-xs font-normal text-slate-500">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    name="documento"
                    value={formData.documento}
                    onChange={handleInputChange}
                    placeholder="Ej: 900.123.456-7"
                    className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-300">
                    Correo Electrónico
                    <span className="ml-1.5 text-xs font-normal text-slate-500">(opcional)</span>
                  </label>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleInputChange}
                    placeholder="correo@ejemplo.com"
                    className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-300">
                    Teléfono
                    <span className="ml-1.5 text-xs font-normal text-slate-500">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="+57 300 000 0000"
                    className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-300">
                    Dirección
                    <span className="ml-1.5 text-xs font-normal text-slate-500">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    placeholder="Calle, Carrera, número..."
                    className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-300">
                    Ciudad
                    <span className="ml-1.5 text-xs font-normal text-slate-500">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    placeholder="Bogotá, Medellín..."
                    className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-300">
                    País
                    <span className="ml-1.5 text-xs font-normal text-slate-500">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    name="pais"
                    value={formData.pais}
                    onChange={handleInputChange}
                    placeholder="Colombia"
                    className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-300">
                    Observaciones
                    <span className="ml-1.5 text-xs font-normal text-slate-500">(opcional)</span>
                  </label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Notas adicionales sobre el cliente..."
                    className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white resize-none"
                  />
                </div>

                {/* Estado — solo visible al editar */}
                {editingCliente && (
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
                )}
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
              ¿Eliminar cliente?
            </h3>
            <p className="text-sm text-slate-400">
              Esta acción no se puede deshacer. Las facturas asociadas a este
              cliente <span className="text-amber-400 font-medium">no se eliminarán</span>,
              quedarán sin cliente asociado.
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
