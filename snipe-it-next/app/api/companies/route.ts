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
    ...(search && { name: { contains: search, mode: "insensitive" } }),
  };

  const [items, total] = await Promise.all([
    prisma.company.findMany({ where, orderBy: { name: "asc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.company.count({ where }),
  ]);

  return NextResponse.json({ total, rows: items });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, phone, fax, email, image, notes } = body;
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const item = await prisma.company.create({
      data: { name, phone: phone || null, fax: fax || null, email: email || null, image: image || null, notes: notes || null },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
