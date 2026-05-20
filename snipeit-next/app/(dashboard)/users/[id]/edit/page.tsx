import { getUser, getAllCompanies, getAllDepartments, getAllLocations, getAllUsersSimple } from "@/lib/queries";
import { updateUser } from "@/lib/actions/users";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, Input, Textarea, Select, Button } from "@/components/ui/form-field";
import Link from "next/link";

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const [user, companies, departments, locations, managers] = await Promise.all([
    getUser(id), getAllCompanies(), getAllDepartments(), getAllLocations(), getAllUsersSimple(id),
  ]);
  if (!user) notFound();
  return (
    <div>
      <PageHeader title={`Edit: ${user.firstName} ${user.lastName}`}
        breadcrumbs={[{ label: "Users", href: "/users" }, { label: `${user.firstName} ${user.lastName}`, href: `/users/${id}` }, { label: "Edit" }]} />
      <div className="max-w-2xl">
        <form action={updateUser.bind(null, id)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" required><Input name="firstName" required defaultValue={user.firstName} /></FormField>
            <FormField label="Last Name" required><Input name="lastName" required defaultValue={user.lastName} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Username" required><Input name="username" required defaultValue={user.username} /></FormField>
            <FormField label="Email"><Input name="email" type="email" defaultValue={user.email ?? ""} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="New Password" hint="Leave blank to keep current"><Input name="password" type="password" placeholder="••••••••" /></FormField>
            <FormField label="Employee #"><Input name="employeeNum" defaultValue={user.employeeNum ?? ""} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Job Title"><Input name="jobtitle" defaultValue={user.jobtitle ?? ""} /></FormField>
            <FormField label="Phone"><Input name="phone" defaultValue={user.phone ?? ""} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Company">
              <Select name="companyId"><option value="">— None —</option>
                {(companies as any[]).map((c: any) => <option key={c.id} value={c.id} selected={c.id === user.companyId}>{c.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Department">
              <Select name="departmentId"><option value="">— None —</option>
                {(departments as any[]).map((d: any) => <option key={d.id} value={d.id} selected={d.id === user.departmentId}>{d.name}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Location">
              <Select name="locationId"><option value="">— None —</option>
                {(locations as any[]).map((l: any) => <option key={l.id} value={l.id} selected={l.id === user.locationId}>{l.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Manager">
              <Select name="managerId"><option value="">— None —</option>
                {(managers as any[]).map((u: any) => <option key={u.id} value={u.id} selected={u.id === user.managerId}>{u.firstName} {u.lastName}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" name="activated" className="rounded" defaultChecked={user.activated} /> Active</label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" name="isAdmin" className="rounded" defaultChecked={user.isAdmin} /> Admin</label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" name="remote" className="rounded" defaultChecked={user.remote} /> Remote</label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" name="vip" className="rounded" defaultChecked={user.vip} /> VIP</label>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Update User</Button>
            <Link href={`/users/${id}`}><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
