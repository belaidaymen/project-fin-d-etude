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
      include: { laboratoire: true },
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
    role: u.role,
    jobTitle: u.jobTitle,
    phone: u.phone,
    laboratoire: u.laboratoire?.name ?? null,
    activated: u.activated,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <>
      <section className="content-header">
        <h1>Utilisateurs <small>Gestion des comptes</small></h1>
        <ol className="breadcrumb">
          <li><a href="#">Accueil</a></li>
          <li className="active">Utilisateurs</li>
        </ol>
      </section>
      <section className="content">
        <div className="box box-default">
          <div className="box-header with-border">
            <h3 className="box-title">Liste des utilisateurs</h3>
            <div style={{ float: "right", display: "flex", gap: 6 }}>
              <Link href="/users/create" className="btn btn-primary btn-sm"><Plus size={14} /> Créer</Link>
              <button className="btn btn-default btn-sm"><Download size={14} /> Exporter</button>
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
