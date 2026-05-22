import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== "LOGISTIQUE") {
    return NextResponse.json({ error: "Seul le responsable logistique peut valider les demandes" }, { status: 403 });
  }

  const { id } = await params;
  const userId = (session.user as any).id;

  try {
    const body = await req.json();
    const { status, reviewNote } = body;

    if (!["APPROUVEE", "REJETEE"].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const updated = await prisma.equipmentRequest.update({
      where: { id },
      data: {
        status,
        reviewerId: userId,
        reviewNote: reviewNote || null,
        reviewedAt: new Date(),
      },
      include: { reviewer: true, requester: true, laboratoire: true },
    });

    return NextResponse.json({
      id: updated.id,
      title: updated.title,
      description: updated.description,
      quantity: updated.quantity,
      urgency: updated.urgency,
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
      reviewNote: updated.reviewNote,
      reviewer: updated.reviewer ? { firstName: updated.reviewer.firstName, lastName: updated.reviewer.lastName } : null,
      reviewedAt: updated.reviewedAt?.toISOString() ?? null,
      laboratoire: updated.laboratoire ? { name: updated.laboratoire.name } : null,
      requester: { firstName: updated.requester.firstName, lastName: updated.requester.lastName },
    });
  } catch (err: any) {
    console.error("PATCH /api/demandes/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
