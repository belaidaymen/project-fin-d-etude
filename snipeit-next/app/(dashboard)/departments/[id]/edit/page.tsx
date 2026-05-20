import { getDepartment, getAllCompanies } from "@/lib/queries";
import { updateDepartment } from "@/lib/actions/crud";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, Input, Textarea, Select, Button } from "@/components/ui/form-field";
import Link from "next/link";

export default async function EditDepartmentPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const [dept, companies] = await Promise.all([getDepartment(id), getAllCompanies()]);
  if (!dept) notFound();
  return (
    <div>
      <PageHeader title={`Edit: ${dept.name}`} breadcrumbs={[{ label: "Departments", href: "/departments" }, { label: "Edit" }]} />
      <div className="max-w-lg">
        <form action={updateDepartment.bind(null, dept.id)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <FormField label="Name" required><Input name="name" required defaultValue={dept.name} /></FormField>
          <FormField label="Company">
            <Select name="companyId"><option value="">— None —</option>
              {(companies as any[]).map((c: any) => <option key={c.id} value={c.id} selected={c.id === dept.companyId}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Notes"><Textarea name="notes" defaultValue={dept.notes ?? ""} /></FormField>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Update Department</Button>
            <Link href="/departments"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
