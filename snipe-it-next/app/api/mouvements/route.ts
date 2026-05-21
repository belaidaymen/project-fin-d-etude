import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const type = searchParams.get("type") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const perPage = 20;
  const where: any = {};
  if (type) where.type = type;
  if (search) where.OR = [{ equipement: { nom: { contains: search, mode: "insensitive" } } }, { equipement: { reference: { contains: search, mode: "insensitive" } } }, { motif: { contains: search, mode: "insensitive" } }];
  const [items, total] = await Promise.all([
    prisma.mouvement.findMany({ where, include: { equipement: { select: { id: true, nom: true, reference: true } }, source: true, destination: true, createdPar: true }, orderBy: { dateOperation: "desc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.mouvement.count({ where }),
  ]);
  return NextResponse.json({ total, rows: items });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { equipementId, type, quantite, dateOperation, motif, notes, sourceId, destinationId } = await req.json();
    if (!equipementId || !type) return NextResponse.json({ error: "Équipement et type requis" }, { status: 400 });
    const userId = Number((session.user as any).id);
    const item = await prisma.mouvement.create({
      data: { equipementId: Number(equipementId), type, quantite: quantite ? Number(quantite) : 1, dateOperation: dateOperation ? new Date(dateOperation) : new Date(), motif: motif || null, notes: notes || null, sourceId: sourceId ? Number(sourceId) : null, destinationId: destinationId ? Number(destinationId) : null, createdParId: userId },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
