import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Wrench, ArrowLeft } from "lucide-react";

export default async function MaintenancesPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const page = parseInt(searchParams?.page ?? "1");
  const perPage = 20;
  const search = searchParams?.search ?? "";

  const where: any = search ? {
    OR: [
      { title: { contains: search, mode: "insensitive" } },
      { asset: { assetTag: { contains: search, mode: "insensitive" } } },
      { asset: { name: { contains: search, mode: "insensitive" } } },
    ],
  } : {};

  const [items, total] = await Promise.all([
    prisma.maintenance.findMany({
      where,
      include: { asset: true, supplier: true },
      orderBy: { startDate: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.maintenance.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <>
      <section className="content-header">
        <h1>Asset Maintenances <small>Maintenance Logs</small></h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Home</Link></li>
          <li className="active">Maintenances</li>
        </ol>
      </section>
      <section className="content">
        <div className="box box-default">
          <div className="box-header with-border">
            <h3 className="box-title">Maintenance List</h3>
          </div>
          <div className="box-body" style={{ padding: 0 }}>
            {/* Search bar */}
            <div style={{ padding: "10px 15px", borderBottom: "1px solid #d2d6de", display: "flex", gap: 10, alignItems: "center" }}>
              <form method="GET" style={{ display: "flex", gap: 6 }}>
                <input name="search" className="form-control" style={{ width: 240 }} placeholder="Search maintenances..." defaultValue={search} />
                <button type="submit" className="btn btn-default btn-sm">Search</button>
              </form>
              <span style={{ marginLeft: "auto", color: "#777", fontSize: 13 }}>{total.toLocaleString()} maintenance{total !== 1 ? "s" : ""}</span>
            </div>

            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Start Date</th>
                    <th>Completion</th>
                    <th>Cost</th>
                    <th>Supplier</th>
                    <th>Warranty</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: "center", padding: 30, color: "#999" }}>No maintenance records found.</td></tr>
                  ) : items.map(item => (
                    <tr key={item.id}>
                      <td>
                        <Link href={`/hardware/${item.assetId}`} style={{ color: "#337ab7", fontWeight: 600 }}>
                          {item.asset.assetTag}
                        </Link>
                        {item.asset.name && <span style={{ color: "#777", marginLeft: 6, fontSize: 12 }}>{item.asset.name}</span>}
                      </td>
                      <td>{item.title}</td>
                      <td><span className="label label-info">{item.maintenanceType}</span></td>
                      <td style={{ fontSize: 12 }}>{new Date(item.startDate).toLocaleDateString()}</td>
                      <td style={{ fontSize: 12 }}>{item.completionDate ? new Date(item.completionDate).toLocaleDateString() : <span className="text-muted">Ongoing</span>}</td>
                      <td>{item.cost ? `$${Number(item.cost).toFixed(2)}` : "—"}</td>
                      <td>{item.supplier?.name ?? "—"}</td>
                      <td>{item.isWarranty ? <span className="label label-success">Yes</span> : <span className="label label-default">No</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ padding: "10px 15px", display: "flex", justifyContent: "flex-end" }}>
                <ul className="pagination" style={{ margin: 0 }}>
                  {page > 1 && <li><Link href={`/maintenances?page=${page - 1}${search ? `&search=${search}` : ""}`}>«</Link></li>}
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                    <li key={p} className={p === page ? "active" : ""}>
                      <Link href={`/maintenances?page=${p}${search ? `&search=${search}` : ""}`}>{p}</Link>
                    </li>
                  ))}
                  {page < totalPages && <li><Link href={`/maintenances?page=${page + 1}${search ? `&search=${search}` : ""}`}>»</Link></li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
