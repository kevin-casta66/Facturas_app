import { Suspense } from "react";
import { getProductos } from "@/lib/actions";
import ProductosContent from "./ProductosContent";

export default async function ProductosPage() {
  const productos = await getProductos();

  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ProductosContent initialProductos={productos} />
    </Suspense>
  );
}
