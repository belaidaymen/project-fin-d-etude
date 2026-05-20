import { query, queryOne, queryCount } from "@/lib/db";

// ---- Dashboard ----
export async function getDashboardStats() {
  const [
    totalAssets, deployedAssets, availableAssets,
    totalUsers, totalLicenses, totalAccessories,
    totalConsumables, totalComponents,
    recentActivity, lowStockAccessories,
  ] = await Promise.all([
    queryCount(`SELECT COUNT(*) FROM "Asset" WHERE "deletedAt" IS NULL`),
    queryCount(`SELECT COUNT(*) FROM "Asset" WHERE "deletedAt" IS NULL AND "assignedToId" IS NOT NULL`),
    queryCount(`SELECT COUNT(*) FROM "Asset" a LEFT JOIN "StatusLabel" s ON s.id = a."statusId" WHERE a."deletedAt" IS NULL AND a."assignedToId" IS NULL AND s.type = 'deployable'`),
    queryCount(`SELECT COUNT(*) FROM "User" WHERE "deletedAt" IS NULL AND activated = true`),
    queryCount(`SELECT COUNT(*) FROM "License" WHERE "deletedAt" IS NULL`),
    queryCount(`SELECT COUNT(*) FROM "Accessory" WHERE "deletedAt" IS NULL`),
    queryCount(`SELECT COUNT(*) FROM "Consumable" WHERE "deletedAt" IS NULL`),
    queryCount(`SELECT COUNT(*) FROM "Component" WHERE "deletedAt" IS NULL`),
    query(`
      SELECT al.*, 
        u."firstName", u."lastName",
        a."assetTag", a.name as "assetName"
      FROM "ActionLog" al
      LEFT JOIN "User" u ON u.id = al."userId"
      LEFT JOIN "Asset" a ON a.id = al."assetId"
      ORDER BY al."actionDate" DESC LIMIT 15
    `),
    query(`SELECT id, name, qty, "minAmt" FROM "Accessory" WHERE "deletedAt" IS NULL AND "minAmt" IS NOT NULL AND qty <= "minAmt"`),
  ]);

  const formattedActivity = recentActivity.map((r: any) => ({
    id: r.id,
    action: r.action,
    note: r.note,
    actionDate: r.actionDate,
    user: r.firstName ? { firstName: r.firstName, lastName: r.lastName } : null,
    asset: r.assetTag ? { assetTag: r.assetTag, name: r.assetName } : null,
  }));

  return {
    totalAssets, deployedAssets, availableAssets,
    totalUsers, totalLicenses, totalAccessories,
    totalConsumables, totalComponents,
    recentActivity: formattedActivity,
    lowStockAccessories,
  };
}

// ---- Assets ----
export async function getAssets(params: {
  search?: string; page?: number; perPage?: number;
  statusId?: number; modelId?: number; companyId?: number; locationId?: number;
}) {
  const { search = "", page = 1, perPage = 25, statusId, modelId, companyId, locationId } = params;
  const offset = (page - 1) * perPage;
  const conditions = [`a."deletedAt" IS NULL`];
  const vals: any[] = [];
  let i = 1;

  if (statusId) { conditions.push(`a."statusId" = $${i++}`); vals.push(statusId); }
  if (modelId) { conditions.push(`a."modelId" = $${i++}`); vals.push(modelId); }
  if (companyId) { conditions.push(`a."companyId" = $${i++}`); vals.push(companyId); }
  if (locationId) { conditions.push(`a."locationId" = $${i++}`); vals.push(locationId); }
  if (search) {
    conditions.push(`(a."assetTag" ILIKE $${i} OR a.name ILIKE $${i} OR a.serial ILIKE $${i} OR am.name ILIKE $${i})`);
    vals.push(`%${search}%`); i++;
  }

  const where = conditions.join(" AND ");

  const [assets, countRes] = await Promise.all([
    query(`
      SELECT a.*, am.name as "modelName", cat.name as "categoryName",
        s.name as "statusName", s.type as "statusType", s.color as "statusColor",
        co.name as "companyName", loc.name as "locationName",
        u."firstName" as "assignedFirstName", u."lastName" as "assignedLastName"
      FROM "Asset" a
      LEFT JOIN "AssetModel" am ON am.id = a."modelId"
      LEFT JOIN "Category" cat ON cat.id = am."categoryId"
      LEFT JOIN "StatusLabel" s ON s.id = a."statusId"
      LEFT JOIN "Company" co ON co.id = a."companyId"
      LEFT JOIN "Location" loc ON loc.id = a."locationId"
      LEFT JOIN "User" u ON u.id = a."assignedToId" AND a."assignedToType" = 'user'
      WHERE ${where}
      ORDER BY a."createdAt" DESC
      LIMIT $${i} OFFSET $${i + 1}
    `, [...vals, perPage, offset]),
    query(`
      SELECT COUNT(*) as count FROM "Asset" a
      LEFT JOIN "AssetModel" am ON am.id = a."modelId"
      WHERE ${where}
    `, vals),
  ]);

  const total = parseInt(countRes[0]?.count ?? "0", 10);

  const formatted = assets.map((r: any) => ({
    ...r,
    model: r.modelName ? { name: r.modelName, category: { name: r.categoryName } } : null,
    status: r.statusName ? { name: r.statusName, type: r.statusType, color: r.statusColor } : null,
    company: r.companyName ? { name: r.companyName } : null,
    location: r.locationName ? { name: r.locationName } : null,
    assignedUser: r.assignedFirstName ? { firstName: r.assignedFirstName, lastName: r.assignedLastName } : null,
  }));

  return { assets: formatted, total };
}

