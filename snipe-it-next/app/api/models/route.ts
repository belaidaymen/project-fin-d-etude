import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.assetModel.findMany({ where: { deletedAt: null }, include: { manufacturer: true, category: true }, orderBy: { name: "asc" } }));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    if (!body.name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const item = await prisma.assetModel.create({ data: { name: body.name, modelNumber: body.modelNumber ?? null, notes: body.notes ?? null, requestable: body.requestable ?? false, requireSerial: body.requireSerial ?? false, minAmt: body.minAmt ?? null, eol: body.eol ?? null, manufacturerId: body.manufacturerId ?? null, categoryId: body.categoryId ?? null, depreciationId: body.depreciationId ?? null } });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
