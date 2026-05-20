import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, Input, Button } from "@/components/ui/form-field";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

async function updateProfile(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session) redirect("/login");
  const userId = parseInt((session.user as any).id);
  const newPassword = formData.get("password") as string;
  let pwClause = "";
  const vals: any[] = [
    String(formData.get("firstName") ?? ""),
    String(formData.get("lastName") ?? ""),
    formData.get("email") as string || null,
    formData.get("phone") as string || null,
    formData.get("jobtitle") as string || null,
  ];
  if (newPassword) {
    const hashed = await bcrypt.hash(newPassword, 10);
    vals.push(hashed);
    pwClause = `, password=$${vals.length}`;
  }
  vals.push(userId);
  await db.query(
    `UPDATE "User" SET "firstName"=$1,"lastName"=$2,email=$3,phone=$4,jobtitle=$5${pwClause},"updatedAt"=NOW() WHERE id=$${vals.length}`,
    vals
  );
  revalidatePath("/account/profile");
  redirect("/account/profile");
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");
  const userId = parseInt((session.user as any).id);
  const res = await db.query(`SELECT * FROM "User" WHERE id=$1`, [userId]);
  const user = res.rows[0];
  if (!user) notFound();

  return (
    <div>
      <PageHeader title="My Profile" description="Manage your account settings"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Profile" }]} />
      <div className="max-w-lg">
        <form action={updateProfile} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" required><Input name="firstName" required defaultValue={user.firstName} /></FormField>
            <FormField label="Last Name" required><Input name="lastName" required defaultValue={user.lastName} /></FormField>
          </div>
          <FormField label="Email"><Input name="email" type="email" defaultValue={user.email ?? ""} /></FormField>
          <FormField label="Phone"><Input name="phone" defaultValue={user.phone ?? ""} /></FormField>
          <FormField label="Job Title"><Input name="jobtitle" defaultValue={user.jobtitle ?? ""} /></FormField>
          <FormField label="New Password" hint="Leave blank to keep current">
            <Input name="password" type="password" placeholder="••••••••" />
          </FormField>
          <div className="pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Update Profile</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
