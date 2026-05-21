import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import CheckinForm from "./CheckinForm";
import Link from "next/link";

export default async function CheckinPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [asset, statuses, locations] = await Promise.all([
    prisma.asset.findFirst({
      where: { id: params.id, deletedAt: null },
      include: { status: true, model: true, assignedTo: true },
    }),
    prisma.statuslabel.findMany({ where: { deletedAt: null, deployable: true }, orderBy: { name: "asc" } }),
    prisma.location.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);

  if (!asset) notFound();
  if (!asset.assignedToId) redirect(`/hardware/${params.id}`);

  return (
    <>
      <section className="content-header">
        <h1>Check In Asset <small>{asset.assetTag}</small></h1>
        <ol className="breadcrumb">
          <li><Link href="/hardware">Assets</Link></li>
          <li><Link href={`/hardware/${asset.id}`}>{asset.assetTag}</Link></li>
          <li className="active">Check In</li>
        </ol>
      </section>
      <section className="content">
        <CheckinForm
          assetId={asset.id}
          assetTag={asset.assetTag}
          assignedTo={asset.assignedTo ? `${asset.assignedTo.firstName} ${asset.assignedTo.lastName}` : null}
          statuses={statuses.map(s => ({ id: s.id, name: s.name }))}
          locations={locations.map(l => ({ id: l.id, name: l.name }))}
        />
      </section>
    </>
  );
}
