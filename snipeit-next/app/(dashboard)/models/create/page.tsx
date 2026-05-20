import { getAllCategories, getAllManufacturers, getAllDepreciations } from "@/lib/queries";
import { createAssetModel } from "@/lib/actions/crud";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, Input, Textarea, Select, Button } from "@/components/ui/form-field";
import Link from "next/link";

export default async function CreateModelPage() {
  const [categories, manufacturers, depreciations] = await Promise.all([
    getAllCategories("asset"), getAllManufacturers(), getAllDepreciations(),
  ]);
  return (
    <div>
      <PageHeader title="Add Asset Model" breadcrumbs={[{ label: "Models", href: "/models" }, { label: "New" }]} />
      <div className="max-w-lg">
        <form action={createAssetModel} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Model Name" required><Input name="name" required placeholder='MacBook Pro 14"' /></FormField>
            <FormField label="Model Number"><Input name="modelNumber" placeholder="MKGP3LL/A" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category">
              <Select name="categoryId"><option value="">— None —</option>
                {(categories as any[]).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Manufacturer">
              <Select name="manufacturerId"><option value="">— None —</option>
                {(manufacturers as any[]).map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="EOL (months)" hint="End of life in months"><Input name="eol" type="number" min="0" placeholder="36" /></FormField>
            <FormField label="Depreciation">
              <Select name="depreciationId"><option value="">— None —</option>
                {(depreciations as any[]).map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </FormField>
          </div>
          <FormField label="Notes"><Textarea name="notes" /></FormField>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" name="requestable" className="rounded" /> Requestable</label>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Save Model</Button>
            <Link href="/models"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
