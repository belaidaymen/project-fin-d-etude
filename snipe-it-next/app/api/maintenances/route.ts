import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const perPage = parseInt(searchParams.get("perPage") ?? "20");

  const where: any = search ? {
    OR: [
      { title: { contains: search, mode: "insensitive" } },
      { asset: { assetTag: { contains: search, mode: "insensitive" } } },
    ],
  } : {};

  const [items, total] = await Promise.all([
    prisma.maintenance.findMany({
      where,
      include: { asset: true, supplier: true },
      orderBy: { startDate: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.maintenance.count({ where }),
  ]);

  return NextResponse.json({ total, rows: items });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { assetId, title, maintenanceType, startDate, completionDate, cost, supplierId, notes, isWarranty } = body;

    if (!assetId) return NextResponse.json({ error: "Asset is required" }, { status: 400 });
    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    if (!startDate) return NextResponse.json({ error: "Start date is required" }, { status: 400 });

    const item = await prisma.maintenance.create({
      data: {
        assetId,
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
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
