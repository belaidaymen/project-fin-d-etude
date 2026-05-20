import { getSupplier } from "@/lib/queries";
import { updateSupplier } from "@/lib/actions/crud";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, Input, Textarea, Button } from "@/components/ui/form-field";
import Link from "next/link";

export default async function EditSupplierPage({ params }: { params: { id: string } }) {
  const s = await getSupplier(parseInt(params.id));
  if (!s) notFound();
  return (
    <div>
      <PageHeader title={`Edit: ${s.name}`} breadcrumbs={[{ label: "Suppliers", href: "/suppliers" }, { label: "Edit" }]} />
      <div className="max-w-2xl">
        <form action={updateSupplier.bind(null, s.id)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Name" required><Input name="name" required defaultValue={s.name} /></FormField>
            <FormField label="Contact Name"><Input name="contact" defaultValue={s.contact ?? ""} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email"><Input name="email" type="email" defaultValue={s.email ?? ""} /></FormField>
            <FormField label="Phone"><Input name="phone" defaultValue={s.phone ?? ""} /></FormField>
          </div>
          <FormField label="Website"><Input name="url" type="url" defaultValue={s.url ?? ""} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Address"><Input name="address" defaultValue={s.address ?? ""} /></FormField>
            <FormField label="City"><Input name="city" defaultValue={s.city ?? ""} /></FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="State"><Input name="state" defaultValue={s.state ?? ""} /></FormField>
            <FormField label="Zip"><Input name="zip" defaultValue={s.zip ?? ""} /></FormField>
            <FormField label="Country"><Input name="country" defaultValue={s.country ?? ""} /></FormField>
          </div>
          <FormField label="Notes"><Textarea name="notes" defaultValue={s.notes ?? ""} /></FormField>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Update Supplier</Button>
            <Link href="/suppliers"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
