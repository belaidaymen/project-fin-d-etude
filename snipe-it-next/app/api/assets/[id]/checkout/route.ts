import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { locationId, statusId, note } = body;

    const asset = await prisma.asset.findFirst({ where: { id: params.id, deletedAt: null } });
    if (!asset) return NextResponse.json({ error: "Équipement introuvable" }, { status: 404 });

    const updated = await prisma.$transaction(async tx => {
      const updatedAsset = await tx.asset.update({
        where: { id: params.id },
        data: {
          locationId: locationId || asset.locationId,
          statusId: statusId || asset.statusId,
        },
      });

      await tx.actionlog.create({
        data: {
          actionType: "checkout",
          assetId: params.id,
          note: note || null,
        },
      });

      return updatedAsset;
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
