"use client";

import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { Package, MapPin, ArrowLeftRight, ClipboardList, Wrench, Users, AlertTriangle, CheckCircle } from "lucide-react";

const STATUT_COLORS: Record<string, string> = {
  EN_ATTENTE: "#f39c12",
  EN_COURS: "#00c0ef",
  APPROUVEE: "#00a65a",
  REJETEE: "#dd4b39",
  CLOTUREE: "#605ca8",
};

const TYPE_MOUVEMENT_LABELS: Record<string, string> = {
  ENTREE: "Entrée",
  SORTIE: "Sortie",
  TRANSFERT: "Transfert",
  RETOUR: "Retour",
};

const PRIORITE_COLORS: Record<string, string> = {
  BASSE: "#aaa",
  NORMALE: "#3c8dbc",
  HAUTE: "#f39c12",
  URGENTE: "#dd4b39",
};

interface Props {
  role: string;
  stats: {
    totalEquipements: number;
    equipementsBon: number;
    totalLocalisations: number;
    totalAffectations: number;
    totalDemandes: number;
    demandesEnAttente: number;
    demandesApprouvees: number;
    totalMaintenances: number;
    maintenancesEnCours: number;
    totalMouvements: number;
    totalUtilisateurs: number;
  };
  recentDemandes: {
    id: number;
    titre: string;
    type: string;
    statut: string;
    priorite: string;
    createdAt: string;
    createdPar: string;
    equipement: string | null;
  }[];
  recentMouvements: {
    id: number;
    type: string;
    quantite: number;
    dateOperation: string;
    equipement: string;
    reference: string;
    createdPar: string;
    source: string | null;
    destination: string | null;
  }[];
  equipementsParCategorie: { nom: string; count: number }[];
  equipementsParEtat: { etat: string; count: number; color: string }[];
}

function StatCard({ title, value, icon, color, href }: { title: string; value: number; icon: React.ReactNode; color: string; href?: string }) {
  const content = (
    <div className="info-box" style={{ marginBottom: 0 }}>
      <span className="info-box-icon" style={{ background: color, color: "white", display: "flex", alignItems: "center", justifyContent: "center", width: 70, minHeight: 70 }}>
        {icon}
      </span>
      <div className="info-box-content" style={{ padding: "8px 16px" }}>
        <span className="info-box-text" style={{ display: "block", fontSize: 12, color: "#999", marginBottom: 2 }}>{title}</span>
        <span className="info-box-number" style={{ fontSize: 26, fontWeight: 700, color: "#333" }}>{value.toLocaleString("fr-FR")}</span>
      </div>
    </div>
  );
  return href ? <Link href={href} style={{ textDecoration: "none" }}>{content}</Link> : content;
}

