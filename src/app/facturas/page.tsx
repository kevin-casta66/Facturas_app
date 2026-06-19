import { getFacturas, getEmpresa } from "@/lib/actions";
import FacturasContent from "./FacturasContent";

export default async function FacturasPage() {
  const [facturas, empresa] = await Promise.all([
    getFacturas(),
    getEmpresa()
  ]);

  return (
    <FacturasContent
      initialFacturas={facturas as any}
      empresa={empresa}
    />
  );
}
