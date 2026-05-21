import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let settings = await prisma.setting.findFirst();
  if (!settings) settings = await prisma.setting.create({ data: {} });
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    let settings = await prisma.setting.findFirst();
    if (!settings) settings = await prisma.setting.create({ data: body });
    else settings = await prisma.setting.update({ where: { id: settings.id }, data: body });
    return NextResponse.json(settings);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
