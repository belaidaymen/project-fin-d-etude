"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export { getCategories, getManufacturers, getSuppliers, getLocations, getCompanies,
  getDepartments, getStatusLabels, getDepreciations, getAssetModels, getLicenses,
  getAccessories, getConsumables, getComponents } from "@/lib/queries";

// ---- Categories ----
export async function createCategory(formData: FormData) {
  await db.query(
    `INSERT INTO "Category" (name, type, "requireAcceptance", "checkinEmail", "useDefaultEula", notes, "updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,NOW())`,
    [String(formData.get("name") ?? ""), String(formData.get("type") ?? "asset"),
     formData.get("requireAcceptance") === "on", formData.get("checkinEmail") === "on",
     formData.get("useDefaultEula") === "on", formData.get("notes") as string || null]
  );
  revalidatePath("/categories");
  redirect("/categories");
}

export async function updateCategory(id: number, formData: FormData) {
  await db.query(
    `UPDATE "Category" SET name=$1, type=$2, "requireAcceptance"=$3, "checkinEmail"=$4, notes=$5, "updatedAt"=NOW() WHERE id=$6`,
    [String(formData.get("name") ?? ""), String(formData.get("type") ?? "asset"),
     formData.get("requireAcceptance") === "on", formData.get("checkinEmail") === "on",
     formData.get("notes") as string || null, id]
  );
  revalidatePath("/categories");
  redirect("/categories");
}

export async function deleteCategory(id: number) {
  await db.query(`UPDATE "Category" SET "deletedAt"=NOW(), "updatedAt"=NOW() WHERE id=$1`, [id]);
  revalidatePath("/categories");
  redirect("/categories");
}

// ---- Manufacturers ----
export async function createManufacturer(formData: FormData) {
  await db.query(
    `INSERT INTO "Manufacturer" (name, url, "supportUrl", "supportPhone", "supportEmail", notes, "updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,NOW())`,
    [String(formData.get("name") ?? ""), formData.get("url") as string || null,
     formData.get("supportUrl") as string || null, formData.get("supportPhone") as string || null,
     formData.get("supportEmail") as string || null, formData.get("notes") as string || null]
  );
  revalidatePath("/manufacturers");
  redirect("/manufacturers");
}

export async function updateManufacturer(id: number, formData: FormData) {
  await db.query(
    `UPDATE "Manufacturer" SET name=$1, url=$2, "supportUrl"=$3, "supportPhone"=$4, "supportEmail"=$5, notes=$6, "updatedAt"=NOW() WHERE id=$7`,
    [String(formData.get("name") ?? ""), formData.get("url") as string || null,
     formData.get("supportUrl") as string || null, formData.get("supportPhone") as string || null,
     formData.get("supportEmail") as string || null, formData.get("notes") as string || null, id]
  );
  revalidatePath("/manufacturers");
  redirect("/manufacturers");
}

export async function deleteManufacturer(id: number) {
  await db.query(`UPDATE "Manufacturer" SET "deletedAt"=NOW(), "updatedAt"=NOW() WHERE id=$1`, [id]);
  revalidatePath("/manufacturers");
  redirect("/manufacturers");
}

// ---- Suppliers ----
export async function createSupplier(formData: FormData) {
  await db.query(
    `INSERT INTO "Supplier" (name, url, email, phone, address, city, state, country, contact, notes, "updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())`,
    [String(formData.get("name") ?? ""), formData.get("url") as string || null,
     formData.get("email") as string || null, formData.get("phone") as string || null,
     formData.get("address") as string || null, formData.get("city") as string || null,
     formData.get("state") as string || null, formData.get("country") as string || null,
     formData.get("contact") as string || null, formData.get("notes") as string || null]
  );
  revalidatePath("/suppliers");
  redirect("/suppliers");
}

