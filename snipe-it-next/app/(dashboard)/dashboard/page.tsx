import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [
    totalAssets,
    deployedAssets,
    undeployableAssets,
    pendingAssets,
    archivedAssets,
    totalLicenses,
    availableLicenseSeats,
    totalAccessories,
    totalConsumables,
    totalComponents,
    totalUsers,
    recentActivity,
  ] = await Promise.all([
    prisma.asset.count({ where: { deletedAt: null } }),
    prisma.asset.count({ where: { deletedAt: null, assignedToId: { not: null } } }),
    prisma.asset.count({
      where: { deletedAt: null, status: { statusType: "undeployable" } }
    }),
    prisma.asset.count({
      where: { deletedAt: null, status: { statusType: "pending" } }
    }),
    prisma.asset.count({
      where: { deletedAt: null, status: { statusType: "archived" } }
    }),
    prisma.license.count({ where: { deletedAt: null } }),
    prisma.licenseSeat.count({ where: { assigned: false } }),
    prisma.accessory.count({ where: { deletedAt: null } }),
    prisma.consumable.count({ where: { deletedAt: null } }),
    prisma.component.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null, activated: true } }),
    prisma.actionlog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: true, admin: true, asset: true },
    }),
  ]);

  const assetsByModel = await prisma.assetModel.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { assets: true } }, manufacturer: true },
    orderBy: { assets: { _count: "desc" } },
    take: 10,
  });

  const assetsByCategory = await prisma.category.findMany({
    where: { deletedAt: null, categoryType: "asset" },
    include: { _count: { select: { assetModels: true } } },
    take: 10,
  });

  return (
    <DashboardClient
      stats={{
        totalAssets,
        deployedAssets,
        undeployableAssets,
        pendingAssets,
        archivedAssets,
        totalLicenses,
        availableLicenseSeats,
        totalAccessories,
        totalConsumables,
        totalComponents,
        totalUsers,
      }}
      recentActivity={recentActivity.map(a => ({
        id: a.id,
        actionType: a.actionType,
        note: a.note,
        createdAt: a.createdAt.toISOString(),
        user: a.user ? `${a.user.firstName} ${a.user.lastName}` : null,
        admin: a.admin ? `${a.admin.firstName} ${a.admin.lastName}` : null,
        assetTag: a.asset?.assetTag ?? null,
      }))}
      assetsByModel={assetsByModel.map(m => ({ name: m.name, count: m._count.assets }))}
      assetsByCategory={assetsByCategory.map(c => ({ name: c.name, count: c._count.assetModels }))}
    />
  );
}
