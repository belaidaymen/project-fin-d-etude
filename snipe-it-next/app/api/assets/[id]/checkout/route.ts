import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { checkoutType, userId, locationId, expectedCheckin, note } = body;

    const asset = await prisma.asset.findFirst({ where: { id: params.id, deletedAt: null } });
    if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    if (asset.assignedToId) return NextResponse.json({ error: "Asset is already checked out" }, { status: 400 });

    const adminId = (session.user as any).id;

    const updated = await prisma.$transaction(async tx => {
      const updatedAsset = await tx.asset.update({
        where: { id: params.id },
        data: {
          assignedToId: checkoutType === "user" ? userId : null,
          locationId: checkoutType === "location" ? locationId : asset.locationId,
          lastCheckout: new Date(),
          expectedCheckin: expectedCheckin ? new Date(expectedCheckin) : null,
        },
      });

      await tx.actionlog.create({
        data: {
          actionType: "checkout",
          assetId: params.id,
          userId: checkoutType === "user" ? userId : null,
          adminId,
          note: note || null,
          targetType: checkoutType,
          targetId: checkoutType === "user" ? userId : locationId,
        },
      });

      return updatedAsset;
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