export async function getAsset(id: number) {
  const [asset] = await Promise.all([
    queryOne(`
      SELECT a.*,
        am.name as "modelName", am."modelNumber", am.eol as "modelEol",
        cat.id as "categoryId_m", cat.name as "categoryName",
        mfr.name as "manufacturerName",
        s.id as "statusId_r", s.name as "statusName", s.type as "statusType", s.color as "statusColor",
        co.id as "companyId_r", co.name as "companyName",
        loc.id as "locationId_r", loc.name as "locationName",
        rtd.id as "rtdLocationId_r", rtd.name as "rtdLocationName",
        sup.id as "supplierId_r", sup.name as "supplierName",
        u.id as "assignedUserId", u."firstName" as "assignedFirstName",
        u."lastName" as "assignedLastName", u.email as "assignedEmail", u.username as "assignedUsername"
      FROM "Asset" a
      LEFT JOIN "AssetModel" am ON am.id = a."modelId"
      LEFT JOIN "Category" cat ON cat.id = am."categoryId"
      LEFT JOIN "Manufacturer" mfr ON mfr.id = am."manufacturerId"
      LEFT JOIN "StatusLabel" s ON s.id = a."statusId"
      LEFT JOIN "Company" co ON co.id = a."companyId"
      LEFT JOIN "Location" loc ON loc.id = a."locationId"
      LEFT JOIN "Location" rtd ON rtd.id = a."rtdLocationId"
      LEFT JOIN "Supplier" sup ON sup.id = a."supplierId"
      LEFT JOIN "User" u ON u.id = a."assignedToId" AND a."assignedToType" = 'user'
      WHERE a.id = $1 AND a."deletedAt" IS NULL
    `, [id]),
  ]);

  if (!asset) return null;

  const [maintenances, actionLogs] = await Promise.all([
    query(`SELECT * FROM "Maintenance" WHERE "assetId" = $1 ORDER BY "startDate" DESC`, [id]),
    query(`
      SELECT al.*, u."firstName", u."lastName"
      FROM "ActionLog" al
      LEFT JOIN "User" u ON u.id = al."userId"
      WHERE al."assetId" = $1
      ORDER BY al."actionDate" DESC LIMIT 20
    `, [id]),
  ]);

  return {
    ...asset,
    model: asset.modelName ? {
      name: asset.modelName, modelNumber: asset.modelNumber, eol: asset.modelEol,
      category: { name: asset.categoryName },
      manufacturer: { name: asset.manufacturerName },
    } : null,
    status: asset.statusName ? { name: asset.statusName, type: asset.statusType, color: asset.statusColor } : null,
    company: asset.companyName ? { name: asset.companyName } : null,
    location: asset.locationName ? { name: asset.locationName } : null,
    rtdLocation: asset.rtdLocationName ? { name: asset.rtdLocationName } : null,
    supplier: asset.supplierName ? { name: asset.supplierName } : null,
    assignedUser: asset.assignedUserId ? {
      id: asset.assignedUserId, firstName: asset.assignedFirstName,
      lastName: asset.assignedLastName, email: asset.assignedEmail, username: asset.assignedUsername,
    } : null,
    maintenances,
    actionLogs: actionLogs.map((l: any) => ({
      ...l,
      user: l.firstName ? { firstName: l.firstName, lastName: l.lastName } : null,
    })),
  };
}

// ---- Users ----
export async function getUsers(params: { search?: string; page?: number; perPage?: number }) {
  const { search = "", page = 1, perPage = 25 } = params;
  const offset = (page - 1) * perPage;
  const conditions = [`u."deletedAt" IS NULL`];
  const vals: any[] = [];
  let i = 1;

  if (search) {
    conditions.push(`(u."firstName" ILIKE $${i} OR u."lastName" ILIKE $${i} OR u.username ILIKE $${i} OR u.email ILIKE $${i} OR u."employeeNum" ILIKE $${i})`);
    vals.push(`%${search}%`); i++;
  }
  const where = conditions.join(" AND ");

  const [users, countRes] = await Promise.all([
    query(`
      SELECT u.*, co.name as "companyName", d.name as "departmentName", loc.name as "locationName",
        (SELECT COUNT(*) FROM "Asset" a WHERE a."assignedToId" = u.id AND a."assignedToType" = 'user' AND a."deletedAt" IS NULL) as "assetCount"
      FROM "User" u
      LEFT JOIN "Company" co ON co.id = u."companyId"
      LEFT JOIN "Department" d ON d.id = u."departmentId"
      LEFT JOIN "Location" loc ON loc.id = u."locationId"
      WHERE ${where}
      ORDER BY u."lastName" ASC
      LIMIT $${i} OFFSET $${i + 1}
    `, [...vals, perPage, offset]),
    query(`SELECT COUNT(*) as count FROM "User" u WHERE ${where}`, vals),
  ]);

  const total = parseInt(countRes[0]?.count ?? "0", 10);
  const formatted = users.map((r: any) => ({
    ...r,
    company: r.companyName ? { name: r.companyName } : null,
    department: r.departmentName ? { name: r.departmentName } : null,
    location: r.locationName ? { name: r.locationName } : null,
    _count: { assignedAssets: parseInt(r.assetCount ?? "0", 10) },
  }));

  return { users: formatted, total };
}

