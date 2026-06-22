"use server";

import { db } from "./db";
import { revalidatePath } from "next/cache";
import {
  hashPassword,
  verifyPassword,
  encrypt,
  deleteSession,
  getSession,
} from "./auth";
import { cookies } from "next/headers";

export async function getEmpresa() {
  try {
    let empresa = await db.empresa.findFirst();
    if (!empresa) {
      empresa = await db.empresa.create({
        data: {
          id: 1,
          nombre: "Mi Empresa S.A.S.",
          nit: "900.123.456-7",
          correo: "contacto@miempresa.com",
          telefono: "+57 (601) 555-0199",
          direccion: "Calle 100 # 15-22",
          ciudad: "Bogotá",
          pais: "Colombia",
          condicionesPago:
            "Pago a 30 días a partir de la fecha de facturación.",
          footerTexto:
            "Gracias por su compra. Esta factura fue generada electrónicamente.",
          logo: null,
        },
      });
    }
    return empresa;
  } catch {
    return {
      id: 1,
      nombre: "Mi Empresa S.A.S.",
      nit: "900.123.456-7",
      correo: "contacto@miempresa.com",
      telefono: "+57 (601) 555-0199",
      direccion: "Calle 100 # 15-22",
      ciudad: "Bogotá",
      pais: "Colombia",
      condicionesPago: "Pago a 30 días a partir de la fecha de facturación.",
      footerTexto:
        "Gracias por su compra. Esta factura fue generada electrónicamente.",
      logo: null,
    };
  }
}

export async function updateEmpresa(data: {
  nombre: string;
  nit: string;
  correo: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  pais: string;
  condicionesPago?: string;
  footerTexto?: string;
  logo?: string | null;
}) {
  const empresa = await db.empresa.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });
  revalidatePath("/configuracion");
  return empresa;
}

export async function getClientes() {
  return await db.cliente.findMany({
    orderBy: { nombre: "asc" },
  });
}

export async function getClienteById(id: string) {
  return await db.cliente.findUnique({
    where: { id },
  });
}

export async function createCliente(data: {
  nombre: string;
  tipoIdentificacion?: string;
  documento?: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  pais?: string;
  observaciones?: string;
}) {
  // Validar nombre único
  const exNombre = await db.cliente.findFirst({
    where: { nombre: data.nombre },
  });
  if (exNombre) {
    throw new Error("Ya existe un cliente con ese nombre.");
  }
  // Validar documento único solo si se proporcionó
  if (data.documento) {
    const exDoc = await db.cliente.findFirst({
      where: { documento: data.documento },
    });
    if (exDoc) {
      throw new Error("El documento ya se encuentra registrado.");
    }
  }
  const cliente = await db.cliente.create({
    data: {
      nombre: data.nombre,
      tipoIdentificacion: data.tipoIdentificacion || "",
      documento: data.documento || "",
      correo: data.correo || "",
      telefono: data.telefono || "",
      direccion: data.direccion || "",
      ciudad: data.ciudad || "",
      pais: data.pais || "",
      observaciones: data.observaciones,
      estado: "activo", // siempre activo al crear
    },
  });
  revalidatePath("/clientes");
  return cliente;
}

export async function updateCliente(
  id: string,
  data: {
    nombre: string;
    tipoIdentificacion?: string;
    documento?: string;
    correo?: string;
    telefono?: string;
    direccion?: string;
    ciudad?: string;
    pais?: string;
    observaciones?: string;
    estado?: string;
  },
) {
  // Validar nombre único excluyendo el mismo cliente
  const exNombre = await db.cliente.findFirst({
    where: { nombre: data.nombre, NOT: { id } },
  });
  if (exNombre) {
    throw new Error("Ya existe otro cliente con ese nombre.");
  }
  // Validar documento único si se proporcionó
  if (data.documento) {
    const exDoc = await db.cliente.findFirst({
      where: { documento: data.documento, NOT: { id } },
    });
    if (exDoc) {
      throw new Error("El documento ya se encuentra registrado por otro cliente.");
    }
  }
  const cliente = await db.cliente.update({
    where: { id },
    data: {
      nombre: data.nombre,
      tipoIdentificacion: data.tipoIdentificacion ?? undefined,
      documento: data.documento ?? undefined,
      correo: data.correo ?? undefined,
      telefono: data.telefono ?? undefined,
      direccion: data.direccion ?? undefined,
      ciudad: data.ciudad ?? undefined,
      pais: data.pais ?? undefined,
      observaciones: data.observaciones,
      estado: data.estado ?? undefined,
    },
  });
  revalidatePath("/clientes");
  return cliente;
}

