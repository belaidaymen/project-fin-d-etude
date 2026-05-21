import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.maintenance.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { title, maintenanceType, startDate, completionDate, cost, supplierId, notes, isWarranty } = body;
    const item = await prisma.maintenance.update({
      where: { id: params.id },
      data: {
        title,
        maintenanceType: maintenanceType || "Maintenance",
        startDate: new Date(startDate),
        completionDate: completionDate ? new Date(completionDate) : null,
        cost: cost ? parseFloat(cost) : null,
        supplierId: supplierId || null,
        notes: notes || null,
        isWarranty: isWarranty ?? false,
      },
    });
    return NextResponse.json(item);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
