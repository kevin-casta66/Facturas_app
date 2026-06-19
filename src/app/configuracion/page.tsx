import { getEmpresa } from "@/lib/actions";
import ConfiguracionForm from "./ConfiguracionForm";

export default async function ConfiguracionPage() {
  const empresa = await getEmpresa();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Configuración de Empresa</h1>
        <p className="text-slate-400 mt-1">Configura los datos del emisor que aparecerán en tus facturas y PDFs.</p>
      </div>
      <ConfiguracionForm initialData={empresa} />
    </div>
  );
}
