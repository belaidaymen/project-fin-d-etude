import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const item = await prisma.component.update({ where: { id: params.id }, data: { name: body.name, modelNumber: body.modelNumber ?? null, serial: body.serial ?? null, qty: body.qty ?? 0, minAmt: body.minAmt ?? null, purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null, purchaseCost: body.purchaseCost ? parseFloat(body.purchaseCost) : null, orderNumber: body.orderNumber ?? null, notes: body.notes ?? null, companyId: body.companyId ?? null, locationId: body.locationId ?? null, categoryId: body.categoryId ?? null, manufacturerId: body.manufacturerId ?? null, supplierId: body.supplierId ?? null } });
    return NextResponse.json(item);
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.component.update({ where: { id: params.id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