export async function deleteCliente(id: string) {
  // Las facturas asociadas quedan con clienteId = null (onDelete: SetNull en schema)
  await db.cliente.delete({
    where: { id },
  });
  revalidatePath("/clientes");
  return true;
}

export async function getProductos() {
  return await db.producto.findMany({
    orderBy: { nombre: "asc" },
  });
}

export async function getProductoById(id: string) {
  return await db.producto.findUnique({
    where: { id },
  });
}

export async function createProducto(data: {
  codigo: string;
  nombre: string;
  descripcion?: string;
  precioUnitario: number;
  impuesto?: number;
  categoria: string;
  estado?: string;
}) {
  const exProducto = await db.producto.findUnique({
    where: { codigo: data.codigo },
  });
  if (exProducto) {
    throw new Error("La referencia o código ya está en uso.");
  }
  const producto = await db.producto.create({
    data,
  });
  revalidatePath("/productos");
  return producto;
}

export async function updateProducto(
  id: string,
  data: {
    codigo: string;
    nombre: string;
    descripcion?: string;
    precioUnitario: number;
    impuesto?: number;
    categoria: string;
    estado?: string;
  },
) {
  const exProducto = await db.producto.findFirst({
    where: { codigo: data.codigo, NOT: { id } },
  });
  if (exProducto) {
    throw new Error("La referencia o código ya está en uso por otro producto.");
  }
  const producto = await db.producto.update({
    where: { id },
    data,
  });
  revalidatePath("/productos");
  return producto;
}

export async function deleteProducto(id: string) {
  const detallesCount = await db.detalleFactura.count({
    where: { productoId: id },
  });
  if (detallesCount > 0) {
    throw new Error(
      "No se puede eliminar el producto porque está incluido en facturas.",
    );
  }
  await db.producto.delete({
    where: { id },
  });
  revalidatePath("/productos");
  return true;
}

