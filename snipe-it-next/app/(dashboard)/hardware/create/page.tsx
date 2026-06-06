import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import AssetForm from "../AssetForm";

export default async function CreateAssetPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [categories, statuses, locations] = await Promise.all([
    prisma.category.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.statuslabel.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.location.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <section className="content-header">
        <h1>Créer un équipement</h1>
        <ol className="breadcrumb">
          <li><a href="#">Accueil</a></li>
          <li><a href="/hardware">Équipements</a></li>
          <li className="active">Créer</li>
        </ol>
      </section>
      <section className="content">
        <AssetForm
          categories={categories.map(c => ({ id: c.id, name: c.name }))}
          statuses={statuses.map(s => ({ id: s.id, name: s.name, color: s.color }))}
          locations={locations.map(l => ({ id: l.id, name: l.name }))}
        />
      </section>
    </>
  );
}
