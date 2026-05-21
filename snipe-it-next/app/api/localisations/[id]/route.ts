import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await prisma.localisation.findUnique({ where: { id: Number(params.id) }, include: { affectations: { where: { actif: true }, include: { equipement: { include: { categorie: true } } } }, users: true } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { nom, type, batiment, etage, capacite, description, actif } = await req.json();
    const item = await prisma.localisation.update({ where: { id: Number(params.id) }, data: { nom, type, batiment: batiment || null, etage: etage || null, capacite: capacite ? Number(capacite) : null, description: description || null, actif: actif ?? true } });
    return NextResponse.json(item);
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await prisma.localisation.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ success: true });
  } catch (err: any) { return NextResponse.json({ error: "Impossible de supprimer (affectations associées)" }, { status: 400 }); }
}
