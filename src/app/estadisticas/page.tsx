import { getFacturaStats } from "@/lib/actions";
import EstadisticasContent from "./EstadisticasContent";

export default async function EstadisticasPage() {
  const stats = await getFacturaStats();

  return <EstadisticasContent stats={stats as any} />;
}
