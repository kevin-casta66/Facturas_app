import jsPDF from "jspdf";
import "jspdf-autotable";
import { formatCurrency, formatDate } from "./utils";

interface Empresa {
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

interface Cliente {
  tipoIdentificacion: string;
  documento: string;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  pais: string;
}

interface Detalle {
  codigo: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  impuesto: number | null;
  subtotal: number;
  total: number;
}

interface Factura {
  numero: string;
  fechaEmision: Date | string;
  fechaVencimiento: Date | string;
  subtotal: number;
  impuestos: number;
  descuento: number;
  descuentoValor: number;
  total: number;
  notas: string | null;
  condicionesPago: string | null;
  estado: string;
  cliente: Cliente;
  detalles: Detalle[];
}

export function generateInvoicePDF(factura: Factura, empresa: Empresa) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const primaryColor = [79, 70, 229];
  const textColor = [51, 65, 85];
  const lightBg = [248, 250, 252];

  let currentY = 15;

  if (empresa.logo) {
    try {
      doc.addImage(empresa.logo, "PNG", 15, currentY, 25, 25);
    } catch (logoErr) {
      console.warn("[PDF] No se pudo cargar el logo de la empresa:", logoErr);
    }
  }

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(empresa.nombre, empresa.logo ? 45 : 15, currentY + 6);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`NIT: ${empresa.nit}`, empresa.logo ? 45 : 15, currentY + 12);
  doc.text(`${empresa.direccion}, ${empresa.ciudad}, ${empresa.pais}`, empresa.logo ? 45 : 15, currentY + 17);
  doc.text(`Tel: ${empresa.telefono} | Correo: ${empresa.correo}`, empresa.logo ? 45 : 15, currentY + 22);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("FACTURA DE VENTA", 195, currentY + 6, { align: "right" });

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(239, 68, 68);
  doc.text(factura.numero, 195, currentY + 13, { align: "right" });

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Emisión: ${formatDate(factura.fechaEmision)}`, 195, currentY + 19, { align: "right" });
  doc.text(`Vence: ${formatDate(factura.fechaVencimiento)}`, 195, currentY + 24, { align: "right" });

  currentY = 48;

  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.rect(15, currentY, 180, 28, "F");
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, currentY, 180, 28, "S");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("ADQUIRIENTE / CLIENTE", 20, currentY + 6);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Nombre/Razón Social: ${factura.cliente.nombre}`, 20, currentY + 12);
  doc.text(`Documento/NIT: ${factura.cliente.documento} (${factura.cliente.tipoIdentificacion})`, 20, currentY + 17);
  doc.text(`Dirección/Contacto: ${factura.cliente.direccion}, ${factura.cliente.ciudad} | Tel: ${factura.cliente.telefono}`, 20, currentY + 22);

  currentY = 82;

  const tableRows = factura.detalles.map((d, index) => [
    (index + 1).toString(),
    d.codigo,
    d.nombre,
    d.cantidad.toString(),
    formatCurrency(d.precioUnitario),
    d.impuesto ? `${d.impuesto}%` : "0%",
    formatCurrency(d.subtotal)
  ]);

  (doc as any).autoTable({
    startY: currentY,
    head: [["#", "Código", "Descripción", "Cant", "Precio Unitario", "Imp.", "Subtotal"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold"
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: textColor
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 20 },
      2: { cellWidth: 62 },
      3: { cellWidth: 12, halign: "center" },
      4: { cellWidth: 28, halign: "right" },
      5: { cellWidth: 15, halign: "center" },
      6: { cellWidth: 35, halign: "right" }
    },
    margin: { left: 15, right: 15 }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;
  currentY = finalY;

  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  const leftMargin = 15;
  const rightMargin = 195;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("Detalles y Condiciones", leftMargin, currentY);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);

  let noteLines: string[] = [];
  if (factura.notas) {
    noteLines.push(`Notas: ${factura.notas}`);
  }
  if (factura.condicionesPago) {
    noteLines.push(`Condiciones: ${factura.condicionesPago}`);
  } else if (empresa.condicionesPago) {
    noteLines.push(`Condiciones: ${empresa.condicionesPago}`);
  }

  let textY = currentY + 5;
  noteLines.forEach((line) => {
    const splitLines = doc.splitTextToSize(line, 110);
    splitLines.forEach((sl: string) => {
      doc.text(sl, leftMargin, textY);
      textY += 4;
    });
  });

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);

  doc.text("Subtotal:", 135, currentY);
  doc.text(formatCurrency(factura.subtotal), rightMargin, currentY, { align: "right" });

  let offset = 5;
  if (factura.descuento > 0) {
    doc.text(`Descuento (${factura.descuento}%):`, 135, currentY + offset);
    doc.text(`-${formatCurrency(factura.descuentoValor)}`, rightMargin, currentY + offset, { align: "right" });
    offset += 5;
  }

  doc.text("Impuestos (IVA):", 135, currentY + offset);
  doc.text(formatCurrency(factura.impuestos), rightMargin, currentY + offset, { align: "right" });
  offset += 6;

  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.rect(130, currentY + offset - 4, 65, 8, "F");
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.line(130, currentY + offset - 4, 195, currentY + offset - 4);
  doc.line(130, currentY + offset + 4, 195, currentY + offset + 4);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("Total Factura:", 135, currentY + offset + 1);
  doc.text(formatCurrency(factura.total), rightMargin, currentY + offset + 1, { align: "right" });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);

    doc.line(15, 280, 195, 280);
    doc.text(
      empresa.footerTexto || "Generado electrónicamente por Facturas App.",
      15,
      284
    );
    doc.text(`Página ${i} de ${pageCount}`, 195, 284, { align: "right" });
  }

  // En dispositivos móviles (iOS Safari y Android), doc.save() no funciona porque
  // los navegadores bloquean descargas directas desde blobs generados por JS.
  // La solución universal es abrir el PDF como blob URL en una nueva pestaña.
  const isMobile =
    typeof navigator !== "undefined" &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  if (isMobile) {
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    const newTab = window.open(url, "_blank");
    // Si el navegador bloquea la nueva pestaña, crear un link temporal
    if (!newTab) {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    // Liberar la URL del blob después de 30s
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  } else {
    doc.save(`Factura-${factura.numero}.pdf`);
  }
}
