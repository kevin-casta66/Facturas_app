import { NextResponse } from "next/server";
import { getFacturaById } from "@/lib/actions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const factura = await getFacturaById(id);
  if (!factura) {
    return NextResponse.json(
      { error: "Factura no encontrada" },
      { status: 404 }
    );
  }
  return NextResponse.json(factura);
}
