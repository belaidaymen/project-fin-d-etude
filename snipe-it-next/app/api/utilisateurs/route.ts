import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const where: any = search ? { OR: [{ nom: { contains: search, mode: "insensitive" } }, { prenom: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] } : {};
  const users = await prisma.user.findMany({ where, include: { localisation: true }, orderBy: [{ nom: "asc" }] });
  return NextResponse.json(users.map(u => { const { password, ...rest } = u; return rest; }));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { nom, prenom, username, email, password, role, telephone, notes, actif, localisationId } = await req.json();
    if (!nom || !prenom || !username || !email || !password) return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    const existing = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } });
    if (existing) return NextResponse.json({ error: "Identifiant ou email déjà utilisé" }, { status: 400 });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { nom, prenom, username, email, password: hashed, role: role || "MAGASINIER", telephone: telephone || null, notes: notes || null, actif: actif ?? true, localisationId: localisationId ? Number(localisationId) : null } });
    const { password: _, ...safeUser } = user;
    return NextResponse.json(safeUser, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
