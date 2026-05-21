import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = (session.user as any).role;

  const [
    totalEquipements,
    equipementsBon,
    equipementsMoyen,
    equipementsMauvais,
    equipementsHorsService,
    equipementsEnMaintenance,
    equipementsReforme,
    totalLocalisations,
    totalAffectations,
    totalDemandes,
    demandesEnAttente,
    demandesApprouvees,
    totalMaintenances,
    maintenancesEnCours,
    totalMouvements,
    totalUtilisateurs,
  ] = await Promise.all([
    prisma.equipement.count(),
    prisma.equipement.count({ where: { etat: "BON" } }),
    prisma.equipement.count({ where: { etat: "MOYEN" } }),
    prisma.equipement.count({ where: { etat: "MAUVAIS" } }),
    prisma.equipement.count({ where: { etat: "HORS_SERVICE" } }),
    prisma.equipement.count({ where: { etat: "EN_MAINTENANCE" } }),
    prisma.equipement.count({ where: { etat: "REFORME" } }),
    prisma.localisation.count({ where: { actif: true } }),
    prisma.affectation.count({ where: { actif: true } }),
    prisma.demande.count(),
    prisma.demande.count({ where: { statut: "EN_ATTENTE" } }),
    prisma.demande.count({ where: { statut: "APPROUVEE" } }),
    prisma.maintenance.count(),
    prisma.maintenance.count({ where: { statut: "EN_COURS" } }),
    prisma.mouvement.count(),
    prisma.user.count({ where: { actif: true } }),
  ]);

  const recentDemandes = await prisma.demande.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { createdPar: true, equipement: true },
  });

  const recentMouvements = await prisma.mouvement.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { equipement: true, createdPar: true, source: true, destination: true },
  });

  const equipementsParCategorie = await prisma.categorie.findMany({
    include: { _count: { select: { equipements: true } } },
    orderBy: { equipements: { _count: "desc" } },
    take: 8,
  });

  const equipementsParEtat = [
    { etat: "BON", count: equipementsBon, color: "#00a65a" },
    { etat: "MOYEN", count: equipementsMoyen, color: "#f39c12" },
    { etat: "MAUVAIS", count: equipementsMauvais, color: "#dd4b39" },
    { etat: "HORS SERVICE", count: equipementsHorsService, color: "#777" },
    { etat: "EN MAINTENANCE", count: equipementsEnMaintenance, color: "#00c0ef" },
    { etat: "RÉFORMÉ", count: equipementsReforme, color: "#605ca8" },
  ];

  return (
    <DashboardClient
      role={role}
      stats={{
        totalEquipements,
        equipementsBon,
        totalLocalisations,
        totalAffectations,
        totalDemandes,
        demandesEnAttente,
        demandesApprouvees,
        totalMaintenances,
        maintenancesEnCours,
        totalMouvements,
        totalUtilisateurs,
      }}
      recentDemandes={recentDemandes.map(d => ({
        id: d.id,
        titre: d.titre,
        type: d.type,
        statut: d.statut,
        priorite: d.priorite,
        createdAt: d.createdAt.toISOString(),
        createdPar: `${d.createdPar.prenom} ${d.createdPar.nom}`,
        equipement: d.equipement?.nom ?? null,
      }))}
      recentMouvements={recentMouvements.map(m => ({
        id: m.id,
        type: m.type,
        quantite: m.quantite,
        dateOperation: m.dateOperation.toISOString(),
        equipement: m.equipement.nom,
        reference: m.equipement.reference,
        createdPar: `${m.createdPar.prenom} ${m.createdPar.nom}`,
        source: m.source?.nom ?? null,
        destination: m.destination?.nom ?? null,
      }))}
      equipementsParCategorie={equipementsParCategorie.map(c => ({
        nom: c.nom,
        count: c._count.equipements,
      }))}
      equipementsParEtat={equipementsParEtat}
    />
  );
}
