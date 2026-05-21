import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const where: any = { deletedAt: null, ...(search && { name: { contains: search, mode: "insensitive" } }) };
  const items = await prisma.component.findMany({ where, include: { manufacturer: true, category: true }, orderBy: { name: "asc" } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    if (!body.name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const item = await prisma.component.create({
      data: { name: body.name, modelNumber: body.modelNumber ?? null, serial: body.serial ?? null, qty: body.qty ?? 0, minAmt: body.minAmt ?? null, purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null, purchaseCost: body.purchaseCost ? parseFloat(body.purchaseCost) : null, orderNumber: body.orderNumber ?? null, notes: body.notes ?? null, companyId: body.companyId ?? null, locationId: body.locationId ?? null, categoryId: body.categoryId ?? null, manufacturerId: body.manufacturerId ?? null, supplierId: body.supplierId ?? null },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
