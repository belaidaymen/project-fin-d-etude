import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "";
  const search = searchParams.get("search") ?? "";
  const where: any = {};
  if (type) where.type = type;
  if (search) where.OR = [{ nom: { contains: search, mode: "insensitive" } }, { batiment: { contains: search, mode: "insensitive" } }];
  const items = await prisma.localisation.findMany({ where, include: { _count: { select: { affectations: true } } }, orderBy: [{ type: "asc" }, { nom: "asc" }] });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { nom, type, batiment, etage, capacite, description } = await req.json();
    if (!nom) return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
    const item = await prisma.localisation.create({ data: { nom, type: type || "SALLE", batiment: batiment || null, etage: etage || null, capacite: capacite ? Number(capacite) : null, description: description || null } });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
