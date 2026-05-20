import { getManufacturer } from "@/lib/queries";
import { updateManufacturer } from "@/lib/actions/crud";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, Input, Textarea, Button } from "@/components/ui/form-field";
import Link from "next/link";

export default async function EditManufacturerPage({ params }: { params: { id: string } }) {
  const m = await getManufacturer(parseInt(params.id));
  if (!m) notFound();
  return (
    <div>
      <PageHeader title={`Edit: ${m.name}`} breadcrumbs={[{ label: "Manufacturers", href: "/manufacturers" }, { label: "Edit" }]} />
      <div className="max-w-lg">
        <form action={updateManufacturer.bind(null, m.id)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <FormField label="Name" required><Input name="name" required defaultValue={m.name} /></FormField>
          <FormField label="Website URL"><Input name="url" type="url" defaultValue={m.url ?? ""} /></FormField>
          <FormField label="Support URL"><Input name="supportUrl" type="url" defaultValue={m.supportUrl ?? ""} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Support Phone"><Input name="supportPhone" defaultValue={m.supportPhone ?? ""} /></FormField>
            <FormField label="Support Email"><Input name="supportEmail" type="email" defaultValue={m.supportEmail ?? ""} /></FormField>
          </div>
          <FormField label="Notes"><Textarea name="notes" defaultValue={m.notes ?? ""} /></FormField>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Update Manufacturer</Button>
            <Link href="/manufacturers"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
