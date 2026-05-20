import { createSupplier } from "@/lib/actions/crud";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, Input, Textarea, Button } from "@/components/ui/form-field";
import Link from "next/link";

export default function CreateSupplierPage() {
  return (
    <div>
      <PageHeader title="Add Supplier" breadcrumbs={[{ label: "Suppliers", href: "/suppliers" }, { label: "New" }]} />
      <div className="max-w-2xl">
        <form action={createSupplier} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Name" required><Input name="name" required placeholder="CDW" /></FormField>
            <FormField label="Contact Name"><Input name="contact" placeholder="Jane Smith" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email"><Input name="email" type="email" placeholder="sales@cdw.com" /></FormField>
            <FormField label="Phone"><Input name="phone" placeholder="+1 555-000-0000" /></FormField>
          </div>
          <FormField label="Website"><Input name="url" type="url" placeholder="https://cdw.com" /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Address"><Input name="address" placeholder="200 N Milwaukee Ave" /></FormField>
            <FormField label="City"><Input name="city" placeholder="Vernon Hills" /></FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="State"><Input name="state" placeholder="IL" /></FormField>
            <FormField label="Zip"><Input name="zip" placeholder="60061" /></FormField>
            <FormField label="Country"><Input name="country" placeholder="US" /></FormField>
          </div>
          <FormField label="Notes"><Textarea name="notes" /></FormField>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Save Supplier</Button>
            <Link href="/suppliers"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
