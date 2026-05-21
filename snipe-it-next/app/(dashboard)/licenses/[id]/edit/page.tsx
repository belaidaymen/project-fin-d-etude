import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import LicenseForm from "../../LicenseForm";
import Link from "next/link";

export default async function EditLicensePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [license, manufacturers, categories, suppliers, companies] = await Promise.all([
    prisma.license.findFirst({ where: { id: params.id, deletedAt: null } }),
    prisma.manufacturer.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { deletedAt: null, categoryType: "license" }, orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.company.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);

  if (!license) notFound();

  return (
    <>
      <section className="content-header">
        <h1>Edit License <small>{license.name}</small></h1>
        <ol className="breadcrumb">
          <li><Link href="/licenses">Licenses</Link></li>
          <li><Link href={`/licenses/${license.id}`}>{license.name}</Link></li>
          <li className="active">Edit</li>
        </ol>
      </section>
      <section className="content">
        <LicenseForm
          license={{ ...license, purchaseDate: license.purchaseDate?.toISOString() ?? null, purchaseCost: license.purchaseCost?.toString() ?? null, expirationDate: license.expirationDate?.toISOString() ?? null }}
          manufacturers={manufacturers.map(m => ({ id: m.id, name: m.name }))}
          categories={categories.map(c => ({ id: c.id, name: c.name }))}
          suppliers={suppliers.map(s => ({ id: s.id, name: s.name }))}
          companies={companies.map(c => ({ id: c.id, name: c.name }))}
        />
      </section>
    </>
  );
}
