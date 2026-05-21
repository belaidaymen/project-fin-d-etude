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
      return NextResponse.json({ error: "Configuration déjà effectuée." }, { status: 400 });
    }
    const { prenom, nom, username, email, password, siteName } = await req.json();
    if (!prenom || !nom || !username || !email || !password) {
      return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
    }
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { prenom, nom, username, email, password: hashed, role: "ADMIN", actif: true },
    });
    await prisma.setting.create({
      data: { siteName: siteName || "GestActifs", siteSubtitle: "Gestion des Actifs Universitaires", primaryColor: "#3c8dbc", currency: "DZD", timezone: "Africa/Algiers" },
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
