import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  return NextResponse.json(await prisma.manufacturer.update({ where: { id: id }, data: { name: body.name, url: body.url ?? null, supportUrl: body.supportUrl ?? null, supportPhone: body.supportPhone ?? null, supportEmail: body.supportEmail ?? null, notes: body.notes ?? null } }));
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.manufacturer.update({ where: { id: id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
