import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import RapportsClient from "./RapportsClient";

export default async function RapportsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [
    totalEquipements, equipementsParEtat, equipementsParCategorie,
    totalAffectations, affectationsParLocalisation,
    totalDemandes, demandesParStatut,
    totalMaintenances, maintenancesParStatut,
    totalMouvements, mouvementsParType,
  ] = await Promise.all([
    prisma.equipement.count(),
    prisma.equipement.groupBy({ by: ["etat"], _count: { id: true } }),
    prisma.categorie.findMany({ include: { _count: { select: { equipements: true } } }, orderBy: { nom: "asc" } }),
    prisma.affectation.count({ where: { actif: true } }),
    prisma.localisation.findMany({ include: { _count: { select: { affectations: true } } }, orderBy: { nom: "asc" }, take: 10 }),
    prisma.demande.count(),
    prisma.demande.groupBy({ by: ["statut"], _count: { id: true } }),
    prisma.maintenance.count(),
    prisma.maintenance.groupBy({ by: ["statut"], _count: { id: true } }),
    prisma.mouvement.count(),
    prisma.mouvement.groupBy({ by: ["type"], _count: { id: true } }),
  ]);

  const data = {
    totalEquipements, totalAffectations, totalDemandes, totalMaintenances, totalMouvements,
    equipementsParEtat: equipementsParEtat.map(e => ({ etat: e.etat, count: e._count.id })),
    equipementsParCategorie: equipementsParCategorie.map(c => ({ nom: c.nom, count: c._count.equipements })),
    affectationsParLocalisation: affectationsParLocalisation.map(l => ({ nom: l.nom, count: l._count.affectations })),
    demandesParStatut: demandesParStatut.map(d => ({ statut: d.statut, count: d._count.id })),
    maintenancesParStatut: maintenancesParStatut.map(m => ({ statut: m.statut, count: m._count.id })),
    mouvementsParType: mouvementsParType.map(m => ({ type: m.type, count: m._count.id })),
  };

  return (
    <>
      <section className="content-header">
        <h1 style={{ fontSize: 22, fontWeight: 300 }}>Rapports <small style={{ color: "#999", fontSize: 14, marginLeft: 8 }}>Statistiques et analyses</small></h1>
        <ol className="breadcrumb"><li><Link href="/dashboard">Accueil</Link></li><li className="active">Rapports</li></ol>
      </section>
      <section className="content">
        <RapportsClient data={data} />
      </section>
    </>
  );
}