export async function getUser(id: number) {
  const user = await queryOne(`
    SELECT u.*, co.name as "companyName", co.id as "companyId_r",
      d.name as "departmentName", d.id as "departmentId_r",
      loc.name as "locationName", loc.id as "locationId_r",
      m."firstName" as "managerFirstName", m."lastName" as "managerLastName"
    FROM "User" u
    LEFT JOIN "Company" co ON co.id = u."companyId"
    LEFT JOIN "Department" d ON d.id = u."departmentId"
    LEFT JOIN "Location" loc ON loc.id = u."locationId"
    LEFT JOIN "User" m ON m.id = u."managerId"
    WHERE u.id = $1 AND u."deletedAt" IS NULL
  `, [id]);

  if (!user) return null;

  const [assignedAssets, accessoryCheckouts, licenseSeats] = await Promise.all([
    query(`
      SELECT a.*, am.name as "modelName", s.name as "statusName", s.type as "statusType"
      FROM "Asset" a
      LEFT JOIN "AssetModel" am ON am.id = a."modelId"
      LEFT JOIN "StatusLabel" s ON s.id = a."statusId"
      WHERE a."assignedToId" = $1 AND a."assignedToType" = 'user' AND a."deletedAt" IS NULL
      ORDER BY a."lastCheckout" DESC
    `, [id]),
    query(`
      SELECT ac.*, acc.name as "accessoryName"
      FROM "AccessoryCheckout" ac
      LEFT JOIN "Accessory" acc ON acc.id = ac."accessoryId"
      WHERE ac."userId" = $1
    `, [id]),
    query(`
      SELECT ls.*, l.name as "licenseName"
      FROM "LicenseSeat" ls
      LEFT JOIN "License" l ON l.id = ls."licenseId"
      WHERE ls."userId" = $1
    `, [id]),
  ]);

  return {
    ...user,
    company: user.companyName ? { name: user.companyName } : null,
    department: user.departmentName ? { name: user.departmentName } : null,
    location: user.locationName ? { name: user.locationName } : null,
    manager: user.managerFirstName ? { firstName: user.managerFirstName, lastName: user.managerLastName } : null,
    assignedAssets: assignedAssets.map((a: any) => ({
      ...a,
      model: a.modelName ? { name: a.modelName } : null,
      status: a.statusName ? { name: a.statusName, type: a.statusType } : null,
    })),
    accessoryCheckouts: accessoryCheckouts.map((ac: any) => ({
      ...ac,
      accessory: { name: ac.accessoryName },
    })),
    licenseSeatUsers: licenseSeats.map((ls: any) => ({
      ...ls,
      license: { name: ls.licenseName },
    })),
  };
}

