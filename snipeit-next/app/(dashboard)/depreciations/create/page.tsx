import { createDepreciation } from "@/lib/actions/crud";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, Input, Select, Button } from "@/components/ui/form-field";
import Link from "next/link";

export default function CreateDepreciationPage() {
  return (
    <div>
      <PageHeader title="Add Depreciation Schedule" breadcrumbs={[{ label: "Depreciations", href: "/depreciations" }, { label: "New" }]} />
      <div className="max-w-lg">
        <form action={createDepreciation} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <FormField label="Name" required><Input name="name" required placeholder="3-Year Straight Line" /></FormField>
          <FormField label="Term (months)" required><Input name="months" type="number" min="1" required defaultValue="36" placeholder="36" /></FormField>
          <FormField label="Depreciation Method">
            <Select name="type">
              <option value="straight-line">Straight Line</option>
              <option value="declining-balance">Declining Balance</option>
            </Select>
          </FormField>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Save</Button>
            <Link href="/depreciations"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
