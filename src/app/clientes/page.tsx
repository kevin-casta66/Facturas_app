import { Suspense } from "react";
import { getClientes } from "@/lib/actions";
import ClientesContent from "./ClientesContent";

export default async function ClientesPage() {
  const clientes = await getClientes();

  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ClientesContent initialClientes={clientes} />
    </Suspense>
  );
}
