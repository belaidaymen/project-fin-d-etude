import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Edit, ArrowLeft } from "lucide-react";
import DeleteUserButton from "./DeleteUserButton";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findFirst({
    where: { id: id, deletedAt: null },
    include: { laboratoire: true },
  });

  if (!user) notFound();

  const ROLE_LABELS: Record<string, string> = {
    LOGISTIQUE: "Responsable Logistique",
    MAGASINIER: "Magasinier",
    LABORATOIRE: "Responsable Laboratoire",
  };

  return (
    <>
      <section className="content-header">
        <h1>{user.firstName} {user.lastName} <small>Fiche utilisateur</small></h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Accueil</Link></li>
          <li><Link href="/users">Utilisateurs</Link></li>
          <li className="active">{user.username}</li>
        </ol>
      </section>
      <section className="content">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Link href="/users" className="btn btn-default btn-sm"><ArrowLeft size={14} /> Retour</Link>
          <Link href={`/users/${user.id}/edit`} className="btn btn-warning btn-sm"><Edit size={14} /> Modifier</Link>
          <DeleteUserButton id={user.id} name={`${user.firstName} ${user.lastName}`} />
        </div>

        <div className="box box-primary" style={{ maxWidth: 600 }}>
          <div className="box-header with-border">
            <h3 className="box-title">Informations</h3>
            {user.activated
              ? <span className="label label-success" style={{ float: "right" }}>Actif</span>
              : <span className="label label-danger" style={{ float: "right" }}>Inactif</span>}
          </div>
          <div className="box-body" style={{ padding: 0 }}>
            <table className="table" style={{ marginBottom: 0 }}>
              <tbody>
                <tr><td style={{ width: "40%", fontWeight: 600, color: "#777" }}>Nom complet</td><td><strong>{user.firstName} {user.lastName}</strong></td></tr>
                <tr><td style={{ fontWeight: 600, color: "#777" }}>Nom d'utilisateur</td><td style={{ fontFamily: "monospace" }}>{user.username}</td></tr>
                <tr><td style={{ fontWeight: 600, color: "#777" }}>Email</td><td><a href={`mailto:${user.email}`} style={{ color: "#337ab7" }}>{user.email}</a></td></tr>
                <tr><td style={{ fontWeight: 600, color: "#777" }}>Rôle</td><td>{ROLE_LABELS[user.role] ?? user.role}</td></tr>
                <tr><td style={{ fontWeight: 600, color: "#777" }}>Poste</td><td>{user.jobTitle ?? "—"}</td></tr>
                <tr><td style={{ fontWeight: 600, color: "#777" }}>Téléphone</td><td>{user.phone ?? "—"}</td></tr>
                {user.role === "LABORATOIRE" && (
                  <tr><td style={{ fontWeight: 600, color: "#777" }}>Laboratoire</td><td>{user.laboratoire?.name ?? "—"}</td></tr>
                )}
                <tr><td style={{ fontWeight: 600, color: "#777" }}>Créé le</td><td style={{ fontSize: 12 }}>{new Date(user.createdAt).toLocaleDateString("fr-FR")}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