// ---- Categories ----
export async function getCategories(params?: { search?: string; page?: number; perPage?: number; type?: string }) {
  const { search = "", page = 1, perPage = 25, type } = params ?? {};
  const offset = (page - 1) * perPage;
  const conditions = [`c."deletedAt" IS NULL`];
  const vals: any[] = [];
  let i = 1;
  if (type) { conditions.push(`c.type = $${i++}`); vals.push(type); }
  if (search) { conditions.push(`c.name ILIKE $${i++}`); vals.push(`%${search}%`); }
  const where = conditions.join(" AND ");

  const [items, countRes] = await Promise.all([
    query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM "AssetModel" am WHERE am."categoryId" = c.id) as "modelCount",
        (SELECT COUNT(*) FROM "Accessory" a WHERE a."categoryId" = c.id AND a."deletedAt" IS NULL) as "accessoryCount",
        (SELECT COUNT(*) FROM "Consumable" cs WHERE cs."categoryId" = c.id AND cs."deletedAt" IS NULL) as "consumableCount",
        (SELECT COUNT(*) FROM "Component" co WHERE co."categoryId" = c.id AND co."deletedAt" IS NULL) as "componentCount",
        (SELECT COUNT(*) FROM "License" l WHERE l."categoryId" = c.id AND l."deletedAt" IS NULL) as "licenseCount"
      FROM "Category" c
      WHERE ${where}
      ORDER BY c.name ASC LIMIT $${i} OFFSET $${i + 1}
    `, [...vals, perPage, offset]),
    query(`SELECT COUNT(*) as count FROM "Category" c WHERE ${where}`, vals),
  ]);
  const total = parseInt(countRes[0]?.count ?? "0", 10);
  return { items, total };
}

export async function getCategory(id: number) {
  return queryOne(`SELECT * FROM "Category" WHERE id = $1`, [id]);
}

// ---- Manufacturers ----
export async function getManufacturers(params?: { search?: string; page?: number; perPage?: number }) {
  const { search = "", page = 1, perPage = 25 } = params ?? {};
  const offset = (page - 1) * perPage;
  const conditions = [`m."deletedAt" IS NULL`];
  const vals: any[] = [];
  let i = 1;
  if (search) { conditions.push(`m.name ILIKE $${i++}`); vals.push(`%${search}%`); }
  const where = conditions.join(" AND ");

  const [items, countRes] = await Promise.all([
    query(`
      SELECT m.*, (SELECT COUNT(*) FROM "AssetModel" am WHERE am."manufacturerId" = m.id) as "modelCount"
      FROM "Manufacturer" m
      WHERE ${where} ORDER BY m.name ASC LIMIT $${i} OFFSET $${i + 1}
    `, [...vals, perPage, offset]),
    query(`SELECT COUNT(*) as count FROM "Manufacturer" m WHERE ${where}`, vals),
  ]);
  return { items, total: parseInt(countRes[0]?.count ?? "0", 10) };
}

export async function getManufacturer(id: number) {
  return queryOne(`SELECT * FROM "Manufacturer" WHERE id = $1`, [id]);
}

// ---- Suppliers ----
export async function getSuppliers(params?: { search?: string; page?: number; perPage?: number }) {
  const { search = "", page = 1, perPage = 25 } = params ?? {};
  const offset = (page - 1) * perPage;
  const conditions = [`s."deletedAt" IS NULL`];
  const vals: any[] = [];
  let i = 1;
  if (search) { conditions.push(`(s.name ILIKE $${i} OR s.email ILIKE $${i})`); vals.push(`%${search}%`); i++; }
  const where = conditions.join(" AND ");

  const [items, countRes] = await Promise.all([
    query(`
      SELECT s.*, (SELECT COUNT(*) FROM "Asset" a WHERE a."supplierId" = s.id AND a."deletedAt" IS NULL) as "assetCount"
      FROM "Supplier" s
      WHERE ${where} ORDER BY s.name ASC LIMIT $${i} OFFSET $${i + 1}
    `, [...vals, perPage, offset]),
    query(`SELECT COUNT(*) as count FROM "Supplier" s WHERE ${where}`, vals),
  ]);
  return { items, total: parseInt(countRes[0]?.count ?? "0", 10) };
}

export async function getSupplier(id: number) {
  return queryOne(`SELECT * FROM "Supplier" WHERE id = $1`, [id]);
}

// ---- Locations ----
export async function getLocations(params?: { search?: string; page?: number; perPage?: number }) {
  const { search = "", page = 1, perPage = 25 } = params ?? {};
  const offset = (page - 1) * perPage;
  const conditions = [`l."deletedAt" IS NULL`];
  const vals: any[] = [];
  let i = 1;
  if (search) { conditions.push(`l.name ILIKE $${i++}`); vals.push(`%${search}%`); }
  const where = conditions.join(" AND ");

  const [items, countRes] = await Promise.all([
    query(`
      SELECT l.*, p.name as "parentName",
        (SELECT COUNT(*) FROM "User" u WHERE u."locationId" = l.id AND u."deletedAt" IS NULL) as "userCount",
        (SELECT COUNT(*) FROM "Asset" a WHERE a."locationId" = l.id AND a."deletedAt" IS NULL) as "assetCount"
      FROM "Location" l
      LEFT JOIN "Location" p ON p.id = l."parentId"
      WHERE ${where} ORDER BY l.name ASC LIMIT $${i} OFFSET $${i + 1}
    `, [...vals, perPage, offset]),
    query(`SELECT COUNT(*) as count FROM "Location" l WHERE ${where}`, vals),
  ]);
  const items2 = (items as any[]).map((r: any) => ({
    ...r, parent: r.parentName ? { name: r.parentName } : null,
    _count: { users: parseInt(r.userCount ?? "0", 10), assets: parseInt(r.assetCount ?? "0", 10) },
  }));
  return { items: items2, total: parseInt(countRes[0]?.count ?? "0", 10) };
}

export async function getLocation(id: number) {
  return queryOne(`SELECT * FROM "Location" WHERE id = $1`, [id]);
}

// ---- Companies ----
export async function getCompanies(params?: { search?: string; page?: number; perPage?: number }) {
  const { search = "", page = 1, perPage = 25 } = params ?? {};
  const offset = (page - 1) * perPage;
  const conditions = [`c."deletedAt" IS NULL`];
  const vals: any[] = [];
  let i = 1;
  if (search) { conditions.push(`c.name ILIKE $${i++}`); vals.push(`%${search}%`); }
  const where = conditions.join(" AND ");

  const [items, countRes] = await Promise.all([
    query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM "User" u WHERE u."companyId" = c.id AND u."deletedAt" IS NULL) as "userCount",
        (SELECT COUNT(*) FROM "Asset" a WHERE a."companyId" = c.id AND a."deletedAt" IS NULL) as "assetCount"
      FROM "Company" c
      WHERE ${where} ORDER BY c.name ASC LIMIT $${i} OFFSET $${i + 1}
    `, [...vals, perPage, offset]),
    query(`SELECT COUNT(*) as count FROM "Company" c WHERE ${where}`, vals),
  ]);
  const items2 = (items as any[]).map((r: any) => ({
    ...r, _count: { users: parseInt(r.userCount ?? "0", 10), assets: parseInt(r.assetCount ?? "0", 10) },
  }));
  return { items: items2, total: parseInt(countRes[0]?.count ?? "0", 10) };
}

