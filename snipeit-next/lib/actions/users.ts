"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export { getUsers, getUser } from "@/lib/queries";

export async function createUser(formData: FormData) {
  const password = formData.get("password") as string;
  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

  const firstName = String(formData.get("firstName") ?? "");
  const lastName = String(formData.get("lastName") ?? "");
  const username = String(formData.get("username") ?? "");
  const email = formData.get("email") as string || null;
  const phone = formData.get("phone") as string || null;
  const jobtitle = formData.get("jobtitle") as string || null;
  const employeeNum = formData.get("employeeNum") as string || null;
  const notes = formData.get("notes") as string || null;
  const activated = formData.get("activated") !== "off";
  const isAdmin = formData.get("isAdmin") === "on";
  const isSuperUser = formData.get("isSuperUser") === "on";
  const remote = formData.get("remote") === "on";
  const vip = formData.get("vip") === "on";
  const companyId = formData.get("companyId") ? parseInt(String(formData.get("companyId"))) : null;
  const departmentId = formData.get("departmentId") ? parseInt(String(formData.get("departmentId"))) : null;
  const locationId = formData.get("locationId") ? parseInt(String(formData.get("locationId"))) : null;
  const managerId = formData.get("managerId") ? parseInt(String(formData.get("managerId"))) : null;
  const startDate = formData.get("startDate") ? new Date(String(formData.get("startDate"))) : null;
  const endDate = formData.get("endDate") ? new Date(String(formData.get("endDate"))) : null;

  const result = await db.query(
    `INSERT INTO "User" ("firstName","lastName",username,email,password,phone,jobtitle,"employeeNum",notes,activated,"isAdmin","isSuperUser",remote,vip,"companyId","departmentId","locationId","managerId","startDate","endDate","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,NOW())
     RETURNING id`,
    [firstName, lastName, username, email, hashedPassword, phone, jobtitle, employeeNum, notes, activated, isAdmin, isSuperUser, remote, vip, companyId, departmentId, locationId, managerId, startDate, endDate]
  );
  const userId = result.rows[0].id;

  revalidatePath("/users");
  redirect(`/users/${userId}`);
}

export async function updateUser(id: number, formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "");
  const lastName = String(formData.get("lastName") ?? "");
  const username = String(formData.get("username") ?? "");
  const email = formData.get("email") as string || null;
  const phone = formData.get("phone") as string || null;
  const jobtitle = formData.get("jobtitle") as string || null;
  const employeeNum = formData.get("employeeNum") as string || null;
  const notes = formData.get("notes") as string || null;
  const activated = formData.get("activated") !== "off";
  const isAdmin = formData.get("isAdmin") === "on";
  const remote = formData.get("remote") === "on";
  const vip = formData.get("vip") === "on";
  const companyId = formData.get("companyId") ? parseInt(String(formData.get("companyId"))) : null;
  const departmentId = formData.get("departmentId") ? parseInt(String(formData.get("departmentId"))) : null;
  const locationId = formData.get("locationId") ? parseInt(String(formData.get("locationId"))) : null;
  const managerId = formData.get("managerId") ? parseInt(String(formData.get("managerId"))) : null;

  const newPassword = formData.get("password") as string;
  let pwClause = "";
  const vals: any[] = [firstName, lastName, username, email, phone, jobtitle, employeeNum, notes, activated, isAdmin, remote, vip, companyId, departmentId, locationId, managerId];

  if (newPassword) {
    const hashed = await bcrypt.hash(newPassword, 10);
    vals.push(hashed);
    pwClause = `, password=$${vals.length}`;
  }
  vals.push(id);

  await db.query(
    `UPDATE "User" SET "firstName"=$1,"lastName"=$2,username=$3,email=$4,phone=$5,jobtitle=$6,"employeeNum"=$7,notes=$8,
     activated=$9,"isAdmin"=$10,remote=$11,vip=$12,"companyId"=$13,"departmentId"=$14,"locationId"=$15,"managerId"=$16${pwClause},"updatedAt"=NOW()
     WHERE id=$${vals.length}`,
    vals
  );

  revalidatePath(`/users/${id}`);
  revalidatePath("/users");
  redirect(`/users/${id}`);
}

export async function deleteUser(id: number) {
  await db.query(`UPDATE "User" SET "deletedAt"=NOW(), "updatedAt"=NOW() WHERE id=$1`, [id]);
  revalidatePath("/users");
  redirect("/users");
}
