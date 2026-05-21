import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Plus, Download, Upload, Wrench } from "lucide-react";
import AssetsTable from "./AssetsTable";

export default async function HardwarePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const page = parseInt(searchParams?.page ?? "1");
  const perPage = 20;
  const search = searchParams?.search ?? "";
  const status = searchParams?.status ?? "";

  const where: any = {
    deletedAt: null,
    ...(search && {
      OR: [
        { assetTag: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { serial: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(status && { status: { statusType: status } }),
  };

  const [assets, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      include: {
        model: { include: { manufacturer: true, category: true } },
        status: true,
        assignedTo: true,
        location: true,
        supplier: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.asset.count({ where }),
  ]);

  const serialized = assets.map(a => ({
    id: a.id,
    assetTag: a.assetTag,
    name: a.name,
    serial: a.serial,
    model: a.model?.name ?? null,
    manufacturer: a.model?.manufacturer?.name ?? null,
    category: a.model?.category?.name ?? null,
    status: a.status ? { name: a.status.name, type: a.status.statusType, color: a.status.color } : null,
    assignedTo: a.assignedTo ? `${a.assignedTo.firstName} ${a.assignedTo.lastName}` : null,
    assignedToId: a.assignedToId,
    location: a.location?.name ?? null,
    purchaseDate: a.purchaseDate?.toISOString() ?? null,
    purchaseCost: a.purchaseCost?.toString() ?? null,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <>
      <section className="content-header">
        <h1>Assets <small>Hardware</small></h1>
        <ol className="breadcrumb">
          <li><a href="#">Home</a></li>
          <li className="active">Assets</li>
        </ol>
      </section>

      <section className="content">
        <div className="box box-default">
          <div className="box-header with-border">
            <h3 className="box-title">Asset List</h3>
            <div style={{ float: "right", display: "flex", gap: 6 }}>
              <Link href="/hardware/create" className="btn btn-primary btn-sm">
                <Plus size={14} /> Create
              </Link>
              <button className="btn btn-default btn-sm">
                <Upload size={14} /> Import
              </button>
              <button className="btn btn-default btn-sm">
                <Download size={14} /> Export
              </button>
            </div>
          </div>
          <div className="box-body" style={{ padding: 0 }}>
            <AssetsTable
              assets={serialized}
              total={total}
              page={page}
              perPage={perPage}
              search={search}
              statusFilter={status}
            />
          </div>
        </div>
      </section>
    </>
  );
}
