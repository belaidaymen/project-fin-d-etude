import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const etat = searchParams.get("etat") ?? "";
  const categorieId = searchParams.get("categorieId") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const perPage = 20;
  const where: any = {};
  if (search) where.OR = [{ nom: { contains: search, mode: "insensitive" } }, { reference: { contains: search, mode: "insensitive" } }, { marque: { contains: search, mode: "insensitive" } }];
  if (etat) where.etat = etat;
  if (categorieId) where.categorieId = Number(categorieId);
  const [items, total] = await Promise.all([
    prisma.equipement.findMany({ where, include: { categorie: true, fournisseur: true, affectations: { where: { actif: true }, include: { localisation: true }, take: 1 } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.equipement.count({ where }),
  ]);
  return NextResponse.json({ total, rows: items });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { reference, nom, description, categorieId, marque, modele, numeroSerie, etat, dateAcquisition, prixAcquisition, fournisseurId, quantite, notes } = body;
    if (!reference || !nom || !categorieId) return NextResponse.json({ error: "Référence, nom et catégorie requis" }, { status: 400 });
    const item = await prisma.equipement.create({
      data: { reference, nom, description: description || null, categorieId: Number(categorieId), marque: marque || null, modele: modele || null, numeroSerie: numeroSerie || null, etat: etat || "BON", dateAcquisition: dateAcquisition ? new Date(dateAcquisition) : null, prixAcquisition: prixAcquisition ? parseFloat(prixAcquisition) : null, fournisseurId: fournisseurId ? Number(fournisseurId) : null, quantite: quantite ? Number(quantite) : 1, notes: notes || null },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
