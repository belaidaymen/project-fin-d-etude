import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const count = await prisma.user.count();
  return NextResponse.json({ needsSetup: count === 0 });
}

export async function POST(req: NextRequest) {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return NextResponse.json({ error: "Setup already completed" }, { status: 400 });
    }

    const body = await req.json();
    const { firstName, lastName, username, email, password, siteName } = body;

    if (!firstName || !lastName || !username || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction(async tx => {
      await tx.user.create({
        data: {
          firstName,
          lastName,
          username,
          email,
          password: hashedPassword,
          isSuperAdmin: true,
          activated: true,
        },
      });

      await tx.setting.create({
        data: {
          siteName: siteName || "Snipe-IT",
        },
      });

      await tx.statuslabel.createMany({
        data: [
          { name: "Ready to Deploy", statusType: "deployable", deployable: true, color: "#337AB7" },
          { name: "Pending", statusType: "pending", pending: true, color: "#f0ad4e" },
          { name: "Archived", statusType: "archived", archived: true, color: "#777777" },
          { name: "Broken / Not Repairable", statusType: "undeployable", color: "#d9534f" },
          { name: "Lost / Stolen", statusType: "undeployable", color: "#d9534f" },
          { name: "Out for Repair", statusType: "undeployable", color: "#f39c12" },
        ],
      });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Setup error:", err);
    return NextResponse.json({ error: err.message || "Setup failed" }, { status: 500 });
  }
}
