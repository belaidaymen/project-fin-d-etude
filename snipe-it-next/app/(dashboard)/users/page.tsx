import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Plus, Download } from "lucide-react";
import UsersTable from "./UsersTable";

export default async function UsersPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const page = parseInt(searchParams?.page ?? "1");
  const perPage = 20;
  const search = searchParams?.search ?? "";

  const where: any = {
    deletedAt: null,
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        company: true,
        location: true,
        department: true,
        _count: { select: { assets: true } },
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.user.count({ where }),
  ]);

  const serialized = users.map(u => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    username: u.username,
    email: u.email,
    jobTitle: u.jobTitle,
    phone: u.phone,
    company: u.company?.name ?? null,
    location: u.location?.name ?? null,
    department: u.department?.name ?? null,
    activated: u.activated,
    isSuperAdmin: u.isSuperAdmin,
    assetCount: u._count.assets,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <>
      <section className="content-header">
        <h1>Users <small>People Management</small></h1>
        <ol className="breadcrumb">
          <li><a href="#">Home</a></li>
          <li className="active">Users</li>
        </ol>
      </section>
      <section className="content">
        <div className="box box-default">
          <div className="box-header with-border">
            <h3 className="box-title">User List</h3>
            <div style={{ float: "right", display: "flex", gap: 6 }}>
              <Link href="/users/create" className="btn btn-primary btn-sm"><Plus size={14} /> Create</Link>
              <button className="btn btn-default btn-sm"><Download size={14} /> Export</button>
            </div>
          </div>
          <div className="box-body" style={{ padding: 0 }}>
            <UsersTable users={serialized} total={total} page={page} perPage={perPage} search={search} />
          </div>
        </div>
      </section>
    </>
  );
}
