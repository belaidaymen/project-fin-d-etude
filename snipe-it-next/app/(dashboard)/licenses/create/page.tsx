import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import LicenseForm from "../LicenseForm";

export default async function CreateLicensePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [manufacturers, categories, suppliers, companies] = await Promise.all([
    prisma.manufacturer.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { deletedAt: null, categoryType: "license" }, orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.company.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <section className="content-header">
        <h1>Create License</h1>
        <ol className="breadcrumb">
          <li><a href="/licenses">Licenses</a></li>
          <li className="active">Create</li>
        </ol>
      </section>
      <section className="content">
        <LicenseForm
          manufacturers={manufacturers.map(m => ({ id: m.id, name: m.name }))}
          categories={categories.map(c => ({ id: c.id, name: c.name }))}
          suppliers={suppliers.map(s => ({ id: s.id, name: s.name }))}
          companies={companies.map(c => ({ id: c.id, name: c.name }))}
        />
      </section>
    </>
  );
}
