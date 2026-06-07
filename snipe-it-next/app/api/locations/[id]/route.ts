import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const item = await prisma.location.update({ where: { id: id }, data: { name: body.name, address: body.address ?? null, city: body.city ?? null, state: body.state ?? null, country: body.country ?? null, zip: body.zip ?? null, phone: body.phone ?? null, parentId: body.parentId ?? null } });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.location.update({ where: { id: id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
