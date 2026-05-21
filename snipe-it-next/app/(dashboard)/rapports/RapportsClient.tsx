"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const ETAT_COLORS: Record<string, string> = { BON: "#00a65a", MOYEN: "#f39c12", MAUVAIS: "#dd4b39", HORS_SERVICE: "#777", EN_MAINTENANCE: "#00c0ef", REFORME: "#605ca8" };
const ETAT_LABELS: Record<string, string> = { BON: "Bon", MOYEN: "Moyen", MAUVAIS: "Mauvais", HORS_SERVICE: "Hors service", EN_MAINTENANCE: "En maint.", REFORME: "Réformé" };
const STATUT_COLORS: Record<string, string> = { EN_ATTENTE: "#f39c12", EN_COURS: "#00c0ef", APPROUVEE: "#00a65a", REJETEE: "#dd4b39", CLOTUREE: "#605ca8", TERMINEE: "#00a65a", ANNULEE: "#777" };
const TYPE_MOUV_COLORS: Record<string, string> = { ENTREE: "#00a65a", SORTIE: "#dd4b39", TRANSFERT: "#3c8dbc", RETOUR: "#f39c12" };
const TYPE_MOUV_LABELS: Record<string, string> = { ENTREE: "Entrée", SORTIE: "Sortie", TRANSFERT: "Transfert", RETOUR: "Retour" };

interface Props {
  data: {
    totalEquipements: number; totalAffectations: number; totalDemandes: number; totalMaintenances: number; totalMouvements: number;
    equipementsParEtat: { etat: string; count: number }[];
    equipementsParCategorie: { nom: string; count: number }[];
    affectationsParLocalisation: { nom: string; count: number }[];
    demandesParStatut: { statut: string; count: number }[];
    maintenancesParStatut: { statut: string; count: number }[];
    mouvementsParType: { type: string; count: number }[];
  };
}

export default function RapportsClient({ data }: Props) {
  const etatPie = data.equipementsParEtat.filter(e => e.count > 0).map(e => ({ name: ETAT_LABELS[e.etat] ?? e.etat, value: e.count, color: ETAT_COLORS[e.etat] ?? "#ccc" }));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Équipements", value: data.totalEquipements, color: "#3c8dbc" },
          { label: "Affectations actives", value: data.totalAffectations, color: "#00a65a" },
          { label: "Demandes totales", value: data.totalDemandes, color: "#f39c12" },
          { label: "Maintenances", value: data.totalMaintenances, color: "#605ca8" },
          { label: "Mouvements", value: data.totalMouvements, color: "#dd4b39" },
        ].map(s => (
          <div key={s.label} className="box" style={{ borderTopColor: s.color, borderTopWidth: 3, borderTopStyle: "solid", marginBottom: 0 }}>
            <div className="box-body" style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value.toLocaleString("fr-FR")}</div>
              <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="box box-primary">
          <div className="box-header with-border"><h3 className="box-title">État des équipements</h3></div>
          <div className="box-body" style={{ padding: "12px 8px" }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={etatPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}>
                  {etatPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Legend formatter={v => <span style={{ fontSize: 11 }}>{v}</span>} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="box box-success">
          <div className="box-header with-border"><h3 className="box-title">Équipements par catégorie</h3></div>
          <div className="box-body" style={{ padding: "12px 8px" }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.equipementsParCategorie} margin={{ top: 0, right: 10, left: -20, bottom: 40 }}>
                <XAxis dataKey="nom" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Équipements" fill="#00a65a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="box box-info">
          <div className="box-header with-border"><h3 className="box-title">Affectations par localisation (top 10)</h3></div>
          <div className="box-body" style={{ padding: "12px 8px" }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.affectationsParLocalisation} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="nom" width={130} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" name="Affectations" fill="#00c0ef" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="box box-warning">
          <div className="box-header with-border"><h3 className="box-title">Mouvements par type</h3></div>
          <div className="box-body" style={{ padding: "12px 8px" }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.mouvementsParType.map(m => ({ ...m, name: TYPE_MOUV_LABELS[m.type] ?? m.type }))} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                {data.mouvementsParType.map((m, i) => (
                  <Bar key={m.type} dataKey="count" name={TYPE_MOUV_LABELS[m.type] ?? m.type} fill={TYPE_MOUV_COLORS[m.type] ?? "#3c8dbc"} radius={[3, 3, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="box box-default">
          <div className="box-header with-border"><h3 className="box-title">Demandes par statut</h3></div>
          <div className="box-body" style={{ padding: 0 }}>
            <table className="table table-condensed" style={{ margin: 0 }}>
              <tbody>
                {data.demandesParStatut.length === 0 && <tr><td colSpan={2} style={{ textAlign: "center", padding: 20, color: "#999" }}>Aucune donnée</td></tr>}
                {data.demandesParStatut.map(d => (
                  <tr key={d.statut}>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 10, background: (STATUT_COLORS[d.statut] ?? "#ccc") + "22", color: STATUT_COLORS[d.statut] ?? "#333", fontWeight: 600 }}>
                        {d.statut.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px", fontWeight: 700, fontSize: 16, textAlign: "right" }}>{d.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="box box-default">
          <div className="box-header with-border"><h3 className="box-title">Maintenances par statut</h3></div>
          <div className="box-body" style={{ padding: 0 }}>
            <table className="table table-condensed" style={{ margin: 0 }}>
              <tbody>
                {data.maintenancesParStatut.length === 0 && <tr><td colSpan={2} style={{ textAlign: "center", padding: 20, color: "#999" }}>Aucune donnée</td></tr>}
                {data.maintenancesParStatut.map(m => (
                  <tr key={m.statut}>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 10, background: (STATUT_COLORS[m.statut] ?? "#ccc") + "22", color: STATUT_COLORS[m.statut] ?? "#333", fontWeight: 600 }}>{m.statut}</span>
                    </td>
                    <td style={{ padding: "10px 16px", fontWeight: 700, fontSize: 16, textAlign: "right" }}>{m.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
