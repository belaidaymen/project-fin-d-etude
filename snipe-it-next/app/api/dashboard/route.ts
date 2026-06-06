import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    totalAssets, totalUsers, totalLocations, totalCategories,
    totalMovements, totalDemandes, pendingDemandes,
    assetsByStatus,
  ] = await Promise.all([
    prisma.asset.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.location.count({ where: { deletedAt: null } }),
    prisma.category.count({ where: { deletedAt: null } }),
    prisma.equipmentMovement.count(),
    prisma.equipmentRequest.count(),
    prisma.equipmentRequest.count({ where: { status: "EN_ATTENTE" } }),
    prisma.statuslabel.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { assets: { where: { deletedAt: null } } } } },
    }),
  ]);

  return NextResponse.json({
    totalAssets, totalUsers, totalLocations, totalCategories,
    totalMovements, totalDemandes, pendingDemandes,
    assetsByStatus: assetsByStatus.map(s => ({
      id: s.id, name: s.name, color: s.color, count: s._count.assets,
    })),
  });
}
