import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import EntityForm from "@/components/forms/EntityForm";
import Link from "next/link";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const item = await prisma.category.findFirst({ where: { id: id, deletedAt: null } });
  if (!item) notFound();
  return (
    <>
      <section className="content-header">
        <h1>Modifier la catégorie</h1>
        <ol className="breadcrumb"><li><Link href="/categories">Catégories</Link></li><li className="active">Modifier</li></ol>
      </section>
      <section className="content">
        <EntityForm
          entityType="category"
          apiUrl="/api/categories"
          backUrl="/categories"
          item={{ ...item }}
          fields={[
            { name: "name", label: "Nom", type: "text", required: true },
            { name: "notes", label: "Notes", type: "textarea" },
          ]}
        />
      </section>
    </>
  );
}
