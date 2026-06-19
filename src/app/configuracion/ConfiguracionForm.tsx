"use client";

import { useState, ChangeEvent } from "react";
import { updateEmpresa } from "@/lib/actions";
import { Upload, X, Save, CheckCircle2, AlertCircle } from "lucide-react";

interface EmpresaData {
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

interface ConfiguracionFormProps {
  initialData: EmpresaData;
}

export default function ConfiguracionForm({ initialData }: ConfiguracionFormProps) {
  const [formData, setFormData] = useState<EmpresaData>(initialData);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "El archivo de logo no debe exceder los 2MB." });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, logo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logo: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await updateEmpresa({
        nombre: formData.nombre,
        nit: formData.nit,
        correo: formData.correo,
        telefono: formData.telefono,
        direccion: formData.direccion,
        ciudad: formData.ciudad,
        pais: formData.pais,
        condicionesPago: formData.condicionesPago || "",
        footerTexto: formData.footerTexto || "",
        logo: formData.logo
      });
      setMessage({ type: "success", text: "Configuración guardada exitosamente." });
    } catch {
      setMessage({ type: "error", text: "Hubo un error al guardar la configuración." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-slate-900 border border-slate-800/80 p-6 rounded-xl shadow-xs">
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-950/30 text-emerald-400 border border-emerald-800/40"
              : "bg-red-950/30 text-red-400 border border-red-800/40"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex flex-col items-center gap-3 shrink-0">
          <label className="text-sm font-semibold text-slate-300">Logo de la Empresa</label>
          <div className="relative h-32 w-32 rounded-xl border-2 border-dashed border-slate-800 hover:border-indigo-500/80 flex items-center justify-center bg-slate-950 overflow-hidden group transition-all">
            {formData.logo ? (
              <>
                <img src={formData.logo} alt="Logo" className="h-full w-full object-contain p-2" />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute top-1 right-1 p-1 bg-red-650 text-white rounded-full hover:bg-red-500 transition-colors shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            ) : (
              <label className="flex flex-col items-center justify-center h-full w-full cursor-pointer p-4 text-center">
                <Upload className="h-6 w-6 text-slate-500 group-hover:text-indigo-400 transition-colors mb-1" />
                <span className="text-xs text-slate-400 font-medium">Subir Imagen</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <span className="text-2xs text-slate-550">Formatos recomendados: PNG, JPG (Máx. 2MB)</span>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-300">Nombre o Razón Social</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-300">NIT o Identificación Tributaria</label>
            <input
              type="text"
              name="nit"
              value={formData.nit}
              onChange={handleChange}
              required
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-300">Correo Electrónico</label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              required
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-300">Teléfono de Contacto</label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-semibold text-slate-300">Dirección</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              required
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-300">Ciudad</label>
            <input
              type="text"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              required
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-300">País</label>
            <input
              type="text"
              name="pais"
              value={formData.pais}
              onChange={handleChange}
              required
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white"
            />
          </div>
        </div>
      </div>

      <hr className="border-slate-800" />

      <div className="space-y-6">
        <h3 className="text-base font-semibold text-white">Textos de la Factura (PDF)</h3>

        <div className="grid grid-cols-1 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-300">Condiciones de Pago</label>
            <textarea
              name="condicionesPago"
              value={formData.condicionesPago || ""}
              onChange={handleChange}
              rows={3}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-300">Pie de Página (Footer)</label>
            <textarea
              name="footerTexto"
              value={formData.footerTexto || ""}
              onChange={handleChange}
              rows={2}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-sm text-white resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all shadow-lg shadow-indigo-600/10 active:scale-98 cursor-pointer"
        >
          <Save className="h-4 w-4" />
          {loading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
