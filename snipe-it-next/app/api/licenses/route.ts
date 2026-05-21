import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const where: any = {
    deletedAt: null,
    ...(search && { OR: [{ name: { contains: search, mode: "insensitive" } }] }),
  };
  const licenses = await prisma.license.findMany({ where, include: { manufacturer: true, category: true }, orderBy: { name: "asc" } });
  return NextResponse.json(licenses);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, serial, seats, licenseName, licenseEmail, reassignable, maintained, notes,
      orderNumber, purchaseOrder, purchaseDate, purchaseCost, expirationDate,
      manufacturerId, supplierId, categoryId, companyId } = body;

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const license = await prisma.license.create({
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

    const seats_count = parseInt(seats) || 1;
    if (seats_count > 0) {
      await prisma.licenseSeat.createMany({
        data: Array.from({ length: seats_count }, (_, i) => ({ licenseId: license.id, seatNum: i + 1 })),
      });
    }

    return NextResponse.json(license, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