export async function updateSupplier(id: number, formData: FormData) {
  await db.query(
    `UPDATE "Supplier" SET name=$1, url=$2, email=$3, phone=$4, address=$5, city=$6, state=$7, country=$8, contact=$9, notes=$10, "updatedAt"=NOW() WHERE id=$11`,
    [String(formData.get("name") ?? ""), formData.get("url") as string || null,
     formData.get("email") as string || null, formData.get("phone") as string || null,
     formData.get("address") as string || null, formData.get("city") as string || null,
     formData.get("state") as string || null, formData.get("country") as string || null,
     formData.get("contact") as string || null, formData.get("notes") as string || null, id]
  );
  revalidatePath("/suppliers");
  redirect("/suppliers");
}

export async function deleteSupplier(id: number) {
  await db.query(`UPDATE "Supplier" SET "deletedAt"=NOW(), "updatedAt"=NOW() WHERE id=$1`, [id]);
  revalidatePath("/suppliers");
  redirect("/suppliers");
}

// ---- Locations ----
export async function createLocation(formData: FormData) {
  const parentId = formData.get("parentId") ? parseInt(String(formData.get("parentId"))) : null;
  const companyId = formData.get("companyId") ? parseInt(String(formData.get("companyId"))) : null;
  await db.query(
    `INSERT INTO "Location" (name, address, city, state, country, zip, phone, "parentId", "companyId", "updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())`,
    [String(formData.get("name") ?? ""), formData.get("address") as string || null,
     formData.get("city") as string || null, formData.get("state") as string || null,
     formData.get("country") as string || null, formData.get("zip") as string || null,
     formData.get("phone") as string || null, parentId, companyId]
  );
  revalidatePath("/locations");
  redirect("/locations");
}

export async function updateLocation(id: number, formData: FormData) {
  const parentId = formData.get("parentId") ? parseInt(String(formData.get("parentId"))) : null;
  await db.query(
    `UPDATE "Location" SET name=$1, address=$2, city=$3, state=$4, country=$5, zip=$6, phone=$7, "parentId"=$8, "updatedAt"=NOW() WHERE id=$9`,
    [String(formData.get("name") ?? ""), formData.get("address") as string || null,
     formData.get("city") as string || null, formData.get("state") as string || null,
     formData.get("country") as string || null, formData.get("zip") as string || null,
     formData.get("phone") as string || null, parentId, id]
  );
  revalidatePath("/locations");
  redirect("/locations");
}

export async function deleteLocation(id: number) {
  await db.query(`UPDATE "Location" SET "deletedAt"=NOW(), "updatedAt"=NOW() WHERE id=$1`, [id]);
  revalidatePath("/locations");
  redirect("/locations");
}

// ---- Companies ----
export async function createCompany(formData: FormData) {
  await db.query(
    `INSERT INTO "Company" (name, email, phone, notes, "updatedAt") VALUES ($1,$2,$3,$4,NOW())`,
    [String(formData.get("name") ?? ""), formData.get("email") as string || null,
     formData.get("phone") as string || null, formData.get("notes") as string || null]
  );
  revalidatePath("/companies");
  redirect("/companies");
}

export async function updateCompany(id: number, formData: FormData) {
  await db.query(
    `UPDATE "Company" SET name=$1, email=$2, phone=$3, notes=$4, "updatedAt"=NOW() WHERE id=$5`,
    [String(formData.get("name") ?? ""), formData.get("email") as string || null,
     formData.get("phone") as string || null, formData.get("notes") as string || null, id]
  );
  revalidatePath("/companies");
  redirect("/companies");
}

export async function deleteCompany(id: number) {
  await db.query(`UPDATE "Company" SET "deletedAt"=NOW(), "updatedAt"=NOW() WHERE id=$1`, [id]);
  revalidatePath("/companies");
  redirect("/companies");
}

// ---- Departments ----
export async function createDepartment(formData: FormData) {
  const companyId = formData.get("companyId") ? parseInt(String(formData.get("companyId"))) : null;
  await db.query(
    `INSERT INTO "Department" (name, notes, "companyId", "updatedAt") VALUES ($1,$2,$3,NOW())`,
    [String(formData.get("name") ?? ""), formData.get("notes") as string || null, companyId]
  );
  revalidatePath("/departments");
  redirect("/departments");
}

