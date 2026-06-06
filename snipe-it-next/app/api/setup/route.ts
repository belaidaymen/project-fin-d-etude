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
          role: "LOGISTIQUE",
          activated: true,
        },
      });

      await tx.setting.create({
        data: { siteName: siteName || "GestActif" },
      });

      await tx.statuslabel.createMany({
        data: [
          { name: "Disponible", color: "#00a65a" },
          { name: "En service", color: "#3c8dbc" },
          { name: "En maintenance", color: "#f0ad4e" },
          { name: "Hors service", color: "#d9534f" },
          { name: "Réservé", color: "#9b59b6" },
          { name: "En prêt", color: "#00c0ef" },
        ],
      });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Setup error:", err);
    return NextResponse.json({ error: err.message || "Setup failed" }, { status: 500 });
  }
}