export async function getFacturas() {
  return await db.factura.findMany({
    include: { cliente: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFacturaById(id: string) {
  return await db.factura.findUnique({
    where: { id },
    include: {
      cliente: true,
      detalles: {
        include: { producto: true },
      },
    },
  });
}

export async function generateNextInvoiceNumber() {
  const lastFactura = await db.factura.findFirst({
    orderBy: { numero: "desc" },
  });
  if (!lastFactura) {
    return "FAC-00001";
  }
  const matches = lastFactura.numero.match(/FAC-(\d+)/);
  if (matches) {
    const nextNum = parseInt(matches[1], 10) + 1;
    return `FAC-${nextNum.toString().padStart(5, "0")}`;
  }
  return `FAC-${Math.floor(10000 + Math.random() * 90000)}`;
}

export async function createFactura(data: {
  clienteId: string;
  fechaEmision: Date;
  fechaVencimiento: Date;
  notas?: string;
  condicionesPago?: string;
  descuento: number;
  detalles: {
    productoId?: string;
    codigo: string;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    impuesto?: number;
  }[];
}) {
  if (data.detalles.length === 0) {
    throw new Error("La factura debe tener al menos un ítem.");
  }

  const numero = await generateNextInvoiceNumber();

  const subtotal = data.detalles.reduce(
    (acc, item) => acc + item.cantidad * item.precioUnitario,
    0,
  );
  const descuentoValor = subtotal * (data.descuento / 100);
  const subtotalConDescuento = subtotal - descuentoValor;

  const impuestos = data.detalles.reduce((acc, item) => {
    const itemSubtotal = item.cantidad * item.precioUnitario;
    const itemDescuentoProporcional = itemSubtotal * (data.descuento / 100);
    const itemBaseImponible = itemSubtotal - itemDescuentoProporcional;
    return acc + itemBaseImponible * ((item.impuesto || 0) / 100);
  }, 0);

  const total = subtotalConDescuento + impuestos;

  const factura = await db.factura.create({
    data: {
      numero,
      clienteId: data.clienteId,
      fechaEmision: data.fechaEmision,
      fechaVencimiento: data.fechaVencimiento,
      subtotal,
      impuestos,
      descuento: data.descuento,
      descuentoValor,
      total,
      notas: data.notas,
      condicionesPago: data.condicionesPago,
      estado: "emitida",
      detalles: {
        create: data.detalles.map((d) => {
          const itemSub = d.cantidad * d.precioUnitario;
          const itemDesc = itemSub * (data.descuento / 100);
          const itemBase = itemSub - itemDesc;
          const itemTax = itemBase * ((d.impuesto || 0) / 100);
          return {
            productoId: d.productoId || null,
            codigo: d.codigo,
            nombre: d.nombre,
            cantidad: d.cantidad,
            precioUnitario: d.precioUnitario,
            impuesto: d.impuesto || 0,
            subtotal: itemSub,
            total: itemBase + itemTax,
          };
        }),
      },
    },
  });

  revalidatePath("/facturas");
  revalidatePath("/");
  return factura;
}

export async function updateFacturaEstado(id: string, estado: string) {
  const factura = await db.factura.update({
    where: { id },
    data: { estado },
  });
  revalidatePath("/facturas");
  revalidatePath("/");
  return factura;
}

export async function getFacturaStats() {
  const facturas = await db.factura.findMany({
    include: { cliente: true },
    where: { NOT: { estado: "anulada" } },
  });

  const totalVendido = facturas
    .filter((f) => f.estado === "pagada" || f.estado === "emitida")
    .reduce((acc, f) => acc + f.total, 0);

  const facturasEmitidasCount = await db.factura.count();
  const clientesCount = await db.cliente.count({ where: { estado: "activo" } });

  const topClientesMap: Record<string, { nombre: string; total: number }> = {};
  facturas.forEach((f) => {
    if (f.estado !== "anulada" && f.clienteId && f.cliente) {
      if (!topClientesMap[f.clienteId]) {
        topClientesMap[f.clienteId] = { nombre: f.cliente.nombre, total: 0 };
      }
      topClientesMap[f.clienteId].total += f.total;
    }
  });
  const topClientes = Object.values(topClientesMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const detalles = await db.detalleFactura.findMany({
    include: {
      factura: true,
    },
    where: {
      factura: {
        NOT: { estado: "anulada" },
      },
    },
  });

  const topProductosMap: Record<
    string,
    { nombre: string; cantidad: number; total: number }
  > = {};
  detalles.forEach((d) => {
    const key = d.productoId || d.codigo;
    if (!topProductosMap[key]) {
      topProductosMap[key] = { nombre: d.nombre, cantidad: 0, total: 0 };
    }
    topProductosMap[key].cantidad += d.cantidad;
    topProductosMap[key].total += d.total;
  });
  const topProductos = Object.values(topProductosMap)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  const ventasPorMesMap: Record<string, number> = {};
  facturas.forEach((f) => {
    if (f.estado !== "anulada") {
      const fecha = new Date(f.fechaEmision);
      const mesAnio = `${fecha.getFullYear()}-${(fecha.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      ventasPorMesMap[mesAnio] = (ventasPorMesMap[mesAnio] || 0) + f.total;
    }
  });

  const ventasPorMes = Object.entries(ventasPorMesMap)
    .map(([mes, total]) => ({ mes, total }))
    .sort((a, b) => a.mes.localeCompare(b.mes));

  const facturasPorEstado = await db.factura.groupBy({
    by: ["estado"],
    _count: {
      id: true,
    },
  });

  const avgVenta = facturas.length > 0 ? totalVendido / facturas.length : 0;

  return {
    totalVendido,
    facturasEmitidasCount,
    clientesCount,
    topClientes,
    topProductos,
    ventasPorMes,
    facturasPorEstado: facturasPorEstado.map((item) => ({
      estado: item.estado,
      cantidad: item._count.id,
    })),
    avgVenta,
  };
}

export async function seedDemoData() {
  const userCount = await db.usuario.count();
  if (userCount === 0) {
    await db.usuario.create({
      data: {
        email: "admin@facturas.com",
        nombre: "Administrador Demo",
        password: hashPassword("admin123"),
      },
    });
  }

  const clienteCount = await db.cliente.count();
  if (clienteCount > 0) return;

  const c1 = await db.cliente.create({
    data: {
      tipoIdentificacion: "NIT",
      documento: "901.442.112-4",
      nombre: "Tecnologías Modernas Ltda",
      correo: "compras@tecnomoderas.com",
      telefono: "6017448822",
      direccion: "Carrera 7 # 156-88 Office 402",
      ciudad: "Bogotá",
      pais: "Colombia",
      observaciones: "Cliente corporativo principal",
      estado: "activo",
    },
  });

  const c2 = await db.cliente.create({
    data: {
      tipoIdentificacion: "CC",
      documento: "1.020.443.211",
      nombre: "Carlos Andrés Mendoza",
      correo: "carlos.mendoza@gmail.com",
      telefono: "3154889922",
      direccion: "Calle 45 # 22-10 Apt 501",
      ciudad: "Medellín",
      pais: "Colombia",
      observaciones: "Cliente recurrente de consultorías",
      estado: "activo",
    },
  });

  const c3 = await db.cliente.create({
    data: {
      tipoIdentificacion: "NIT",
      documento: "800.512.991-0",
      nombre: "Distribuidora del Norte",
      correo: "pagos@distrinorte.com",
      telefono: "6043221199",
      direccion: "Avenida 30 de Agosto # 45-12",
      ciudad: "Pereira",
      pais: "Colombia",
      estado: "activo",
    },
  });

  const p1 = await db.producto.create({
    data: {
      codigo: "SERV-01",
      nombre: "Consultoría de Software por Hora",
      descripcion: "Desarrollo de software a medida y arquitectura de nube",
      precioUnitario: 120000,
      impuesto: 19,
      categoria: "Servicios",
      estado: "activo",
    },
  });

  const p2 = await db.producto.create({
    data: {
      codigo: "PROD-01",
      nombre: "Licencia de Software Anual ERP",
      descripcion: "Acceso ilimitado al módulo administrativo del ERP",
      precioUnitario: 1500000,
      impuesto: 19,
      categoria: "Licencias",
      estado: "activo",
    },
  });

  const p3 = await db.producto.create({
    data: {
      codigo: "SERV-02",
      nombre: "Soporte Técnico Especializado",
      descripcion: "Mantenimiento mensual y soporte técnico de servidores",
      precioUnitario: 80000,
      impuesto: 0,
      categoria: "Soporte",
      estado: "activo",
    },
  });

  const p4 = await db.producto.create({
    data: {
      codigo: "PROD-02",
      nombre: "Servidor Virtual VPS Cloud",
      descripcion: "2 vCPU, 4GB RAM, 80GB SSD mensual",
      precioUnitario: 180000,
      impuesto: 19,
      categoria: "Infraestructura",
      estado: "activo",
    },
  });

  const f1Date = new Date();
  f1Date.setMonth(f1Date.getMonth() - 2);
  const f1DateVenc = new Date(f1Date);
  f1DateVenc.setDate(f1DateVenc.getDate() + 30);

  const f2Date = new Date();
  f2Date.setMonth(f2Date.getMonth() - 1);
  const f2DateVenc = new Date(f2Date);
  f2DateVenc.setDate(f2DateVenc.getDate() + 15);

  const f3Date = new Date();
  const f3DateVenc = new Date(f3Date);
  f3DateVenc.setDate(f3DateVenc.getDate() + 30);

  await db.factura.create({
    data: {
      numero: "FAC-00001",
      clienteId: c1.id,
      fechaEmision: f1Date,
      fechaVencimiento: f1DateVenc,
      subtotal: 3900000,
      descuento: 10,
      descuentoValor: 390000,
      impuestos: 666900,
      total: 4176900,
      notas: "Pago correspondiente al hito 1 del desarrollo",
      estado: "pagada",
      detalles: {
        create: [
          {
            productoId: p2.id,
            codigo: p2.codigo,
            nombre: p2.nombre,
            cantidad: 2,
            precioUnitario: 1500000,
            impuesto: 19,
            subtotal: 3000000,
            total: 3213000,
          },
          {
            productoId: p1.id,
            codigo: p1.codigo,
            nombre: p1.nombre,
            cantidad: 10,
            precioUnitario: 90000,
            impuesto: 19,
            subtotal: 900000,
            total: 963900,
          },
        ],
      },
    },
  });

  await db.factura.create({
    data: {
      numero: "FAC-00002",
      clienteId: c2.id,
      fechaEmision: f2Date,
      fechaVencimiento: f2DateVenc,
      subtotal: 600000,
      descuento: 0,
      descuentoValor: 0,
      impuestos: 114000,
      total: 714000,
      notas: "Consultoría de arquitectura Cloud",
      estado: "pagada",
      detalles: {
        create: [
          {
            productoId: p1.id,
            codigo: p1.codigo,
            nombre: p1.nombre,
            cantidad: 5,
            precioUnitario: 120000,
            impuesto: 19,
            subtotal: 600000,
            total: 714000,
          },
        ],
      },
    },
  });

  await db.factura.create({
    data: {
      numero: "FAC-00003",
      clienteId: c3.id,
      fechaEmision: f3Date,
      fechaVencimiento: f3DateVenc,
      subtotal: 1000000,
      descuento: 5,
      descuentoValor: 50000,
      impuestos: 180500,
      total: 1130500,
      notas: "Soporte mensual y licencias",
      estado: "emitida",
      detalles: {
        create: [
          {
            productoId: p4.id,
            codigo: p4.codigo,
            nombre: p4.nombre,
            cantidad: 5,
            precioUnitario: 180000,
            impuesto: 19,
            subtotal: 900000,
            total: 1017450,
          },
          {
            productoId: p3.id,
            codigo: p3.codigo,
            nombre: p3.nombre,
            cantidad: 1,
            precioUnitario: 100000,
            impuesto: 0,
            subtotal: 100000,
            total: 95000,
          },
        ],
      },
    },
  });
}

export async function loginAction(data: { email: string; password: string }) {
  try {
    const user = await db.usuario.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      return { success: false, error: "Credenciales incorrectas." };
    }
    const isPassValid = verifyPassword(data.password, user.password);
    if (!isPassValid) {
      return { success: false, error: "Credenciales incorrectas." };
    }

    const session = await encrypt({
      userId: user.id,
      email: user.email,
      nombre: user.nombre,
    });

    const cookieStore = await cookies();
    cookieStore.set("session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 2,
    });

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Error al conectar con la base de datos.",
    };
  }
}

export async function logoutAction() {
  await deleteSession();
  return true;
}

export async function getSesionUsuario() {
  try {
    return await getSession();
  } catch {
    return null;
  }
}

export async function registerAction(data: {
  nombre: string;
  email: string;
  password: string;
}) {
  try {
    const existingUser = await db.usuario.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      return {
        success: false,
        error: "El correo electrónico ya está registrado.",
      };
    }

    const hashedPassword = hashPassword(data.password);
    const user = await db.usuario.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        password: hashedPassword,
      },
    });

    const session = await encrypt({
      userId: user.id,
      email: user.email,
      nombre: user.nombre,
    });

    const cookieStore = await cookies();
    cookieStore.set("session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 2,
    });

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Error al conectar con la base de datos.",
    };
  }
}
