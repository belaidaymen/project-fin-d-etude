import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [totalEquipements, equipementsBon, totalAffectations, demandesEnAttente, maintenancesEnCours, totalMouvements] = await Promise.all([
    prisma.equipement.count(),
    prisma.equipement.count({ where: { etat: "BON" } }),
    prisma.affectation.count({ where: { actif: true } }),
    prisma.demande.count({ where: { statut: "EN_ATTENTE" } }),
    prisma.maintenance.count({ where: { statut: "EN_COURS" } }),
    prisma.mouvement.count(),
  ]);

  return NextResponse.json({ totalEquipements, equipementsBon, totalAffectations, demandesEnAttente, maintenancesEnCours, totalMouvements });
}
