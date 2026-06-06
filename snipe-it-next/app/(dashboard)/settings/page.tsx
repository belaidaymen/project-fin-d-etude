import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  let settings = await prisma.setting.findFirst();
  if (!settings) {
    settings = await prisma.setting.create({ data: {} });
  }

  return (
    <>
      <section className="content-header">
        <h1>Paramètres <small>Configuration du site</small></h1>
        <ol className="breadcrumb">
          <li><a href="#">Accueil</a></li>
          <li className="active">Paramètres</li>
        </ol>
      </section>
      <section className="content">
        <SettingsClient settings={{
          id: settings.id,
          siteName: settings.siteName,
        }} />
      </section>
    </>
  );
}