export async function updateDepartment(id: number, formData: FormData) {
  const companyId = formData.get("companyId") ? parseInt(String(formData.get("companyId"))) : null;
  await db.query(
    `UPDATE "Department" SET name=$1, notes=$2, "companyId"=$3, "updatedAt"=NOW() WHERE id=$4`,
    [String(formData.get("name") ?? ""), formData.get("notes") as string || null, companyId, id]
  );
  revalidatePath("/departments");
  redirect("/departments");
}

export async function deleteDepartment(id: number) {
  await db.query(`UPDATE "Department" SET "deletedAt"=NOW(), "updatedAt"=NOW() WHERE id=$1`, [id]);
  revalidatePath("/departments");
  redirect("/departments");
}

// ---- Status Labels ----
export async function createStatusLabel(formData: FormData) {
  await db.query(
    `INSERT INTO "StatusLabel" (name, type, color, "showInNav", notes, "updatedAt") VALUES ($1,$2,$3,$4,$5,NOW())`,
    [String(formData.get("name") ?? ""), String(formData.get("type") ?? "deployable"),
     formData.get("color") as string || null, formData.get("showInNav") !== "off",
     formData.get("notes") as string || null]
  );
  revalidatePath("/statuslabels");
  redirect("/statuslabels");
}

export async function updateStatusLabel(id: number, formData: FormData) {
  await db.query(
    `UPDATE "StatusLabel" SET name=$1, type=$2, color=$3, "showInNav"=$4, notes=$5, "updatedAt"=NOW() WHERE id=$6`,
    [String(formData.get("name") ?? ""), String(formData.get("type") ?? "deployable"),
     formData.get("color") as string || null, formData.get("showInNav") !== "off",
     formData.get("notes") as string || null, id]
  );
  revalidatePath("/statuslabels");
  redirect("/statuslabels");
}

export async function deleteStatusLabel(id: number) {
  await db.query(`DELETE FROM "StatusLabel" WHERE id=$1`, [id]);
  revalidatePath("/statuslabels");
  redirect("/statuslabels");
}

// ---- Depreciations ----
export async function createDepreciation(formData: FormData) {
  await db.query(
    `INSERT INTO "Depreciation" (name, months, type, "updatedAt") VALUES ($1,$2,$3,NOW())`,
    [String(formData.get("name") ?? ""), parseInt(String(formData.get("months") ?? "12")),
     String(formData.get("type") ?? "straight-line")]
  );
  revalidatePath("/depreciations");
  redirect("/depreciations");
}

export async function updateDepreciation(id: number, formData: FormData) {
  await db.query(
    `UPDATE "Depreciation" SET name=$1, months=$2, type=$3, "updatedAt"=NOW() WHERE id=$4`,
    [String(formData.get("name") ?? ""), parseInt(String(formData.get("months") ?? "12")),
     String(formData.get("type") ?? "straight-line"), id]
  );
  revalidatePath("/depreciations");
  redirect("/depreciations");
}

export async function deleteDepreciation(id: number) {
  await db.query(`DELETE FROM "Depreciation" WHERE id=$1`, [id]);
  revalidatePath("/depreciations");
  redirect("/depreciations");
}

// ---- Asset Models ----
export async function createAssetModel(formData: FormData) {
  const categoryId = formData.get("categoryId") ? parseInt(String(formData.get("categoryId"))) : null;
  const manufacturerId = formData.get("manufacturerId") ? parseInt(String(formData.get("manufacturerId"))) : null;
  const depreciationId = formData.get("depreciationId") ? parseInt(String(formData.get("depreciationId"))) : null;
  const eol = formData.get("eol") ? parseInt(String(formData.get("eol"))) : null;
  await db.query(
    `INSERT INTO "AssetModel" (name, "modelNumber", notes, eol, requestable, "categoryId", "manufacturerId", "depreciationId", "updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())`,
    [String(formData.get("name") ?? ""), formData.get("modelNumber") as string || null,
     formData.get("notes") as string || null, eol, formData.get("requestable") === "on",
     categoryId, manufacturerId, depreciationId]
  );
  revalidatePath("/models");
  redirect("/models");
}

