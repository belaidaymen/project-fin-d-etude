import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Plus, Download } from "lucide-react";
import LicensesTable from "./LicensesTable";

export default async function LicensesPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const page = parseInt(searchParams?.page ?? "1");
  const perPage = 20;
  const search = searchParams?.search ?? "";

  const where: any = {
    deletedAt: null,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { serial: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [licenses, total] = await Promise.all([
    prisma.license.findMany({
      where,
      include: {
        manufacturer: true,
        category: true,
        company: true,
        _count: { select: { licenseSeats: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.license.count({ where }),
  ]);

  const serialized = licenses.map(l => ({
    id: l.id,
    name: l.name,
    serial: l.serial,
    seats: l.seats,
    manufacturer: l.manufacturer?.name ?? null,
    category: l.category?.name ?? null,
    company: l.company?.name ?? null,
    maintained: l.maintained,
    expirationDate: l.expirationDate?.toISOString() ?? null,
    purchaseCost: l.purchaseCost?.toString() ?? null,
    usedSeats: l._count.licenseSeats,
  }));

  return (
    <>
      <section className="content-header">
        <h1>Licenses <small>License Management</small></h1>
        <ol className="breadcrumb">
          <li><a href="#">Home</a></li>
          <li className="active">Licenses</li>
        </ol>
      </section>
      <section className="content">
        <div className="box box-default">
          <div className="box-header with-border">
            <h3 className="box-title">License List</h3>
            <div style={{ float: "right", display: "flex", gap: 6 }}>
              <Link href="/licenses/create" className="btn btn-primary btn-sm"><Plus size={14} /> Create</Link>
              <button className="btn btn-default btn-sm"><Download size={14} /> Export</button>
            </div>
          </div>
          <div className="box-body" style={{ padding: 0 }}>
            <LicensesTable licenses={serialized} total={total} page={page} perPage={perPage} search={search} />
          </div>
        </div>
      </section>
    </>
  );
}
