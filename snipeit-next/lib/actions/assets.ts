"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAsset } from "@/lib/queries";

export { getAssets, getAsset } from "@/lib/queries";

function getUserId(session: any): number {
  return parseInt((session?.user as any)?.id ?? "0");
}

export async function createAsset(formData: FormData) {
  const session = await auth();
  const userId = getUserId(session);

  const assetTag = String(formData.get("assetTag") ?? "");
  const name = formData.get("name") as string || null;
  const serial = formData.get("serial") as string || null;
  const notes = formData.get("notes") as string || null;
  const orderNumber = formData.get("orderNumber") as string || null;
  const requestable = formData.get("requestable") === "on";
  const byod = formData.get("byod") === "on";

  const modelId = formData.get("modelId") ? parseInt(String(formData.get("modelId"))) : null;
  const statusId = formData.get("statusId") ? parseInt(String(formData.get("statusId"))) : null;
  const companyId = formData.get("companyId") ? parseInt(String(formData.get("companyId"))) : null;
  const locationId = formData.get("locationId") ? parseInt(String(formData.get("locationId"))) : null;
  const rtdLocationId = formData.get("rtdLocationId") ? parseInt(String(formData.get("rtdLocationId"))) : null;
  const supplierId = formData.get("supplierId") ? parseInt(String(formData.get("supplierId"))) : null;
  const purchaseCost = formData.get("purchaseCost") ? parseFloat(String(formData.get("purchaseCost"))) : null;
  const purchaseDate = formData.get("purchaseDate") ? new Date(String(formData.get("purchaseDate"))) : null;
  const warrantyMonths = formData.get("warrantyMonths") ? parseInt(String(formData.get("warrantyMonths"))) : null;

  const result = await db.query(
    `INSERT INTO "Asset" ("assetTag", name, serial, notes, "orderNumber", requestable, byod, "modelId", "statusId", "companyId", "locationId", "rtdLocationId", "supplierId", "purchaseCost", "purchaseDate", "warrantyMonths", "createdById", "updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,NOW())
     RETURNING id`,
    [assetTag, name, serial, notes, orderNumber, requestable, byod, modelId, statusId, companyId, locationId, rtdLocationId, supplierId, purchaseCost, purchaseDate, warrantyMonths, userId || null]
  );
  const assetId = result.rows[0].id;

  await db.query(
    `INSERT INTO "ActionLog" (action, "userId", "assetId", note, "actionDate", "updatedAt") VALUES ('create',$1,$2,$3,NOW(),NOW())`,
    [userId || null, assetId, `Asset ${assetTag} created`]
  );

  revalidatePath("/assets");
  redirect(`/assets/${assetId}`);
}

export async function updateAsset(id: number, formData: FormData) {
  const session = await auth();
  const userId = getUserId(session);

  const assetTag = String(formData.get("assetTag") ?? "");
  const name = formData.get("name") as string || null;
  const serial = formData.get("serial") as string || null;
  const notes = formData.get("notes") as string || null;
  const orderNumber = formData.get("orderNumber") as string || null;
  const requestable = formData.get("requestable") === "on";
  const byod = formData.get("byod") === "on";
  const modelId = formData.get("modelId") ? parseInt(String(formData.get("modelId"))) : null;
  const statusId = formData.get("statusId") ? parseInt(String(formData.get("statusId"))) : null;
  const companyId = formData.get("companyId") ? parseInt(String(formData.get("companyId"))) : null;
  const locationId = formData.get("locationId") ? parseInt(String(formData.get("locationId"))) : null;
  const supplierId = formData.get("supplierId") ? parseInt(String(formData.get("supplierId"))) : null;
  const purchaseCost = formData.get("purchaseCost") ? parseFloat(String(formData.get("purchaseCost"))) : null;
  const purchaseDate = formData.get("purchaseDate") ? new Date(String(formData.get("purchaseDate"))) : null;
  const warrantyMonths = formData.get("warrantyMonths") ? parseInt(String(formData.get("warrantyMonths"))) : null;

  await db.query(
    `UPDATE "Asset" SET "assetTag"=$1, name=$2, serial=$3, notes=$4, "orderNumber"=$5, requestable=$6, byod=$7,
     "modelId"=$8, "statusId"=$9, "companyId"=$10, "locationId"=$11, "supplierId"=$12,
     "purchaseCost"=$13, "purchaseDate"=$14, "warrantyMonths"=$15, "updatedAt"=NOW()
     WHERE id=$16`,
    [assetTag, name, serial, notes, orderNumber, requestable, byod, modelId, statusId, companyId, locationId, supplierId, purchaseCost, purchaseDate, warrantyMonths, id]
  );

  await db.query(
    `INSERT INTO "ActionLog" (action, "userId", "assetId", note, "actionDate", "updatedAt") VALUES ('update',$1,$2,'Asset updated',NOW(),NOW())`,
    [userId || null, id]
  );

  revalidatePath(`/assets/${id}`);
  revalidatePath("/assets");
  redirect(`/assets/${id}`);
}

