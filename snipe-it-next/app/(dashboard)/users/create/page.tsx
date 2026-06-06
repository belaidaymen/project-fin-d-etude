import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import UserForm from "../UserForm";

export default async function CreateUserPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const locations = await prisma.location.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });

  return (
    <>
      <section className="content-header">
        <h1>Créer un utilisateur</h1>
        <ol className="breadcrumb">
          <li><a href="/users">Utilisateurs</a></li>
          <li className="active">Créer</li>
        </ol>
      </section>
      <section className="content">
        <UserForm
          locations={locations.map(l => ({ id: l.id, name: l.name }))}
        />
      </section>
    </>
  );
}
