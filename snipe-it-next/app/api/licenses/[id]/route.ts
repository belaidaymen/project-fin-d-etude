import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const license = await prisma.license.findFirst({ where: { id: id, deletedAt: null }, include: { manufacturer: true, licenseSeats: true } });
  if (!license) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(license);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { name, serial, seats, licenseName, licenseEmail, reassignable, maintained, notes,
      orderNumber, purchaseOrder, purchaseDate, purchaseCost, expirationDate,
      manufacturerId, supplierId, categoryId, companyId } = body;
    const license = await prisma.license.update({
      where: { id: id },
      data: {
        name, serial: serial || null, seats: seats || 1, licenseName: licenseName || null,
        licenseEmail: licenseEmail || null, reassignable: reassignable ?? true,
        maintained: maintained ?? false, notes: notes || null,
        orderNumber: orderNumber || null, purchaseOrder: purchaseOrder || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchaseCost: purchaseCost ? parseFloat(purchaseCost) : null,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        manufacturerId: manufacturerId || null, supplierId: supplierId || null,
        categoryId: categoryId || null, companyId: companyId || null,
      },
    });
    return NextResponse.json(license);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.license.update({ where: { id: id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