export async function deleteAsset(id: number) {
  const session = await auth();
  const userId = getUserId(session);

  await db.query(
    `UPDATE "Asset" SET "deletedAt"=NOW(), "assignedToId"=NULL, "assignedToType"=NULL, "updatedAt"=NOW() WHERE id=$1`,
    [id]
  );
  await db.query(
    `INSERT INTO "ActionLog" (action, "userId", "assetId", note, "actionDate", "updatedAt") VALUES ('delete',$1,$2,'Asset deleted',NOW(),NOW())`,
    [userId || null, id]
  );

  revalidatePath("/assets");
  redirect("/assets");
}

export async function checkoutAsset(id: number, formData: FormData) {
  const session = await auth();
  const userId = getUserId(session);

  const checkoutToType = String(formData.get("checkoutToType"));
  const checkoutToId = parseInt(String(formData.get("checkoutToId")));
  const note = formData.get("note") as string || null;
  const expectedCheckin = formData.get("expectedCheckin") as string || null;

  await db.query(
    `UPDATE "Asset" SET "assignedToId"=$1, "assignedToType"=$2, "lastCheckout"=NOW(), "expectedCheckin"=$3, "updatedAt"=NOW() WHERE id=$4`,
    [checkoutToId, checkoutToType, expectedCheckin ? new Date(expectedCheckin) : null, id]
  );

  await db.query(
    `INSERT INTO "ActionLog" (action, "userId", "assetId", "targetId", "targetType", note, "actionDate", "updatedAt")
     VALUES ('checkout',$1,$2,$3,$4,$5,NOW(),NOW())`,
    [userId || null, id, checkoutToType === "user" ? checkoutToId : null, checkoutToType, note]
  );

  revalidatePath(`/assets/${id}`);
  revalidatePath("/assets");
  redirect(`/assets/${id}`);
}

export async function checkinAsset(id: number, formData: FormData) {
  const session = await auth();
  const userId = getUserId(session);

  const note = formData.get("note") as string || null;
  const assetRes = await db.query(`SELECT "rtdLocationId" FROM "Asset" WHERE id=$1`, [id]);
  const rtdLocationId = assetRes.rows[0]?.rtdLocationId ?? null;

  await db.query(
    `UPDATE "Asset" SET "assignedToId"=NULL, "assignedToType"=NULL, "assignedAssetId"=NULL,
     "lastCheckin"=NOW(), "expectedCheckin"=NULL, "locationId"=$1, "updatedAt"=NOW() WHERE id=$2`,
    [rtdLocationId, id]
  );

  await db.query(
    `INSERT INTO "ActionLog" (action, "userId", "assetId", note, "actionDate", "updatedAt") VALUES ('checkin',$1,$2,$3,NOW(),NOW())`,
    [userId || null, id, note]
  );

  revalidatePath(`/assets/${id}`);
  revalidatePath("/assets");
  redirect(`/assets/${id}`);
}