export async function getCompany(id: number) {
  return queryOne(`SELECT * FROM "Company" WHERE id = $1`, [id]);
}

// ---- Departments ----
export async function getDepartments(params?: { search?: string; page?: number; perPage?: number }) {
  const { search = "", page = 1, perPage = 25 } = params ?? {};
  const offset = (page - 1) * perPage;
  const conditions = [`d."deletedAt" IS NULL`];
  const vals: any[] = [];
  let i = 1;
  if (search) { conditions.push(`d.name ILIKE $${i++}`); vals.push(`%${search}%`); }
  const where = conditions.join(" AND ");

  const [items, countRes] = await Promise.all([
    query(`
      SELECT d.*, co.name as "companyName",
        (SELECT COUNT(*) FROM "User" u WHERE u."departmentId" = d.id AND u."deletedAt" IS NULL) as "userCount"
      FROM "Department" d
      LEFT JOIN "Company" co ON co.id = d."companyId"
      WHERE ${where} ORDER BY d.name ASC LIMIT $${i} OFFSET $${i + 1}
    `, [...vals, perPage, offset]),
    query(`SELECT COUNT(*) as count FROM "Department" d WHERE ${where}`, vals),
  ]);
  const items2 = (items as any[]).map((r: any) => ({
    ...r, company: r.companyName ? { name: r.companyName } : null,
    _count: { users: parseInt(r.userCount ?? "0", 10) },
  }));
  return { items: items2, total: parseInt(countRes[0]?.count ?? "0", 10) };
}

export async function getDepartment(id: number) {
  return queryOne(`SELECT * FROM "Department" WHERE id = $1`, [id]);
}

// ---- Status Labels ----
export async function getStatusLabels(params?: { search?: string; page?: number; perPage?: number }) {
  const { search = "", page = 1, perPage = 25 } = params ?? {};
  const offset = (page - 1) * perPage;
  const conditions: string[] = [];
  const vals: any[] = [];
  let i = 1;
  if (search) { conditions.push(`s.name ILIKE $${i++}`); vals.push(`%${search}%`); }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const [items, countRes] = await Promise.all([
    query(`
      SELECT s.*,
        (SELECT COUNT(*) FROM "Asset" a WHERE a."statusId" = s.id AND a."deletedAt" IS NULL) as "assetCount"
      FROM "StatusLabel" s
      ${where} ORDER BY s.name ASC LIMIT $${i} OFFSET $${i + 1}
    `, [...vals, perPage, offset]),
    query(`SELECT COUNT(*) as count FROM "StatusLabel" s ${where}`, vals),
  ]);
  const items2 = (items as any[]).map((r: any) => ({
    ...r, _count: { assets: parseInt(r.assetCount ?? "0", 10) },
  }));
  return { items: items2, total: parseInt(countRes[0]?.count ?? "0", 10) };
}

export async function getStatusLabel(id: number) {
  return queryOne(`SELECT * FROM "StatusLabel" WHERE id = $1`, [id]);
}

// ---- Depreciations ----
export async function getDepreciations(params?: { search?: string; page?: number; perPage?: number }) {
  const { search = "", page = 1, perPage = 25 } = params ?? {};
  const offset = (page - 1) * perPage;
  const conditions: string[] = [];
  const vals: any[] = [];
  let i = 1;
  if (search) { conditions.push(`name ILIKE $${i++}`); vals.push(`%${search}%`); }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const [items, countRes] = await Promise.all([
    query(`SELECT * FROM "Depreciation" ${where} ORDER BY name ASC LIMIT $${i} OFFSET $${i + 1}`, [...vals, perPage, offset]),
    query(`SELECT COUNT(*) as count FROM "Depreciation" ${where}`, vals),
  ]);
  return { items, total: parseInt(countRes[0]?.count ?? "0", 10) };
}

export async function getDepreciation(id: number) {
  return queryOne(`SELECT * FROM "Depreciation" WHERE id = $1`, [id]);
}

// ---- Asset Models ----
export async function getAssetModels(params?: { search?: string; page?: number; perPage?: number }) {
  const { search = "", page = 1, perPage = 25 } = params ?? {};
  const offset = (page - 1) * perPage;
  const conditions = [`m."deletedAt" IS NULL`];
  const vals: any[] = [];
  let i = 1;
  if (search) {
    conditions.push(`(m.name ILIKE $${i} OR m."modelNumber" ILIKE $${i})`);
    vals.push(`%${search}%`); i++;
  }
  const where = conditions.join(" AND ");

  const [items, countRes] = await Promise.all([
    query(`
      SELECT m.*, c.name as "categoryName", mfr.name as "manufacturerName",
        (SELECT COUNT(*) FROM "Asset" a WHERE a."modelId" = m.id AND a."deletedAt" IS NULL) as "assetCount"
      FROM "AssetModel" m
      LEFT JOIN "Category" c ON c.id = m."categoryId"
      LEFT JOIN "Manufacturer" mfr ON mfr.id = m."manufacturerId"
      WHERE ${where} ORDER BY m.name ASC LIMIT $${i} OFFSET $${i + 1}
    `, [...vals, perPage, offset]),
    query(`SELECT COUNT(*) as count FROM "AssetModel" m WHERE ${where}`, vals),
  ]);
  const items2 = (items as any[]).map((r: any) => ({
    ...r,
    category: r.categoryName ? { name: r.categoryName } : null,
    manufacturer: r.manufacturerName ? { name: r.manufacturerName } : null,
    _count: { assets: parseInt(r.assetCount ?? "0", 10) },
  }));
  return { items: items2, total: parseInt(countRes[0]?.count ?? "0", 10) };
}

