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
        <h1>Settings <small>Site Configuration</small></h1>
        <ol className="breadcrumb">
          <li><a href="#">Home</a></li>
          <li className="active">Settings</li>
        </ol>
      </section>
      <section className="content">
        <SettingsClient settings={{
          id: settings.id,
          siteName: settings.siteName,
          headerColor: settings.headerColor,
          currency: settings.currency,
          perPage: settings.perPage,
          dateDisplayFormat: settings.dateDisplayFormat,
          defaultLocale: settings.defaultLocale,
          defaultTimezone: settings.defaultTimezone,
          loginNote: settings.loginNote,
          adminCc: settings.adminCc,
          alertEmail: settings.alertEmail,
          alertQty: settings.alertQty,
          dashboardMessage: settings.dashboardMessage,
        }} />
      </section>
    </>
  );
}
