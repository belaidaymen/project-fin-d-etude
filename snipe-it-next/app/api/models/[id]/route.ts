import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  return NextResponse.json(await prisma.assetModel.update({ where: { id: params.id }, data: { name: body.name, modelNumber: body.modelNumber ?? null, notes: body.notes ?? null, requestable: body.requestable ?? false, requireSerial: body.requireSerial ?? false, eol: body.eol ?? null, manufacturerId: body.manufacturerId ?? null, categoryId: body.categoryId ?? null } }));
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.assetModel.update({ where: { id: params.id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