export async function getAssetModel(id: number) {
  return queryOne(`SELECT * FROM "AssetModel" WHERE id = $1`, [id]);
}

// ---- Licenses ----
export async function getLicenses(params?: { search?: string; page?: number; perPage?: number }) {
  const { search = "", page = 1, perPage = 25 } = params ?? {};
  const offset = (page - 1) * perPage;
  const conditions = [`l."deletedAt" IS NULL`];
  const vals: any[] = [];
  let i = 1;
  if (search) {
    conditions.push(`(l.name ILIKE $${i} OR l.serial ILIKE $${i})`);
    vals.push(`%${search}%`); i++;
  }
  const where = conditions.join(" AND ");

  const [items, countRes] = await Promise.all([
    query(`
      SELECT l.*, c.name as "categoryName", m.name as "manufacturerName", co.name as "companyName",
        (SELECT COUNT(*) FROM "LicenseSeat" ls WHERE ls."licenseId" = l.id) as "seatCount"
      FROM "License" l
      LEFT JOIN "Category" c ON c.id = l."categoryId"
      LEFT JOIN "Manufacturer" m ON m.id = l."manufacturerId"
      LEFT JOIN "Company" co ON co.id = l."companyId"
      WHERE ${where} ORDER BY l.name ASC LIMIT $${i} OFFSET $${i + 1}
    `, [...vals, perPage, offset]),
    query(`SELECT COUNT(*) as count FROM "License" l WHERE ${where}`, vals),
  ]);
  const items2 = (items as any[]).map((r: any) => ({
    ...r,
    category: r.categoryName ? { name: r.categoryName } : null,
    manufacturer: r.manufacturerName ? { name: r.manufacturerName } : null,
    company: r.companyName ? { name: r.companyName } : null,
    _count: { seats_rel: parseInt(r.seatCount ?? "0", 10) },
  }));
  return { items: items2, total: parseInt(countRes[0]?.count ?? "0", 10) };
}

export async function getLicense(id: number) {
  const license = await queryOne(`
    SELECT l.*, c.name as "categoryName", m.name as "manufacturerName",
      sup.name as "supplierName", co.name as "companyName"
    FROM "License" l
    LEFT JOIN "Category" c ON c.id = l."categoryId"
    LEFT JOIN "Manufacturer" m ON m.id = l."manufacturerId"
    LEFT JOIN "Supplier" sup ON sup.id = l."supplierId"
    LEFT JOIN "Company" co ON co.id = l."companyId"
    WHERE l.id = $1 AND l."deletedAt" IS NULL
  `, [id]);

  if (!license) return null;

  const seats = await query(`
    SELECT ls.*,
      u.id as "userId_r", u."firstName", u."lastName",
      a.id as "assetId_r", a."assetTag", a.name as "assetName"
    FROM "LicenseSeat" ls
    LEFT JOIN "User" u ON u.id = ls."userId"
    LEFT JOIN "Asset" a ON a.id = ls."assetId"
    WHERE ls."licenseId" = $1
  `, [id]);

  return {
    ...license,
    category: license.categoryName ? { name: license.categoryName } : null,
    manufacturer: license.manufacturerName ? { name: license.manufacturerName } : null,
    supplier: license.supplierName ? { name: license.supplierName } : null,
    company: license.companyName ? { name: license.companyName } : null,
    seats_rel: seats.map((s: any) => ({
      ...s,
      user: s.firstName ? { id: s.userId_r, firstName: s.firstName, lastName: s.lastName } : null,
      asset: s.assetTag ? { id: s.assetId_r, assetTag: s.assetTag, name: s.assetName } : null,
    })),
  };
}

// ---- Accessories ----
export async function getAccessories(params?: { search?: string; page?: number; perPage?: number }) {
  const { search = "", page = 1, perPage = 25 } = params ?? {};
  const offset = (page - 1) * perPage;
  const conditions = [`a."deletedAt" IS NULL`];
  const vals: any[] = [];
  let i = 1;
  if (search) { conditions.push(`a.name ILIKE $${i++}`); vals.push(`%${search}%`); }
  const where = conditions.join(" AND ");

  const [items, countRes] = await Promise.all([
    query(`
      SELECT a.*, c.name as "categoryName", l.name as "locationName",
        (SELECT COUNT(*) FROM "AccessoryCheckout" ac WHERE ac."accessoryId" = a.id) as "checkoutCount"
      FROM "Accessory" a
      LEFT JOIN "Category" c ON c.id = a."categoryId"
      LEFT JOIN "Location" l ON l.id = a."locationId"
      WHERE ${where} ORDER BY a.name ASC LIMIT $${i} OFFSET $${i + 1}
    `, [...vals, perPage, offset]),
    query(`SELECT COUNT(*) as count FROM "Accessory" a WHERE ${where}`, vals),
  ]);
  const items2 = (items as any[]).map((r: any) => ({
    ...r,
    category: r.categoryName ? { name: r.categoryName } : null,
    location: r.locationName ? { name: r.locationName } : null,
    _count: { checkouts: parseInt(r.checkoutCount ?? "0", 10) },
  }));
  return { items: items2, total: parseInt(countRes[0]?.count ?? "0", 10) };
}

