import { createCategory } from "@/lib/actions/crud";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, Input, Textarea, Select, Button } from "@/components/ui/form-field";
import Link from "next/link";

export default function CreateCategoryPage() {
  return (
    <div>
      <PageHeader title="Create Category" breadcrumbs={[{ label: "Categories", href: "/categories" }, { label: "New" }]} />
      <div className="max-w-lg">
        <form action={createCategory} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <FormField label="Name" required><Input name="name" required placeholder="Laptops" /></FormField>
          <FormField label="Type" required>
            <Select name="type" required>
              <option value="asset">Asset</option>
              <option value="license">License</option>
              <option value="accessory">Accessory</option>
              <option value="consumable">Consumable</option>
              <option value="component">Component</option>
            </Select>
          </FormField>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" name="requireAcceptance" className="rounded" /> Require Acceptance
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" name="checkinEmail" className="rounded" /> Check-in Email
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" name="useDefaultEula" className="rounded" /> Use Default EULA
            </label>
          </div>
          <FormField label="Notes"><Textarea name="notes" /></FormField>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Save Category</Button>
            <Link href="/categories"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
