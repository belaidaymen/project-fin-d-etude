import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const perPage = 20;
  const where: any = search ? { OR: [{ description: { contains: search, mode: "insensitive" } }, { equipement: { nom: { contains: search, mode: "insensitive" } } }] } : {};
  const [items, total] = await Promise.all([
    prisma.maintenance.findMany({ where, include: { equipement: { select: { id: true, nom: true, reference: true } } }, orderBy: { dateDebut: "desc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.maintenance.count({ where }),
  ]);
  return NextResponse.json({ total, rows: items });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { equipementId, type, description, dateDebut, dateFin, cout, statut, notes } = await req.json();
    if (!equipementId || !description) return NextResponse.json({ error: "Équipement et description requis" }, { status: 400 });
    const item = await prisma.maintenance.create({
      data: { equipementId: Number(equipementId), type: type || "PREVENTIVE", description, dateDebut: dateDebut ? new Date(dateDebut) : new Date(), dateFin: dateFin ? new Date(dateFin) : null, cout: cout ? parseFloat(cout) : null, statut: statut || "EN_COURS", notes: notes || null },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