export async function updateAssetModel(id: number, formData: FormData) {
  const categoryId = formData.get("categoryId") ? parseInt(String(formData.get("categoryId"))) : null;
  const manufacturerId = formData.get("manufacturerId") ? parseInt(String(formData.get("manufacturerId"))) : null;
  const depreciationId = formData.get("depreciationId") ? parseInt(String(formData.get("depreciationId"))) : null;
  const eol = formData.get("eol") ? parseInt(String(formData.get("eol"))) : null;
  await db.query(
    `UPDATE "AssetModel" SET name=$1, "modelNumber"=$2, notes=$3, eol=$4, requestable=$5, "categoryId"=$6, "manufacturerId"=$7, "depreciationId"=$8, "updatedAt"=NOW() WHERE id=$9`,
    [String(formData.get("name") ?? ""), formData.get("modelNumber") as string || null,
     formData.get("notes") as string || null, eol, formData.get("requestable") === "on",
     categoryId, manufacturerId, depreciationId, id]
  );
  revalidatePath("/models");
  redirect("/models");
}

export async function deleteAssetModel(id: number) {
  await db.query(`UPDATE "AssetModel" SET "deletedAt"=NOW(), "updatedAt"=NOW() WHERE id=$1`, [id]);
  revalidatePath("/models");
  redirect("/models");
}

// ---- Licenses ----
export async function createLicense(formData: FormData) {
  const seats = parseInt(String(formData.get("seats") ?? "1"));
  const categoryId = formData.get("categoryId") ? parseInt(String(formData.get("categoryId"))) : null;
  const manufacturerId = formData.get("manufacturerId") ? parseInt(String(formData.get("manufacturerId"))) : null;
  const supplierId = formData.get("supplierId") ? parseInt(String(formData.get("supplierId"))) : null;
  const purchaseCost = formData.get("purchaseCost") ? parseFloat(String(formData.get("purchaseCost"))) : null;
  const purchaseDate = formData.get("purchaseDate") ? new Date(String(formData.get("purchaseDate"))) : null;
  const expirationDate = formData.get("expirationDate") ? new Date(String(formData.get("expirationDate"))) : null;

  const result = await db.query(
    `INSERT INTO "License" (name, serial, seats, "freeSeats", "licenseEmail", "licensedTo", notes, "orderNumber", "purchaseCost", "purchaseDate", "expirationDate", "categoryId", "manufacturerId", "supplierId", reassignable, maintained, "updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW()) RETURNING id`,
    [String(formData.get("name") ?? ""), formData.get("serial") as string || null,
     seats, seats, formData.get("licenseEmail") as string || null,
     formData.get("licensedTo") as string || null, formData.get("notes") as string || null,
     formData.get("orderNumber") as string || null, purchaseCost, purchaseDate, expirationDate,
     categoryId, manufacturerId, supplierId,
     formData.get("reassignable") !== "off", formData.get("maintained") === "on"]
  );
  const licenseId = result.rows[0].id;

  for (let i = 0; i < seats; i++) {
    await db.query(`INSERT INTO "LicenseSeat" ("licenseId", "updatedAt") VALUES ($1,NOW())`, [licenseId]);
  }

  revalidatePath("/licenses");
  redirect(`/licenses/${licenseId}`);
}

export async function deleteLicense(id: number) {
  await db.query(`UPDATE "License" SET "deletedAt"=NOW(), "updatedAt"=NOW() WHERE id=$1`, [id]);
  revalidatePath("/licenses");
  redirect("/licenses");
}

