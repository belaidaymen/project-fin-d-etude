import { createCompany } from "@/lib/actions/crud";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, Input, Textarea, Button } from "@/components/ui/form-field";
import Link from "next/link";

export default function CreateCompanyPage() {
  return (
    <div>
      <PageHeader title="Add Company" breadcrumbs={[{ label: "Companies", href: "/companies" }, { label: "New" }]} />
      <div className="max-w-lg">
        <form action={createCompany} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <FormField label="Name" required><Input name="name" required placeholder="Acme Corporation" /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email"><Input name="email" type="email" placeholder="it@acme.com" /></FormField>
            <FormField label="Phone"><Input name="phone" placeholder="+1 555-000-0000" /></FormField>
          </div>
          <FormField label="Notes"><Textarea name="notes" /></FormField>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Save Company</Button>
            <Link href="/companies"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
