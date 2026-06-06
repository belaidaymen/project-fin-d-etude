import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const asset = await prisma.asset.findFirst({
    where: { id: params.id, deletedAt: null },
    include: { category: true, status: true, location: true },
  });

  if (!asset) return NextResponse.json({ error: "Équipement introuvable" }, { status: 404 });
  return NextResponse.json(asset);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { assetTag, name, serial, reference, categoryId, statusId, locationId,
      purchaseDate, purchaseCost, notes, quantity } = body;

    const asset = await prisma.asset.update({
      where: { id: params.id },
      data: {
        assetTag,
        name: name || null,
        serial: serial || null,
        reference: reference || null,
        categoryId: categoryId || null,
        statusId: statusId || null,
        locationId: locationId || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchaseCost: purchaseCost ? parseFloat(purchaseCost) : null,
        notes: notes || null,
        quantity: quantity ? parseInt(quantity) : 1,
      },
    });

    return NextResponse.json(asset);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.asset.update({ where: { id: params.id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
