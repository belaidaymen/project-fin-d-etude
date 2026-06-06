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

  const where: any = {
    deletedAt: null,
    ...(search && {
      OR: [
        { assetTag: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { serial: { contains: search, mode: "insensitive" } },
        { reference: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [assets, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      include: { category: true, status: true, location: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.asset.count({ where }),
  ]);

  return NextResponse.json({ total, rows: assets });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { assetTag, name, serial, reference, categoryId, statusId, locationId,
      purchaseDate, purchaseCost, notes, quantity } = body;

    if (!assetTag) return NextResponse.json({ error: "L'étiquette d'équipement est requise" }, { status: 400 });

    const existing = await prisma.asset.findFirst({ where: { assetTag } });
    if (existing) return NextResponse.json({ error: "Cette étiquette existe déjà" }, { status: 400 });

    const asset = await prisma.asset.create({
      data: {
        assetTag,
        name: name || null,
        serial: serial || null,
        reference: reference || null,
        categoryId: categoryId || null,
        statusId: statusId || null,
        locationId: locationId || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchaseCost: purchaseCost ? parseFloat(purchaseCost) : null,
        notes: notes || null,
        quantity: quantity ? parseInt(quantity) : 1,
      },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
