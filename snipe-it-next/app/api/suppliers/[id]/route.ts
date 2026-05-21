import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  return NextResponse.json(await prisma.supplier.update({ where: { id: params.id }, data: { name: body.name, address: body.address ?? null, city: body.city ?? null, state: body.state ?? null, country: body.country ?? null, zip: body.zip ?? null, phone: body.phone ?? null, email: body.email ?? null, contact: body.contact ?? null, url: body.url ?? null, notes: body.notes ?? null } }));
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.supplier.update({ where: { id: params.id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
