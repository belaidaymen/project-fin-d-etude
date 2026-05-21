import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findFirst({ where: { id: params.id, deletedAt: null }, include: { company: true, location: true, department: true, manager: true, assets: { include: { model: true, status: true } } } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { password: _, ...safeUser } = user;
  return NextResponse.json(safeUser);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { password, ...rest } = body;
    const updateData: any = {
      firstName: rest.firstName, lastName: rest.lastName, username: rest.username, email: rest.email,
      employeeNum: rest.employeeNum || null, jobTitle: rest.jobTitle || null, phone: rest.phone || null,
      mobile: rest.mobile || null, address: rest.address || null, city: rest.city || null,
      state: rest.state || null, country: rest.country || null, zip: rest.zip || null,
      notes: rest.notes || null, activated: rest.activated ?? true, isSuperAdmin: rest.isSuperAdmin ?? false,
      companyId: rest.companyId || null, locationId: rest.locationId || null,
      departmentId: rest.departmentId || null, managerId: rest.managerId || null,
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
