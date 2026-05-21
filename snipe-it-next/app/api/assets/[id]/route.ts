import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const asset = await prisma.asset.findFirst({
    where: { id: params.id, deletedAt: null },
    include: { model: { include: { manufacturer: true } }, status: true, assignedTo: true, location: true, supplier: true },
  });

  if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  return NextResponse.json(asset);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { assetTag, name, serial, modelId, statusId, supplierId, locationId, companyId,
      purchaseDate, purchaseCost, orderNumber, warrantyMonths, notes, requestable } = body;

    const asset = await prisma.asset.update({
      where: { id: params.id },
      data: {
        assetTag,
        name: name || null,
        serial: serial || null,
        modelId: modelId || null,
        statusId: statusId || null,
        supplierId: supplierId || null,
        locationId: locationId || null,
        companyId: companyId || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchaseCost: purchaseCost ? parseFloat(purchaseCost) : null,
        orderNumber: orderNumber || null,
        warrantyMonths: warrantyMonths ? parseInt(warrantyMonths) : null,
        notes: notes || null,
        requestable: requestable ?? false,
      },
    });

    return NextResponse.json(asset);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.asset.update({ where: { id: params.id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
