import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const actif = searchParams.get("actif");
  const localisationId = searchParams.get("localisationId");
  const page = parseInt(searchParams.get("page") ?? "1");
  const perPage = 20;
  const where: any = {};
  if (actif !== null) where.actif = actif === "true";
  if (localisationId) where.localisationId = Number(localisationId);
  const [items, total] = await Promise.all([
    prisma.affectation.findMany({ where, include: { equipement: { include: { categorie: true } }, localisation: true, createdPar: true }, orderBy: { dateAffectation: "desc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.affectation.count({ where }),
  ]);
  return NextResponse.json({ total, rows: items });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { equipementId, localisationId, quantite, dateAffectation, notes } = await req.json();
    if (!equipementId || !localisationId) return NextResponse.json({ error: "Équipement et localisation requis" }, { status: 400 });
    const userId = Number((session.user as any).id);
    const item = await prisma.affectation.create({
      data: { equipementId: Number(equipementId), localisationId: Number(localisationId), quantite: quantite ? Number(quantite) : 1, dateAffectation: dateAffectation ? new Date(dateAffectation) : new Date(), notes: notes || null, actif: true, createdParId: userId },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
