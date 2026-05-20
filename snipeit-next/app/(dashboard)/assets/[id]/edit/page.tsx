import { getAsset } from "@/lib/queries";
import { getAllModels, getAllStatusLabels, getAllCompanies, getAllLocations, getAllSuppliers } from "@/lib/queries";
import { updateAsset } from "@/lib/actions/assets";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, Input, Textarea, Select, Button } from "@/components/ui/form-field";
import Link from "next/link";

export default async function EditAssetPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const [asset, models, statuses, companies, locations, suppliers] = await Promise.all([
    getAsset(id), getAllModels(), getAllStatusLabels(), getAllCompanies(), getAllLocations(), getAllSuppliers(),
  ]);
  if (!asset) notFound();
  const fmtDate = (d: any) => d ? new Date(d).toISOString().split("T")[0] : "";
  return (
    <div>
      <PageHeader title={`Edit: ${asset.name ?? asset.assetTag}`}
        breadcrumbs={[{ label: "Assets", href: "/assets" }, { label: asset.assetTag, href: `/assets/${id}` }, { label: "Edit" }]} />
      <div className="max-w-2xl">
        <form action={updateAsset.bind(null, id)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Asset Tag" required><Input name="assetTag" required defaultValue={asset.assetTag} /></FormField>
            <FormField label="Name"><Input name="name" defaultValue={asset.name ?? ""} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Model" required>
              <Select name="modelId" required>
                <option value="">— Select Model —</option>
                {(models as any[]).map((m: any) => <option key={m.id} value={m.id} selected={m.id === asset.modelId}>{m.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Status" required>
              <Select name="statusId" required>
                <option value="">— Select Status —</option>
                {(statuses as any[]).map((s: any) => <option key={s.id} value={s.id} selected={s.id === asset.statusId}>{s.name}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Serial"><Input name="serial" defaultValue={asset.serial ?? ""} /></FormField>
            <FormField label="Order Number"><Input name="orderNumber" defaultValue={asset.orderNumber ?? ""} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Purchase Cost"><Input name="purchaseCost" type="number" step="0.01" defaultValue={asset.purchaseCost ?? ""} /></FormField>
            <FormField label="Purchase Date"><Input name="purchaseDate" type="date" defaultValue={fmtDate(asset.purchaseDate)} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Warranty (months)"><Input name="warrantyMonths" type="number" defaultValue={asset.warrantyMonths ?? ""} /></FormField>
            <FormField label="Supplier">
              <Select name="supplierId"><option value="">— None —</option>
                {(suppliers as any[]).map((s: any) => <option key={s.id} value={s.id} selected={s.id === asset.supplierId}>{s.name}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Company">
              <Select name="companyId"><option value="">— None —</option>
                {(companies as any[]).map((c: any) => <option key={c.id} value={c.id} selected={c.id === asset.companyId}>{c.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Location">
              <Select name="locationId"><option value="">— None —</option>
                {(locations as any[]).map((l: any) => <option key={l.id} value={l.id} selected={l.id === asset.locationId}>{l.name}</option>)}
              </Select>
            </FormField>
          </div>
          <FormField label="Notes"><Textarea name="notes" defaultValue={asset.notes ?? ""} /></FormField>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" name="requestable" className="rounded" defaultChecked={asset.requestable} /> Requestable</label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" name="byod" className="rounded" defaultChecked={asset.byod} /> BYOD</label>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Update Asset</Button>
            <Link href={`/assets/${id}`}><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
