import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== "MAGASINIER") {
    return NextResponse.json({ error: "Seul le magasinier peut enregistrer les mouvements" }, { status: 403 });
  }

  const userId = (session.user as any).id;

  try {
    const body = await req.json();
    const { type, assetId, fromLocationId, toLocationId, quantity, reference, note } = body;

    if (!type || !assetId) {
      return NextResponse.json({ error: "Type et équipement requis" }, { status: 400 });
    }

    const mouvement = await prisma.equipmentMovement.create({
      data: {
        type,
        assetId,
        fromLocationId: fromLocationId || null,
        toLocationId: toLocationId || null,
        quantity: Number(quantity) || 1,
        reference: reference || null,
        note: note || null,
        doneById: userId,
      },
      include: { asset: true, fromLocation: true, toLocation: true, doneBy: true },
    });

    // Update asset location if ENTREE or TRANSFERT
    if (toLocationId && (type === "ENTREE" || type === "TRANSFERT")) {
      await prisma.asset.update({
        where: { id: assetId },
        data: { locationId: toLocationId },
      });
    }

    return NextResponse.json({
      id: mouvement.id,
      type: mouvement.type,
      quantity: mouvement.quantity,
      reference: mouvement.reference,
      note: mouvement.note,
      createdAt: mouvement.createdAt.toISOString(),
      asset: { assetTag: mouvement.asset.assetTag, name: mouvement.asset.name },
      fromLocation: mouvement.fromLocation ? { name: mouvement.fromLocation.name } : null,
      toLocation: mouvement.toLocation ? { name: mouvement.toLocation.name } : null,
      doneBy: { firstName: mouvement.doneBy.firstName, lastName: mouvement.doneBy.lastName },
    });
  } catch (err: any) {
    console.error("POST /api/mouvements error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
