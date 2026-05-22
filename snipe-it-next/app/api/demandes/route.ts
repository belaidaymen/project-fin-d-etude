import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const demandes = await prisma.equipmentRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { requester: true, laboratoire: true, reviewer: true },
  });
  return NextResponse.json(demandes);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  if (role !== "LABORATOIRE") {
    return NextResponse.json({ error: "Seul un responsable de laboratoire peut formuler une demande" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, description, type, quantity, urgency, laboratoireId } = body;

    if (!title) return NextResponse.json({ error: "Titre requis" }, { status: 400 });
    if (!type) return NextResponse.json({ error: "Type de demande requis" }, { status: 400 });

    const demande = await prisma.equipmentRequest.create({
      data: {
        title,
        description: description || null,
        type: type || "ACHAT",
        quantity: Number(quantity) || 1,
        urgency: urgency || "NORMALE",
        status: "EN_ATTENTE",
        requesterId: userId,
        laboratoireId: laboratoireId || null,
      },
      include: { requester: true, laboratoire: true, reviewer: true },
    });

    return NextResponse.json({
      id: demande.id,
      title: demande.title,
      description: demande.description,
      type: demande.type,
      quantity: demande.quantity,
      urgency: demande.urgency,
      status: demande.status,
      createdAt: demande.createdAt.toISOString(),
      reviewNote: demande.reviewNote,
      reviewer: null,
      reviewedAt: null,
    });
  } catch (err: any) {
    console.error("POST /api/demandes error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
