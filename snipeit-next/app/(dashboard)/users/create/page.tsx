import { getAllCompanies, getAllDepartments, getAllLocations, getAllUsersSimple } from "@/lib/queries";
import { createUser } from "@/lib/actions/users";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, Input, Textarea, Select, Button } from "@/components/ui/form-field";
import Link from "next/link";

export default async function CreateUserPage() {
  const [companies, departments, locations, users] = await Promise.all([
    getAllCompanies(), getAllDepartments(), getAllLocations(), getAllUsersSimple(),
  ]);
  return (
    <div>
      <PageHeader title="Create User" breadcrumbs={[{ label: "Users", href: "/users" }, { label: "New User" }]} />
      <div className="max-w-2xl">
        <form action={createUser} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" required><Input name="firstName" required placeholder="John" /></FormField>
            <FormField label="Last Name" required><Input name="lastName" required placeholder="Doe" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Username" required><Input name="username" required placeholder="jdoe" /></FormField>
            <FormField label="Email"><Input name="email" type="email" placeholder="jdoe@example.com" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Password" required hint="Minimum 8 characters"><Input name="password" type="password" required minLength={8} placeholder="••••••••" /></FormField>
            <FormField label="Employee #"><Input name="employeeNum" placeholder="EMP-001" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Job Title"><Input name="jobtitle" placeholder="Software Engineer" /></FormField>
            <FormField label="Phone"><Input name="phone" type="tel" placeholder="+1 555-000-0000" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Company">
              <Select name="companyId"><option value="">— None —</option>
                {(companies as any[]).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Department">
              <Select name="departmentId"><option value="">— None —</option>
                {(departments as any[]).map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Location">
              <Select name="locationId"><option value="">— None —</option>
                {(locations as any[]).map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Manager">
              <Select name="managerId"><option value="">— None —</option>
                {(users as any[]).map((u: any) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" name="activated" defaultChecked className="rounded" /> Active</label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" name="isAdmin" className="rounded" /> Admin</label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" name="remote" className="rounded" /> Remote</label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" name="vip" className="rounded" /> VIP</label>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Create User</Button>
            <Link href="/users"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
