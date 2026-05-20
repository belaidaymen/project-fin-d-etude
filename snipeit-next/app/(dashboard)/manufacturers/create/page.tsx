import { createManufacturer } from "@/lib/actions/crud";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, Input, Textarea, Button } from "@/components/ui/form-field";
import Link from "next/link";

export default function CreateManufacturerPage() {
  return (
    <div>
      <PageHeader title="Add Manufacturer" breadcrumbs={[{ label: "Manufacturers", href: "/manufacturers" }, { label: "New" }]} />
      <div className="max-w-lg">
        <form action={createManufacturer} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <FormField label="Name" required><Input name="name" required placeholder="Apple" /></FormField>
          <FormField label="Website URL"><Input name="url" type="url" placeholder="https://apple.com" /></FormField>
          <FormField label="Support URL"><Input name="supportUrl" type="url" placeholder="https://support.apple.com" /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Support Phone"><Input name="supportPhone" placeholder="1-800-275-2273" /></FormField>
            <FormField label="Support Email"><Input name="supportEmail" type="email" placeholder="support@apple.com" /></FormField>
          </div>
          <FormField label="Notes"><Textarea name="notes" /></FormField>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Save Manufacturer</Button>
            <Link href="/manufacturers"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
