import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import UserForm from "../../UserForm";
import Link from "next/link";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [user, locations] = await Promise.all([
    prisma.user.findFirst({ where: { id: id, deletedAt: null } }),
    prisma.location.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);

  if (!user) notFound();

  return (
    <>
      <section className="content-header">
        <h1>Modifier l'utilisateur <small>{user.username}</small></h1>
        <ol className="breadcrumb">
          <li><Link href="/users">Utilisateurs</Link></li>
          <li><Link href={`/users/${user.id}`}>{user.firstName} {user.lastName}</Link></li>
          <li className="active">Modifier</li>
        </ol>
      </section>
      <section className="content">
        <UserForm
          user={{
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            role: user.role,
            jobTitle: user.jobTitle,
            phone: user.phone,
            activated: user.activated,
            laboratoireId: user.laboratoireId,
          }}
          locations={locations.map(l => ({ id: l.id, name: l.name }))}
        />
      </section>
    </>
  );
}