export default function DashboardClient({ role, stats, recentDemandes, recentMouvements, equipementsParCategorie, equipementsParEtat }: Props) {
  return (
    <div>
      <section className="content-header" style={{ padding: "10px 15px 0" }}>
        <h1 style={{ fontSize: 22, fontWeight: 300, margin: 0 }}>
          Tableau de bord
          <small style={{ fontSize: 14, color: "#999", marginLeft: 8 }}>Vue d'ensemble</small>
        </h1>
      </section>

      <section className="content" style={{ padding: "15px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
          <StatCard title="Total Équipements" value={stats.totalEquipements} icon={<Package size={28} />} color="#3c8dbc" href="/equipements" />
          <StatCard title="En bon état" value={stats.equipementsBon} icon={<CheckCircle size={28} />} color="#00a65a" href="/equipements" />
          <StatCard title="Affectations actives" value={stats.totalAffectations} icon={<MapPin size={28} />} color="#00c0ef" href="/affectations" />
          <StatCard title="Demandes en attente" value={stats.demandesEnAttente} icon={<AlertTriangle size={28} />} color="#f39c12" href="/demandes" />
          <StatCard title="Maintenances en cours" value={stats.maintenancesEnCours} icon={<Wrench size={28} />} color="#605ca8" href="/maintenances" />
          <StatCard title="Mouvements total" value={stats.totalMouvements} icon={<ArrowLeftRight size={28} />} color="#dd4b39" href="/mouvements" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div className="box box-primary">
            <div className="box-header with-border">
              <h3 className="box-title">Équipements par catégorie</h3>
            </div>
            <div className="box-body" style={{ padding: "12px 8px" }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={equipementsParCategorie} margin={{ top: 0, right: 10, left: -20, bottom: 40 }}>
                  <XAxis dataKey="nom" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Équipements" fill="#3c8dbc" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="box box-success">
            <div className="box-header with-border">
              <h3 className="box-title">État des équipements</h3>
            </div>
            <div className="box-body" style={{ padding: "12px 8px" }}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={equipementsParEtat.filter(e => e.count > 0)} dataKey="count" nameKey="etat" cx="50%" cy="50%" outerRadius={75} label={({ count }) => count > 0 ? count : ""}>
                    {equipementsParEtat.filter(e => e.count > 0).map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="box box-warning">
            <div className="box-header with-border" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="box-title">Dernières demandes</h3>
              <Link href="/demandes" style={{ fontSize: 12, color: "#3c8dbc" }}>Voir tout →</Link>
            </div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table table-hover" style={{ margin: 0 }}>
                <thead>
                  <tr style={{ background: "#f9f9f9" }}>
                    <th style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600 }}>Titre</th>
                    <th style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600 }}>Priorité</th>
                    <th style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600 }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDemandes.length === 0 && (
                    <tr><td colSpan={3} style={{ textAlign: "center", padding: 20, color: "#999", fontSize: 13 }}>Aucune demande enregistrée</td></tr>
                  )}
                  {recentDemandes.map(d => (
                    <tr key={d.id}>
                      <td style={{ padding: "8px 12px", fontSize: 13 }}>
                        <Link href={`/demandes/${d.id}`} style={{ color: "#3c8dbc", textDecoration: "none" }}>{d.titre}</Link>
                        <div style={{ fontSize: 11, color: "#999" }}>{d.createdPar}</div>
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 10, background: (PRIORITE_COLORS[d.priorite] ?? "#ccc") + "22", color: PRIORITE_COLORS[d.priorite] ?? "#333", fontWeight: 600 }}>
                          {d.priorite}
                        </span>
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 10, background: (STATUT_COLORS[d.statut] ?? "#ccc") + "22", color: STATUT_COLORS[d.statut] ?? "#333", fontWeight: 600 }}>
                          {d.statut.replace(/_/g, " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="box box-info">
            <div className="box-header with-border" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="box-title">Derniers mouvements</h3>
              <Link href="/mouvements" style={{ fontSize: 12, color: "#3c8dbc" }}>Voir tout →</Link>
            </div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table table-hover" style={{ margin: 0 }}>
                <thead>
                  <tr style={{ background: "#f9f9f9" }}>
                    <th style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600 }}>Équipement</th>
                    <th style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600 }}>Type</th>
                    <th style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600 }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMouvements.length === 0 && (
                    <tr><td colSpan={3} style={{ textAlign: "center", padding: 20, color: "#999", fontSize: 13 }}>Aucun mouvement enregistré</td></tr>
                  )}
                  {recentMouvements.map(m => (
                    <tr key={m.id}>
                      <td style={{ padding: "8px 12px", fontSize: 13 }}>
                        <div style={{ fontWeight: 500 }}>{m.equipement}</div>
                        <div style={{ fontSize: 11, color: "#999" }}>{m.reference}</div>
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 10, background: "#3c8dbc22", color: "#3c8dbc", fontWeight: 600 }}>
                          {TYPE_MOUVEMENT_LABELS[m.type] ?? m.type}
                        </span>
                      </td>
                      <td style={{ padding: "8px 12px", fontSize: 12, color: "#777" }}>
                        {new Date(m.dateOperation).toLocaleDateString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
