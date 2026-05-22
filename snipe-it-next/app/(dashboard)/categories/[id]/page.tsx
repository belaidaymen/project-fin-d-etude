import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Edit, ArrowLeft } from "lucide-react";

export default async function CategoryDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const cat = await prisma.category.findFirst({
    where: { id: params.id, deletedAt: null },
    include: {
      models: { where: { deletedAt: null }, take: 25, orderBy: { name: "asc" } },
    },
  });
  if (!cat) notFound();

  return (
    <>
      <section className="content-header">
        <h1>{cat.name}</h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Home</Link></li>
          <li><Link href="/categories">Categories</Link></li>
          <li className="active">{cat.name}</li>
        </ol>
      </section>
      <section className="content">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Link href="/categories" className="btn btn-default btn-sm"><ArrowLeft size={14} /> Back</Link>
          <Link href={`/categories/${cat.id}/edit`} className="btn btn-warning btn-sm"><Edit size={14} /> Edit</Link>
        </div>
        <div className="box box-primary">
          <div className="box-header with-border"><h3 className="box-title">Category Details</h3></div>
          <div className="box-body" style={{ padding: 0 }}>
            <table className="table">
              <tbody>
                <tr><td style={{ width: "35%", fontWeight: 600, color: "#777" }}>Name</td><td><strong>{cat.name}</strong></td></tr>
                <tr><td style={{ fontWeight: 600, color: "#777" }}>Type</td><td><span className="label label-default" style={{ textTransform: "capitalize" }}>{cat.categoryType}</span></td></tr>
                <tr><td style={{ fontWeight: 600, color: "#777" }}>Models</td><td>{cat.models.length}</td></tr>
                <tr><td style={{ fontWeight: 600, color: "#777" }}>Require Acceptance</td><td>{cat.requireAcceptance ? "Yes" : "No"}</td></tr>
                <tr><td style={{ fontWeight: 600, color: "#777" }}>Checkin Email</td><td>{cat.checkinEmail ? "Yes" : "No"}</td></tr>
                {cat.notes && <tr><td style={{ fontWeight: 600, color: "#777" }}>Notes</td><td>{cat.notes}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        {cat.models.length > 0 && (
          <div className="box box-default">
            <div className="box-header with-border"><h3 className="box-title">Models in this Category</h3></div>
            <div className="box-body" style={{ padding: 0 }}>
              <table className="table table-hover">
                <thead><tr><th>Name</th><th>Model #</th></tr></thead>
                <tbody>
                  {cat.models.map(m => (
                    <tr key={m.id}><td><Link href={`/models/${m.id}`} style={{ color: "#337ab7" }}>{m.name}</Link></td><td style={{ fontSize: 12 }}>{m.modelNumber ?? "—"}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
