import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create default admin user
  const hashedPassword = await bcrypt.hash("password", 10);
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      firstName: "Admin",
      lastName: "User",
      username: "admin",
      email: "admin@example.com",
      password: hashedPassword,
      isSuperUser: true,
      isAdmin: true,
      activated: true,
    },
  });
  console.log(`Admin user created: ${admin.username} (password: password)`);

  // Status Labels
  const statuses = [
    { name: "Ready to Deploy", type: "deployable", color: "#28a745", defaultLabel: true },
    { name: "Deployed", type: "deployable", color: "#007bff" },
    { name: "Out for Repair", type: "undeployable", color: "#fd7e14" },
    { name: "Lost/Stolen", type: "undeployable", color: "#dc3545" },
    { name: "Archived", type: "archived", color: "#6c757d" },
    { name: "Pending", type: "pending", color: "#ffc107" },
  ];

  for (const s of statuses) {
    await prisma.statusLabel.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
  }
  console.log("Status labels created");

  // Categories
  const categories = [
    { name: "Laptops", type: "asset" },
    { name: "Desktops", type: "asset" },
    { name: "Monitors", type: "asset" },
    { name: "Servers", type: "asset" },
    { name: "Networking", type: "asset" },
    { name: "Mobile Devices", type: "asset" },
    { name: "Software", type: "license" },
    { name: "Keyboards & Mice", type: "accessory" },
    { name: "Cables & Adapters", type: "accessory" },
    { name: "Toner & Ink", type: "consumable" },
    { name: "RAM", type: "component" },
    { name: "Storage", type: "component" },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { name: c.name, deletedAt: null } as any,
      update: {},
      create: c,
    });
  }
  console.log("Categories created");

  // Manufacturers
  const manufacturers = [
    { name: "Apple" }, { name: "Dell" }, { name: "HP" }, { name: "Lenovo" },
    { name: "Microsoft" }, { name: "Samsung" }, { name: "Cisco" }, { name: "LG" },
    { name: "ASUS" }, { name: "Acer" }, { name: "Sony" }, { name: "Logitech" },
  ];

  for (const m of manufacturers) {
    await prisma.manufacturer.upsert({
      where: { name: m.name },
      update: {},
      create: m,
    });
  }
  console.log("Manufacturers created");

  // Locations
  const hq = await prisma.location.upsert({
    where: { id: 1 },
    update: {},
    create: { name: "Headquarters", address: "123 Main St", city: "San Francisco", state: "CA", country: "US" },
  });

  await prisma.location.upsert({
    where: { id: 2 },
    update: {},
    create: { name: "Remote", city: "Various", country: "US" },
  });
  console.log("Locations created");

  // Company
  const company = await prisma.company.upsert({
    where: { name: "Acme Corporation" },
    update: {},
    create: { name: "Acme Corporation", email: "it@acme.com" },
  });
  console.log("Company created");

  // Department
  await prisma.department.upsert({
    where: { id: 1 },
    update: {},
    create: { name: "IT", companyId: company.id },
  });
  await prisma.department.upsert({
    where: { id: 2 },
    update: {},
    create: { name: "Engineering", companyId: company.id },
  });
  console.log("Departments created");

  // Asset models
  const apple = await prisma.manufacturer.findFirst({ where: { name: "Apple" } });
  const dell = await prisma.manufacturer.findFirst({ where: { name: "Dell" } });
  const laptopCat = await prisma.category.findFirst({ where: { name: "Laptops" } });
  const desktopCat = await prisma.category.findFirst({ where: { name: "Desktops" } });

  await prisma.assetModel.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'MacBook Pro 14"', modelNumber: "MKGP3LL/A", manufacturerId: apple?.id, categoryId: laptopCat?.id, eol: 36 },
  });
  await prisma.assetModel.upsert({
    where: { id: 2 },
    update: {},
    create: { name: "Dell XPS 15", modelNumber: "XPS-9500", manufacturerId: dell?.id, categoryId: laptopCat?.id, eol: 48 },
  });
  await prisma.assetModel.upsert({
    where: { id: 3 },
    update: {},
    create: { name: 'iMac 27"', modelNumber: "MXWU2LL/A", manufacturerId: apple?.id, categoryId: desktopCat?.id, eol: 60 },
  });
  console.log("Asset models created");

  // Sample assets
  const readyStatus = await prisma.statusLabel.findFirst({ where: { type: "deployable", defaultLabel: true } });
  const deployedStatus = await prisma.statusLabel.findFirst({ where: { name: "Deployed" } });
  const mbp = await prisma.assetModel.findFirst({ where: { name: { contains: "MacBook" } } });

  for (let i = 1; i <= 5; i++) {
    await prisma.asset.upsert({
      where: { assetTag: `ASSET-${String(i).padStart(4, "0")}` },
      update: {},
      create: {
        assetTag: `ASSET-${String(i).padStart(4, "0")}`,
        name: `MacBook Pro #${i}`,
        serial: `SN${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        modelId: mbp?.id,
        statusId: i <= 2 ? deployedStatus?.id : readyStatus?.id,
        companyId: company.id,
        locationId: hq.id,
        rtdLocationId: hq.id,
        purchaseCost: 2499.00,
        purchaseDate: new Date(2023, i, 1),
        createdById: admin.id,
      },
    });
  }
  console.log("Sample assets created");

  // Sample accessory
  const kbCat = await prisma.category.findFirst({ where: { name: "Keyboards & Mice" } });
  const logi = await prisma.manufacturer.findFirst({ where: { name: "Logitech" } });
  await prisma.accessory.upsert({
    where: { id: 1 },
    update: {},
    create: { name: "MX Keys Keyboard", qty: 10, minAmt: 2, categoryId: kbCat?.id, manufacturerId: logi?.id, purchaseCost: 109.99 },
  });
  console.log("Sample accessories created");

  // Log setup action
  await prisma.actionLog.create({
    data: { action: "create", userId: admin.id, note: "Database seeded", actionDate: new Date() },
  });

  console.log("Seeding complete!");
  console.log("\nDefault credentials:");
  console.log("  Username: admin");
  console.log("  Password: password");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
