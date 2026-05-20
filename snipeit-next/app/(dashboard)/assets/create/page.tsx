import { getAllModels, getAllStatusLabels, getAllCompanies, getAllLocations, getAllSuppliers } from "@/lib/queries";
import { PageHeader } from "@/components/ui/page-header";
import { createAsset } from "@/lib/actions/assets";
import { FormField, Input, Textarea, Select, Button } from "@/components/ui/form-field";
import Link from "next/link";

export default async function CreateAssetPage() {
  const [models, statuses, companies, locations, suppliers] = await Promise.all([
    getAllModels(), getAllStatusLabels(), getAllCompanies(), getAllLocations(), getAllSuppliers(),
  ]);
  return (
    <div>
      <PageHeader title="Add Asset" breadcrumbs={[{ label: "Assets", href: "/assets" }, { label: "New Asset" }]} />
      <div className="max-w-2xl">
        <form action={createAsset} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Asset Tag" required><Input name="assetTag" required placeholder="ASSET-0001" /></FormField>
            <FormField label="Name"><Input name="name" placeholder="e.g. John's MacBook" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Model" required>
              <Select name="modelId" required>
                <option value="">— Select Model —</option>
                {(models as any[]).map((m: any) => <option key={m.id} value={m.id}>{m.name}{m.categoryName ? ` (${m.categoryName})` : ""}</option>)}
              </Select>
            </FormField>
            <FormField label="Status" required>
              <Select name="statusId" required>
                <option value="">— Select Status —</option>
                {(statuses as any[]).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Serial Number"><Input name="serial" placeholder="SN123456789" /></FormField>
            <FormField label="Order Number"><Input name="orderNumber" placeholder="PO-12345" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Purchase Cost"><Input name="purchaseCost" type="number" step="0.01" min="0" placeholder="0.00" /></FormField>
            <FormField label="Purchase Date"><Input name="purchaseDate" type="date" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Warranty (months)"><Input name="warrantyMonths" type="number" min="0" placeholder="12" /></FormField>
            <FormField label="Supplier">
              <Select name="supplierId"><option value="">— None —</option>
                {(suppliers as any[]).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Company">
              <Select name="companyId"><option value="">— None —</option>
                {(companies as any[]).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Location">
              <Select name="locationId"><option value="">— None —</option>
                {(locations as any[]).map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </Select>
            </FormField>
          </div>
          <FormField label="RTD Location" hint="Where the asset returns after check-in">
            <Select name="rtdLocationId"><option value="">— None —</option>
              {(locations as any[]).map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Notes"><Textarea name="notes" /></FormField>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" name="requestable" className="rounded" /> Requestable</label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" name="byod" className="rounded" /> BYOD</label>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Save Asset</Button>
            <Link href="/assets"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
