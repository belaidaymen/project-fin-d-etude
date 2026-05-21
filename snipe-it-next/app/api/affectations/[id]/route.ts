import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await prisma.affectation.findUnique({ where: { id: Number(params.id) }, include: { equipement: true, localisation: true, createdPar: true } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { quantite, dateFin, notes, actif } = await req.json();
    const item = await prisma.affectation.update({ where: { id: Number(params.id) }, data: { quantite: quantite ? Number(quantite) : undefined, dateFin: dateFin ? new Date(dateFin) : null, notes: notes || null, actif: actif ?? true } });
    return NextResponse.json(item);
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.affectation.update({ where: { id: Number(params.id) }, data: { actif: false, dateFin: new Date() } });
  return NextResponse.json({ success: true });
}
