import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await prisma.demande.findUnique({ where: { id: Number(params.id) }, include: { createdPar: true, equipement: true, validatePar: true } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const userId = Number((session.user as any).id);
    const updateData: any = {};
    if (body.statut) { updateData.statut = body.statut; if (["APPROUVEE", "REJETEE"].includes(body.statut)) { updateData.validateParId = userId; updateData.dateValidation = new Date(); } }
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.titre) updateData.titre = body.titre;
    if (body.description) updateData.description = body.description;
    if (body.priorite) updateData.priorite = body.priorite;
    const item = await prisma.demande.update({ where: { id: Number(params.id) }, data: updateData });
    return NextResponse.json(item);
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.demande.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ success: true });
}
