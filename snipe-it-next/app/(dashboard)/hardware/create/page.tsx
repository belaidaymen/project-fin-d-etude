import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import AssetForm from "../AssetForm";

export default async function CreateAssetPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [models, statuses, suppliers, locations, companies, users] = await Promise.all([
    prisma.assetModel.findMany({ where: { deletedAt: null }, include: { manufacturer: true }, orderBy: { name: "asc" } }),
    prisma.statuslabel.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.location.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.company.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { deletedAt: null, activated: true }, orderBy: [{ firstName: "asc" }, { lastName: "asc" }] }),
  ]);

  return (
    <>
      <section className="content-header">
        <h1>Create Asset</h1>
        <ol className="breadcrumb">
          <li><a href="#">Home</a></li>
          <li><a href="/hardware">Assets</a></li>
          <li className="active">Create</li>
        </ol>
      </section>
      <section className="content">
        <AssetForm
          models={models.map(m => ({ id: m.id, name: m.name, manufacturer: m.manufacturer?.name ?? null }))}
          statuses={statuses.map(s => ({ id: s.id, name: s.name, type: s.statusType }))}
          suppliers={suppliers.map(s => ({ id: s.id, name: s.name }))}
          locations={locations.map(l => ({ id: l.id, name: l.name }))}
          companies={companies.map(c => ({ id: c.id, name: c.name }))}
          users={users.map(u => ({ id: u.id, name: `${u.firstName} ${u.lastName}` }))}
        />
      </section>
    </>
  );
}
