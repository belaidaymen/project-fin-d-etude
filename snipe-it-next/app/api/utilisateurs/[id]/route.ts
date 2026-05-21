import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: Number(params.id) }, include: { localisation: true } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { password, ...safeUser } = user;
  return NextResponse.json(safeUser);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { nom, prenom, username, email, password, role, telephone, notes, actif, localisationId } = await req.json();
    const updateData: any = { nom, prenom, username, email, role, telephone: telephone || null, notes: notes || null, actif: actif ?? true, localisationId: localisationId ? Number(localisationId) : null };
    if (password) updateData.password = await bcrypt.hash(password, 10);
    const user = await prisma.user.update({ where: { id: Number(params.id) }, data: updateData });
    const { password: _, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.user.update({ where: { id: Number(params.id) }, data: { actif: false } });
  return NextResponse.json({ success: true });
}
