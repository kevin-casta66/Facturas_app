import { getEmpresa, getSesionUsuario } from "@/lib/actions";
import Sidebar from "./Sidebar";

export default async function SidebarServer() {
  const [empresa, usuario] = await Promise.all([
    getEmpresa(),
    getSesionUsuario()
  ]);

  if (!usuario) return null;

  return (
    <Sidebar
      empresaNombre={empresa.nombre}
      empresaLogo={empresa.logo ?? null}
      usuario={usuario as { nombre: string; email: string }}
    />
  );
}
