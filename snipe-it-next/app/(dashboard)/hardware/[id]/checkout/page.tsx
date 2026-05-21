import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import CheckoutForm from "./CheckoutForm";
import Link from "next/link";

export default async function CheckoutPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [asset, users, locations] = await Promise.all([
    prisma.asset.findFirst({
      where: { id: params.id, deletedAt: null },
      include: { status: true, model: true },
    }),
    prisma.user.findMany({ where: { deletedAt: null, activated: true }, orderBy: [{ firstName: "asc" }] }),
    prisma.location.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);

  if (!asset) notFound();
  if (asset.assignedToId) redirect(`/hardware/${params.id}`);

  return (
    <>
      <section className="content-header">
        <h1>Check Out Asset <small>{asset.assetTag}</small></h1>
        <ol className="breadcrumb">
          <li><Link href="/hardware">Assets</Link></li>
          <li><Link href={`/hardware/${asset.id}`}>{asset.assetTag}</Link></li>
          <li className="active">Check Out</li>
        </ol>
      </section>
      <section className="content">
        <CheckoutForm
          assetId={asset.id}
          assetTag={asset.assetTag}
          users={users.map(u => ({ id: u.id, name: `${u.firstName} ${u.lastName}`, email: u.email }))}
          locations={locations.map(l => ({ id: l.id, name: l.name }))}
        />
      </section>
    </>
  );
}
