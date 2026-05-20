import { getCompany } from "@/lib/queries";
import { updateCompany } from "@/lib/actions/crud";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, Input, Textarea, Button } from "@/components/ui/form-field";
import Link from "next/link";

export default async function EditCompanyPage({ params }: { params: { id: string } }) {
  const co = await getCompany(parseInt(params.id));
  if (!co) notFound();
  return (
    <div>
      <PageHeader title={`Edit: ${co.name}`} breadcrumbs={[{ label: "Companies", href: "/companies" }, { label: "Edit" }]} />
      <div className="max-w-lg">
        <form action={updateCompany.bind(null, co.id)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <FormField label="Name" required><Input name="name" required defaultValue={co.name} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email"><Input name="email" type="email" defaultValue={co.email ?? ""} /></FormField>
            <FormField label="Phone"><Input name="phone" defaultValue={co.phone ?? ""} /></FormField>
          </div>
          <FormField label="Notes"><Textarea name="notes" defaultValue={co.notes ?? ""} /></FormField>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Update Company</Button>
            <Link href="/companies"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
