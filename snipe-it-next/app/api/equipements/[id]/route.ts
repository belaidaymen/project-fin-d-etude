import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await prisma.equipement.findUnique({
    where: { id: Number(params.id) },
    include: { categorie: true, fournisseur: true, affectations: { include: { localisation: true, createdPar: true } }, mouvements: { include: { source: true, destination: true, createdPar: true }, orderBy: { createdAt: "desc" }, take: 10 }, maintenances: { orderBy: { dateDebut: "desc" } } },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { reference, nom, description, categorieId, marque, modele, numeroSerie, etat, dateAcquisition, prixAcquisition, fournisseurId, quantite, notes } = await req.json();
    const item = await prisma.equipement.update({
      where: { id: Number(params.id) },
      data: { reference, nom, description: description || null, categorieId: Number(categorieId), marque: marque || null, modele: modele || null, numeroSerie: numeroSerie || null, etat, dateAcquisition: dateAcquisition ? new Date(dateAcquisition) : null, prixAcquisition: prixAcquisition ? parseFloat(prixAcquisition) : null, fournisseurId: fournisseurId ? Number(fournisseurId) : null, quantite: quantite ? Number(quantite) : 1, notes: notes || null },
    });
    return NextResponse.json(item);
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await prisma.equipement.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ success: true });
  } catch (err: any) { return NextResponse.json({ error: "Impossible de supprimer (dépendances associées)" }, { status: 400 }); }
}