// ---- Consumables ----
export async function getConsumables(params?: { search?: string; page?: number; perPage?: number }) {
  const { search = "", page = 1, perPage = 25 } = params ?? {};
  const offset = (page - 1) * perPage;
  const conditions = [`c."deletedAt" IS NULL`];
  const vals: any[] = [];
  let i = 1;
  if (search) { conditions.push(`c.name ILIKE $${i++}`); vals.push(`%${search}%`); }
  const where = conditions.join(" AND ");

  const [items, countRes] = await Promise.all([
    query(`
      SELECT c.*, cat.name as "categoryName",
        (SELECT COUNT(*) FROM "ConsumableAssignment" ca WHERE ca."consumableId" = c.id) as "assignmentCount"
      FROM "Consumable" c
      LEFT JOIN "Category" cat ON cat.id = c."categoryId"
      WHERE ${where} ORDER BY c.name ASC LIMIT $${i} OFFSET $${i + 1}
    `, [...vals, perPage, offset]),
    query(`SELECT COUNT(*) as count FROM "Consumable" c WHERE ${where}`, vals),
  ]);
  const items2 = (items as any[]).map((r: any) => ({
    ...r,
    category: r.categoryName ? { name: r.categoryName } : null,
    _count: { assignments: parseInt(r.assignmentCount ?? "0", 10) },
  }));
  return { items: items2, total: parseInt(countRes[0]?.count ?? "0", 10) };
}

// ---- Components ----
export async function getComponents(params?: { search?: string; page?: number; perPage?: number }) {
  const { search = "", page = 1, perPage = 25 } = params ?? {};
  const offset = (page - 1) * perPage;
  const conditions = [`c."deletedAt" IS NULL`];
  const vals: any[] = [];
  let i = 1;
  if (search) { conditions.push(`c.name ILIKE $${i++}`); vals.push(`%${search}%`); }
  const where = conditions.join(" AND ");

  const [items, countRes] = await Promise.all([
    query(`
      SELECT c.*, cat.name as "categoryName",
        (SELECT COUNT(*) FROM "ComponentAssignment" ca WHERE ca."componentId" = c.id) as "assignmentCount"
      FROM "Component" c
      LEFT JOIN "Category" cat ON cat.id = c."categoryId"
      WHERE ${where} ORDER BY c.name ASC LIMIT $${i} OFFSET $${i + 1}
    `, [...vals, perPage, offset]),
    query(`SELECT COUNT(*) as count FROM "Component" c WHERE ${where}`, vals),
  ]);
  const items2 = (items as any[]).map((r: any) => ({
    ...r,
    category: r.categoryName ? { name: r.categoryName } : null,
    _count: { assignments: parseInt(r.assignmentCount ?? "0", 10) },
  }));
  return { items: items2, total: parseInt(countRes[0]?.count ?? "0", 10) };
}

// ---- Groups ----
export async function getGroups(params?: { search?: string; page?: number; perPage?: number }) {
  const { search = "", page = 1, perPage = 25 } = params ?? {};
  const offset = (page - 1) * perPage;
  const conditions: string[] = [];
  const vals: any[] = [];
  let i = 1;
  if (search) { conditions.push(`g.name ILIKE $${i++}`); vals.push(`%${search}%`); }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const [items, countRes] = await Promise.all([
    query(`
      SELECT g.*,
        (SELECT COUNT(*) FROM "GroupUser" gu WHERE gu."groupId" = g.id) as "userCount"
      FROM "Group" g
      ${where} ORDER BY g.name ASC LIMIT $${i} OFFSET $${i + 1}
    `, [...vals, perPage, offset]),
    query(`SELECT COUNT(*) as count FROM "Group" g ${where}`, vals),
  ]);
  const items2 = (items as any[]).map((r: any) => ({
    ...r, _count: { users: parseInt(r.userCount ?? "0", 10) },
  }));
  return { items: items2, total: parseInt(countRes[0]?.count ?? "0", 10) };
}

