import Link from "next/link";

export default function Page() {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔧</div>
      <h2 style={{ color: "#555", marginBottom: 8 }}>Fonctionnalité en cours de développement</h2>
      <p style={{ fontSize: 14, color: "#999", marginBottom: 24 }}>Cette section sera disponible dans une prochaine version de GestActif.</p>
      <Link href="/dashboard" className="btn btn-default">Retour au tableau de bord</Link>
    </div>
  );
}
