import { getClientes, getProductos, getEmpresa } from "@/lib/actions";
import NuevaFacturaForm from "./NuevaFacturaForm";

export default async function NuevaFacturaPage() {
  const [clientes, productos, empresa] = await Promise.all([
    getClientes(),
    getProductos(),
    getEmpresa()
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Crear Factura</h1>
        <p className="text-slate-400 mt-1">Genera una nueva factura ingresando el cliente, productos, impuestos y descuentos.</p>
      </div>
      <NuevaFacturaForm
        clientes={clientes}
        productos={productos}
        empresa={empresa}
      />
    </div>
  );
}
