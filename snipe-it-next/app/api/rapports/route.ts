import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    totalEquipements, equipementsParEtat, equipementsParCategorie,
    totalAffectations, affectationsParLocalisation,
    totalDemandes, demandesParStatut, demandesParType,
    totalMaintenances, maintenancesParStatut,
    totalMouvements, mouvementsParType,
  ] = await Promise.all([
    prisma.equipement.count(),
    prisma.equipement.groupBy({ by: ["etat"], _count: { id: true } }),
    prisma.categorie.findMany({ include: { _count: { select: { equipements: true } } } }),
    prisma.affectation.count({ where: { actif: true } }),
    prisma.localisation.findMany({ include: { _count: { select: { affectations: true } } }, orderBy: { nom: "asc" } }),
    prisma.demande.count(),
    prisma.demande.groupBy({ by: ["statut"], _count: { id: true } }),
    prisma.demande.groupBy({ by: ["type"], _count: { id: true } }),
    prisma.maintenance.count(),
    prisma.maintenance.groupBy({ by: ["statut"], _count: { id: true } }),
    prisma.mouvement.count(),
    prisma.mouvement.groupBy({ by: ["type"], _count: { id: true } }),
  ]);

  return NextResponse.json({
    equipements: { total: totalEquipements, parEtat: equipementsParEtat.map(e => ({ etat: e.etat, count: e._count.id })), parCategorie: equipementsParCategorie.map(c => ({ nom: c.nom, count: c._count.equipements })) },
    affectations: { total: totalAffectations, parLocalisation: affectationsParLocalisation.map(l => ({ nom: l.nom, type: l.type, count: l._count.affectations })) },
    demandes: { total: totalDemandes, parStatut: demandesParStatut.map(d => ({ statut: d.statut, count: d._count.id })), parType: demandesParType.map(d => ({ type: d.type, count: d._count.id })) },
    maintenances: { total: totalMaintenances, parStatut: maintenancesParStatut.map(m => ({ statut: m.statut, count: m._count.id })) },
    mouvements: { total: totalMouvements, parType: mouvementsParType.map(m => ({ type: m.type, count: m._count.id })) },
  });
}
