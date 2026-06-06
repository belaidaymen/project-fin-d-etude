import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findFirst({
    where: { id: params.id, deletedAt: null },
    include: { laboratoire: true },
  });
  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const { password: _, ...safeUser } = user;
  return NextResponse.json(safeUser);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { password, firstName, lastName, username, email, role, jobTitle, phone, activated, laboratoireId } = body;

    const updateData: any = {
      firstName,
      lastName,
      username,
      email,
      role: role ?? "LOGISTIQUE",
      jobTitle: jobTitle || null,
      phone: phone || null,
      activated: activated ?? true,
      laboratoireId: laboratoireId || null,
    };
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({ where: { id: params.id }, data: updateData });
    return NextResponse.json(user);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.user.update({ where: { id: params.id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
