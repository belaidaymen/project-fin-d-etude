import { getAssetModel, getAllCategories, getAllManufacturers, getAllDepreciations } from "@/lib/queries";
import { updateAssetModel } from "@/lib/actions/crud";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, Input, Textarea, Select, Button } from "@/components/ui/form-field";
import Link from "next/link";

export default async function EditModelPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const [model, categories, manufacturers, depreciations] = await Promise.all([
    getAssetModel(id), getAllCategories("asset"), getAllManufacturers(), getAllDepreciations(),
  ]);
  if (!model) notFound();
  return (
    <div>
      <PageHeader title={`Edit: ${model.name}`} breadcrumbs={[{ label: "Models", href: "/models" }, { label: "Edit" }]} />
      <div className="max-w-lg">
        <form action={updateAssetModel.bind(null, model.id)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Model Name" required><Input name="name" required defaultValue={model.name} /></FormField>
            <FormField label="Model Number"><Input name="modelNumber" defaultValue={model.modelNumber ?? ""} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category">
              <Select name="categoryId"><option value="">— None —</option>
                {(categories as any[]).map((c: any) => <option key={c.id} value={c.id} selected={c.id === model.categoryId}>{c.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Manufacturer">
              <Select name="manufacturerId"><option value="">— None —</option>
                {(manufacturers as any[]).map((m: any) => <option key={m.id} value={m.id} selected={m.id === model.manufacturerId}>{m.name}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="EOL (months)"><Input name="eol" type="number" defaultValue={model.eol ?? ""} /></FormField>
            <FormField label="Depreciation">
              <Select name="depreciationId"><option value="">— None —</option>
                {(depreciations as any[]).map((d: any) => <option key={d.id} value={d.id} selected={d.id === model.depreciationId}>{d.name}</option>)}
              </Select>
            </FormField>
          </div>
          <FormField label="Notes"><Textarea name="notes" defaultValue={model.notes ?? ""} /></FormField>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" name="requestable" className="rounded" defaultChecked={model.requestable} /> Requestable
          </label>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Update Model</Button>
            <Link href="/models"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
