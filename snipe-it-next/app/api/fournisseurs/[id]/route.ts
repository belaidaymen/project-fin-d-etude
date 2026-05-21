import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await prisma.fournisseur.findUnique({ where: { id: Number(params.id) }, include: { equipements: { include: { categorie: true } } } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { nom, contact, email, telephone, adresse, notes } = await req.json();
    const item = await prisma.fournisseur.update({ where: { id: Number(params.id) }, data: { nom, contact: contact || null, email: email || null, telephone: telephone || null, adresse: adresse || null, notes: notes || null } });
    return NextResponse.json(item);
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await prisma.fournisseur.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ success: true });
  } catch (err: any) { return NextResponse.json({ error: "Impossible de supprimer (équipements associés)" }, { status: 400 }); }
}