// ---- Accessories ----
export async function createAccessory(formData: FormData) {
  const categoryId = formData.get("categoryId") ? parseInt(String(formData.get("categoryId"))) : null;
  const supplierId = formData.get("supplierId") ? parseInt(String(formData.get("supplierId"))) : null;
  const manufacturerId = formData.get("manufacturerId") ? parseInt(String(formData.get("manufacturerId"))) : null;
  const locationId = formData.get("locationId") ? parseInt(String(formData.get("locationId"))) : null;
  const purchaseCost = formData.get("purchaseCost") ? parseFloat(String(formData.get("purchaseCost"))) : null;
  const minAmt = formData.get("minAmt") ? parseInt(String(formData.get("minAmt"))) : null;
  await db.query(
    `INSERT INTO "Accessory" (name, qty, "modelNumber", "orderNumber", notes, requestable, "categoryId", "supplierId", "manufacturerId", "locationId", "purchaseCost", "minAmt", "updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())`,
    [String(formData.get("name") ?? ""), parseInt(String(formData.get("qty") ?? "0")),
     formData.get("modelNumber") as string || null, formData.get("orderNumber") as string || null,
     formData.get("notes") as string || null, formData.get("requestable") === "on",
     categoryId, supplierId, manufacturerId, locationId, purchaseCost, minAmt]
  );
  revalidatePath("/accessories");
  redirect("/accessories");
}

export async function deleteAccessory(id: number) {
  await db.query(`UPDATE "Accessory" SET "deletedAt"=NOW(), "updatedAt"=NOW() WHERE id=$1`, [id]);
  revalidatePath("/accessories");
  redirect("/accessories");
}

export async function checkoutAccessory(id: number, formData: FormData) {
  const userId = parseInt(String(formData.get("userId") ?? ""));
  const qty = parseInt(String(formData.get("qty") ?? "1"));
  const note = formData.get("note") as string || null;

  await db.query(
    `INSERT INTO "AccessoryCheckout" ("accessoryId", "userId", qty, notes, "updatedAt") VALUES ($1,$2,$3,$4,NOW())`,
    [id, userId, qty, note]
  );
  await db.query(`UPDATE "Accessory" SET qty = qty - $1, "updatedAt"=NOW() WHERE id=$2`, [qty, id]);

  revalidatePath(`/accessories/${id}`);
  revalidatePath("/accessories");
  redirect(`/accessories/${id}`);
}

// ---- Consumables ----
export async function createConsumable(formData: FormData) {
  const categoryId = formData.get("categoryId") ? parseInt(String(formData.get("categoryId"))) : null;
  const purchaseCost = formData.get("purchaseCost") ? parseFloat(String(formData.get("purchaseCost"))) : null;
  const minAmt = formData.get("minAmt") ? parseInt(String(formData.get("minAmt"))) : null;
  await db.query(
    `INSERT INTO "Consumable" (name, qty, "itemNo", notes, "categoryId", "purchaseCost", "minAmt", "updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())`,
    [String(formData.get("name") ?? ""), parseInt(String(formData.get("qty") ?? "0")),
     formData.get("itemNo") as string || null, formData.get("notes") as string || null,
     categoryId, purchaseCost, minAmt]
  );
  revalidatePath("/consumables");
  redirect("/consumables");
}

export async function deleteConsumable(id: number) {
  await db.query(`UPDATE "Consumable" SET "deletedAt"=NOW(), "updatedAt"=NOW() WHERE id=$1`, [id]);
  revalidatePath("/consumables");
  redirect("/consumables");
}

// ---- Components ----
export async function createComponent(formData: FormData) {
  const categoryId = formData.get("categoryId") ? parseInt(String(formData.get("categoryId"))) : null;
  const locationId = formData.get("locationId") ? parseInt(String(formData.get("locationId"))) : null;
  const purchaseCost = formData.get("purchaseCost") ? parseFloat(String(formData.get("purchaseCost"))) : null;
  const minAmt = formData.get("minAmt") ? parseInt(String(formData.get("minAmt"))) : null;
  await db.query(
    `INSERT INTO "Component" (name, qty, serial, "orderNumber", notes, "categoryId", "locationId", "purchaseCost", "minAmt", "updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())`,
    [String(formData.get("name") ?? ""), parseInt(String(formData.get("qty") ?? "0")),
     formData.get("serial") as string || null, formData.get("orderNumber") as string || null,
     formData.get("notes") as string || null, categoryId, locationId, purchaseCost, minAmt]
  );
  revalidatePath("/components");
  redirect("/components");
}

export async function deleteComponent(id: number) {
  await db.query(`UPDATE "Component" SET "deletedAt"=NOW(), "updatedAt"=NOW() WHERE id=$1`, [id]);
  revalidatePath("/components");
  redirect("/components");
}
