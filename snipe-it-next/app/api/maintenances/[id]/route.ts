import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await prisma.maintenance.findUnique({ where: { id: Number(params.id) }, include: { equipement: true } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { type, description, dateDebut, dateFin, cout, statut, notes } = await req.json();
    const item = await prisma.maintenance.update({ where: { id: Number(params.id) }, data: { type, description, dateDebut: dateDebut ? new Date(dateDebut) : undefined, dateFin: dateFin ? new Date(dateFin) : null, cout: cout ? parseFloat(cout) : null, statut, notes: notes || null } });
    return NextResponse.json(item);
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.maintenance.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ success: true });
}