// ---- Reports ----
export async function getActivityLogs(params?: { search?: string; page?: number; perPage?: number; action?: string }) {
  const { page = 1, perPage = 50, action } = params ?? {};
  const offset = (page - 1) * perPage;
  const conditions: string[] = [];
  const vals: any[] = [];
  let i = 1;
  if (action) { conditions.push(`al.action = $${i++}`); vals.push(action); }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const [logs, countRes] = await Promise.all([
    query(`
      SELECT al.*,
        u.id as "userId_r", u."firstName", u."lastName",
        a.id as "assetId_r", a."assetTag", a.name as "assetName",
        l.id as "licenseId_r", l.name as "licenseName",
        acc.id as "accessoryId_r", acc.name as "accessoryName",
        cons.id as "consumableId_r", cons.name as "consumableName",
        comp.id as "componentId_r", comp.name as "componentName"
      FROM "ActionLog" al
      LEFT JOIN "User" u ON u.id = al."userId"
      LEFT JOIN "Asset" a ON a.id = al."assetId"
      LEFT JOIN "License" l ON l.id = al."licenseId"
      LEFT JOIN "Accessory" acc ON acc.id = al."accessoryId"
      LEFT JOIN "Consumable" cons ON cons.id = al."consumableId"
      LEFT JOIN "Component" comp ON comp.id = al."componentId"
      ${where}
      ORDER BY al."actionDate" DESC LIMIT $${i} OFFSET $${i + 1}
    `, [...vals, perPage, offset]),
    query(`SELECT COUNT(*) as count FROM "ActionLog" al ${where}`, vals),
  ]);

  const formatted = logs.map((r: any) => ({
    ...r,
    user: r.firstName ? { id: r.userId_r, firstName: r.firstName, lastName: r.lastName } : null,
    asset: r.assetTag ? { id: r.assetId_r, assetTag: r.assetTag, name: r.assetName } : null,
    license: r.licenseName ? { id: r.licenseId_r, name: r.licenseName } : null,
    accessory: r.accessoryName ? { id: r.accessoryId_r, name: r.accessoryName } : null,
    consumable: r.consumableName ? { id: r.consumableId_r, name: r.consumableName } : null,
    component: r.componentName ? { id: r.componentId_r, name: r.componentName } : null,
  }));

  return { logs: formatted, total: parseInt(countRes[0]?.count ?? "0", 10) };
}

export async function getMaintenanceLogs(params?: { page?: number; perPage?: number }) {
  const { page = 1, perPage = 25 } = params ?? {};
  const offset = (page - 1) * perPage;

  const [items, countRes] = await Promise.all([
    query(`
      SELECT m.*, a."assetTag", a.name as "assetName", a.id as "assetId_r"
      FROM "Maintenance" m
      LEFT JOIN "Asset" a ON a.id = m."assetId"
      ORDER BY m."startDate" DESC LIMIT $1 OFFSET $2
    `, [perPage, offset]),
    query(`SELECT COUNT(*) as count FROM "Maintenance"`, []),
  ]);

  const formatted = items.map((r: any) => ({
    ...r,
    asset: r.assetTag ? { id: r.assetId_r, assetTag: r.assetTag, name: r.assetName } : null,
  }));

  return { items: formatted, total: parseInt(countRes[0]?.count ?? "0", 10) };
}

// ---- Settings ----
export async function getSetting(key: string, fallback = "") {
  const row = await queryOne(`SELECT value FROM "Setting" WHERE key = $1`, [key]);
  return row?.value ?? fallback;
}

export async function getSettings() {
  const rows = await query(`SELECT key, value FROM "Setting"`, []);
  const map: Record<string, string> = {};
  for (const r of rows as any[]) map[r.key] = r.value;
  return map;
}

// ---- Lookup helpers for forms ----
export async function getAllModels() {
  return query(`SELECT m.*, c.name as "categoryName" FROM "AssetModel" m LEFT JOIN "Category" c ON c.id = m."categoryId" WHERE m."deletedAt" IS NULL ORDER BY m.name ASC`, []);
}

export async function getAllStatusLabels() {
  return query(`SELECT * FROM "StatusLabel" ORDER BY name ASC`, []);
}

export async function getAllCompanies() {
  return query(`SELECT * FROM "Company" WHERE "deletedAt" IS NULL ORDER BY name ASC`, []);
}

export async function getAllLocations() {
  return query(`SELECT * FROM "Location" WHERE "deletedAt" IS NULL ORDER BY name ASC`, []);
}

export async function getAllSuppliers() {
  return query(`SELECT * FROM "Supplier" WHERE "deletedAt" IS NULL ORDER BY name ASC`, []);
}

export async function getAllManufacturers() {
  return query(`SELECT * FROM "Manufacturer" WHERE "deletedAt" IS NULL ORDER BY name ASC`, []);
}

export async function getAllCategories(type?: string) {
  const cond = type ? `AND type = '${type}'` : "";
  return query(`SELECT * FROM "Category" WHERE "deletedAt" IS NULL ${cond} ORDER BY name ASC`, []);
}

export async function getAllDepreciations() {
  return query(`SELECT * FROM "Depreciation" ORDER BY name ASC`, []);
}

export async function getAllDepartments() {
  return query(`SELECT * FROM "Department" WHERE "deletedAt" IS NULL ORDER BY name ASC`, []);
}

export async function getAllUsersSimple(excludeId?: number) {
  const cond = excludeId ? `AND id != ${excludeId}` : "";
  return query(`SELECT id, "firstName", "lastName", username FROM "User" WHERE "deletedAt" IS NULL ${cond} ORDER BY "lastName" ASC`, []);
}
