import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.statuslabel.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    if (!body.name || !body.statusType) return NextResponse.json({ error: "Name and type required" }, { status: 400 });
    const deployable = body.statusType === "deployable";
    const pending = body.statusType === "pending";
    const archived = body.statusType === "archived";
    const item = await prisma.statuslabel.create({ data: { name: body.name, statusType: body.statusType, deployable, pending, archived, notes: body.notes ?? null, color: body.color ?? null, showInNav: body.showInNav ?? true } });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
