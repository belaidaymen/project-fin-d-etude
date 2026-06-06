import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import UserForm from "../users/UserForm";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = (session.user as any).id;
  const [user, locations] = await Promise.all([
    prisma.user.findFirst({ where: { id: userId } }),
    prisma.location.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);

  if (!user) redirect("/login");

  return (
    <>
      <section className="content-header">
        <h1>Mon profil</h1>
        <ol className="breadcrumb"><li><a href="/dashboard">Accueil</a></li><li className="active">Profil</li></ol>
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
