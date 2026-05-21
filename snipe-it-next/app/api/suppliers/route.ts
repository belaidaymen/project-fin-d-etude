import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.supplier.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    if (!body.name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const item = await prisma.supplier.create({ data: { name: body.name, address: body.address ?? null, city: body.city ?? null, state: body.state ?? null, country: body.country ?? null, zip: body.zip ?? null, phone: body.phone ?? null, fax: body.fax ?? null, email: body.email ?? null, contact: body.contact ?? null, url: body.url ?? null, notes: body.notes ?? null } });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
