import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const statut = searchParams.get("statut") ?? "";
  const type = searchParams.get("type") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const perPage = 20;
  const where: any = {};
  if (statut) where.statut = statut;
  if (type) where.type = type;
  const role = (session.user as any).role;
  if (role === "CHEF_LABO") where.createdParId = Number((session.user as any).id);
  const [items, total] = await Promise.all([
    prisma.demande.findMany({ where, include: { createdPar: true, equipement: { select: { id: true, nom: true, reference: true } }, validatePar: true }, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.demande.count({ where }),
  ]);
  return NextResponse.json({ total, rows: items });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { type, titre, description, priorite, equipementId, quantite, justification, notes } = await req.json();
    if (!type || !titre || !description) return NextResponse.json({ error: "Type, titre et description requis" }, { status: 400 });
    const userId = Number((session.user as any).id);
    const item = await prisma.demande.create({
      data: { type, titre, description, priorite: priorite || "NORMALE", statut: "EN_ATTENTE", createdParId: userId, equipementId: equipementId ? Number(equipementId) : null, quantite: quantite ? Number(quantite) : null, justification: justification || null, notes: notes || null },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
