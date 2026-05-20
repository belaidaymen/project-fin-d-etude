import { getAllLocations, getAllCompanies } from "@/lib/queries";
import { createLocation } from "@/lib/actions/crud";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, Input, Select, Button } from "@/components/ui/form-field";
import Link from "next/link";

export default async function CreateLocationPage() {
  const [locations, companies] = await Promise.all([getAllLocations(), getAllCompanies()]);
  return (
    <div>
      <PageHeader title="Add Location" breadcrumbs={[{ label: "Locations", href: "/locations" }, { label: "New" }]} />
      <div className="max-w-lg">
        <form action={createLocation} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <FormField label="Name" required><Input name="name" required placeholder="Headquarters" /></FormField>
          <FormField label="Parent Location">
            <Select name="parentId"><option value="">— None —</option>
              {(locations as any[]).map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Company">
            <Select name="companyId"><option value="">— None —</option>
              {(companies as any[]).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Address"><Input name="address" placeholder="123 Main St" /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="City"><Input name="city" placeholder="San Francisco" /></FormField>
            <FormField label="State"><Input name="state" placeholder="CA" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Zip"><Input name="zip" placeholder="94105" /></FormField>
            <FormField label="Country"><Input name="country" placeholder="US" /></FormField>
          </div>
          <FormField label="Phone"><Input name="phone" placeholder="+1 555-000-0000" /></FormField>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Save Location</Button>
            <Link href="/locations"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
