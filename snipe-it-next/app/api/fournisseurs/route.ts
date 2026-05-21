import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const where: any = search ? { OR: [{ nom: { contains: search, mode: "insensitive" } }, { contact: { contains: search, mode: "insensitive" } }] } : {};
  const items = await prisma.fournisseur.findMany({ where, include: { _count: { select: { equipements: true } } }, orderBy: { nom: "asc" } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { nom, contact, email, telephone, adresse, notes } = await req.json();
    if (!nom) return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
    const item = await prisma.fournisseur.create({ data: { nom, contact: contact || null, email: email || null, telephone: telephone || null, adresse: adresse || null, notes: notes || null } });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
