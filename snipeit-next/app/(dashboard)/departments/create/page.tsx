import { getAllCompanies } from "@/lib/queries";
import { createDepartment } from "@/lib/actions/crud";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, Input, Textarea, Select, Button } from "@/components/ui/form-field";
import Link from "next/link";

export default async function CreateDepartmentPage() {
  const companies = await getAllCompanies();
  return (
    <div>
      <PageHeader title="Add Department" breadcrumbs={[{ label: "Departments", href: "/departments" }, { label: "New" }]} />
      <div className="max-w-lg">
        <form action={createDepartment} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <FormField label="Name" required><Input name="name" required placeholder="Engineering" /></FormField>
          <FormField label="Company">
            <Select name="companyId"><option value="">— None —</option>
              {(companies as any[]).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Notes"><Textarea name="notes" /></FormField>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Save Department</Button>
            <Link href="/departments"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
