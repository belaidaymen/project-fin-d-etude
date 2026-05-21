import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const where: any = {
    deletedAt: null,
    ...(search && { OR: [{ firstName: { contains: search, mode: "insensitive" } }, { lastName: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] }),
  };
  const users = await prisma.user.findMany({ where, include: { company: true, location: true, department: true }, orderBy: [{ firstName: "asc" }] });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { firstName, lastName, username, email, password, employeeNum, jobTitle, phone, mobile,
      address, city, state, country, zip, notes, activated, isSuperAdmin, companyId, locationId, departmentId, managerId } = body;

    if (!firstName || !lastName || !username || !email || !password) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } });
    if (existing) return NextResponse.json({ error: "Username or email already exists" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        firstName, lastName, username, email, password: hashedPassword,
        employeeNum: employeeNum || null, jobTitle: jobTitle || null, phone: phone || null,
        mobile: mobile || null, address: address || null, city: city || null, state: state || null,
        country: country || null, zip: zip || null, notes: notes || null,
        activated: activated ?? true, isSuperAdmin: isSuperAdmin ?? false,
        companyId: companyId || null, locationId: locationId || null,
        departmentId: departmentId || null, managerId: managerId || null,
      },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
