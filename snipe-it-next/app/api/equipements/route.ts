import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== "MAGASINIER") {
    return NextResponse.json({ error: "Seul le magasinier peut enregistrer des équipements" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { assetTag, name, reference, serial, quantity, purchaseCost, purchaseDate, categoryId, locationId, statusId, notes } = body;

    if (!assetTag || !name) {
      return NextResponse.json({ error: "Tag et nom requis" }, { status: 400 });
    }

    const asset = await prisma.asset.create({
      data: {
        assetTag,
        name,
        reference: reference || null,
        serial: serial || null,
        quantity: Number(quantity) || 1,
        purchaseCost: purchaseCost ? purchaseCost : null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        categoryId: categoryId || null,
        locationId: locationId || null,
        statusId: statusId || null,
        notes: notes || null,
      },
      include: { category: true, location: true, status: true },
    });

    return NextResponse.json({
      id: asset.id,
      assetTag: asset.assetTag,
      name: asset.name,
      reference: asset.reference,
      serial: asset.serial,
      quantity: asset.quantity,
      purchaseCost: asset.purchaseCost ? Number(asset.purchaseCost) : null,
      purchaseDate: asset.purchaseDate?.toISOString() ?? null,
      notes: asset.notes,
      category: asset.category ? { id: asset.category.id, name: asset.category.name } : null,
      location: asset.location ? { id: asset.location.id, name: asset.location.name } : null,
      status: asset.status ? { id: asset.status.id, name: asset.status.name, color: asset.status.color } : null,
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Ce tag équipement existe déjà" }, { status: 409 });
    }
    console.error("POST /api/equipements error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
