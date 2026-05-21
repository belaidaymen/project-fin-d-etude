import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ActivityReportPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const page = parseInt(searchParams?.page ?? "1");
  const perPage = 25;
  const actionFilter = searchParams?.action ?? "";

  const where: any = actionFilter ? { actionType: actionFilter } : {};

  const [logs, total] = await Promise.all([
    prisma.actionlog.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        admin: { select: { id: true, firstName: true, lastName: true } },
        asset: { select: { id: true, assetTag: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.actionlog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  const ACTION_TYPES = ["checkout", "checkin", "create", "update", "delete", "restore"];

  return (
    <>
      <section className="content-header">
        <h1>Activity Report <small>Check-In / Check-Out History</small></h1>
        <ol className="breadcrumb">
          <li><Link href="/dashboard">Home</Link></li>
          <li><Link href="/reports">Reports</Link></li>
          <li className="active">Activity</li>
        </ol>
      </section>
      <section className="content">
        <div className="box box-default">
          <div className="box-header with-border">
            <h3 className="box-title">Activity Log</h3>
            <div style={{ float: "right" }}>
              <Link href="/reports" className="btn btn-default btn-sm"><ArrowLeft size={14} /> Back to Reports</Link>
            </div>
          </div>
          <div className="box-body" style={{ padding: 0 }}>
            <div style={{ padding: "10px 15px", borderBottom: "1px solid #d2d6de", display: "flex", gap: 10, alignItems: "center" }}>
              <form method="GET" style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <label style={{ fontWeight: 400, color: "#555", margin: 0 }}>Filter by action:</label>
                <select name="action" className="form-control" style={{ width: 160 }} defaultValue={actionFilter}>
                  <option value="">All Actions</option>
                  {ACTION_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <button type="submit" className="btn btn-default btn-sm">Filter</button>
                {actionFilter && <Link href="/reports/activity" className="btn btn-default btn-sm">Clear</Link>}
              </form>
              <span style={{ marginLeft: "auto", color: "#777", fontSize: 13 }}>{total.toLocaleString()} activities</span>
            </div>

            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Asset</th>
                    <th>Target User</th>
                    <th>Performed By</th>
                    <th>Note</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: 30, color: "#999" }}>No activity found.</td></tr>
                  ) : logs.map(log => (
                    <tr key={log.id}>
                      <td>
                        <span className={`label ${
                          log.actionType === "checkout" ? "label-success" :
                          log.actionType === "checkin" ? "label-info" :
                          log.actionType === "create" ? "label-primary" :
                          log.actionType === "update" ? "label-warning" :
                          log.actionType === "delete" ? "label-danger" :
                          "label-default"
                        }`}>
                          {log.actionType}
                        </span>
                      </td>
                      <td>
                        {log.asset ? (
                          <Link href={`/hardware/${log.asset.id}`} style={{ color: "#337ab7", fontWeight: 600 }}>
                            {log.asset.assetTag}
                          </Link>
                        ) : <span className="text-muted">—</span>}
                      </td>
                      <td>
                        {log.user ? (
                          <Link href={`/users/${log.user.id}`} style={{ color: "#337ab7" }}>
                            {log.user.firstName} {log.user.lastName}
                          </Link>
                        ) : <span className="text-muted">—</span>}
                      </td>
                      <td>
                        {log.admin ? (
                          <Link href={`/users/${log.admin.id}`} style={{ color: "#337ab7" }}>
                            {log.admin.firstName} {log.admin.lastName}
                          </Link>
                        ) : <span className="text-muted">System</span>}
                      </td>
                      <td style={{ color: "#777", fontSize: 12, maxWidth: 200 }}>{log.note ?? "—"}</td>
                      <td style={{ color: "#777", fontSize: 12, whiteSpace: "nowrap" }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ padding: "10px 15px", display: "flex", justifyContent: "flex-end" }}>
                <ul className="pagination" style={{ margin: 0 }}>
                  {page > 1 && <li><Link href={`/reports/activity?page=${page - 1}${actionFilter ? `&action=${actionFilter}` : ""}`}>«</Link></li>}
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                    <li key={p} className={p === page ? "active" : ""}>
                      <Link href={`/reports/activity?page=${p}${actionFilter ? `&action=${actionFilter}` : ""}`}>{p}</Link>
                    </li>
                  ))}
                  {page < totalPages && <li><Link href={`/reports/activity?page=${page + 1}${actionFilter ? `&action=${actionFilter}` : ""}`}>»</Link></li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
