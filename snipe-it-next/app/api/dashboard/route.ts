import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    totalAssets, deployedAssets, pendingAssets, archivedAssets,
    totalLicenses, usedLicenseSeats, totalLicenseSeats,
    totalAccessories, totalConsumables, totalComponents, totalUsers,
  ] = await Promise.all([
    prisma.asset.count({ where: { deletedAt: null } }),
    prisma.asset.count({ where: { deletedAt: null, assignedToId: { not: null } } }),
    prisma.asset.count({ where: { deletedAt: null, status: { statusType: "pending" } } }),
    prisma.asset.count({ where: { deletedAt: null, status: { statusType: "archived" } } }),
    prisma.license.count({ where: { deletedAt: null } }),
    prisma.licenseSeat.count({ where: { assigned: true } }),
    prisma.licenseSeat.count(),
    prisma.accessory.count({ where: { deletedAt: null } }),
    prisma.consumable.count({ where: { deletedAt: null } }),
    prisma.component.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null } }),
  ]);

  return NextResponse.json({
    totalAssets, deployedAssets, pendingAssets, archivedAssets,
    undeployedAssets: totalAssets - deployedAssets,
    totalLicenses, usedLicenseSeats, totalLicenseSeats,
    availableLicenseSeats: totalLicenseSeats - usedLicenseSeats,
    totalAccessories, totalConsumables, totalComponents, totalUsers,
  });
}
