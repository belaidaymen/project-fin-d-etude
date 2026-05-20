import { getAllCategories, getAllManufacturers, getAllSuppliers, getAllCompanies } from "@/lib/queries";
import { createLicense } from "@/lib/actions/crud";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, Input, Textarea, Select, Button } from "@/components/ui/form-field";
import Link from "next/link";

export default async function CreateLicensePage() {
  const [categories, manufacturers, suppliers, companies] = await Promise.all([
    getAllCategories("license"), getAllManufacturers(), getAllSuppliers(), getAllCompanies(),
  ]);
  return (
    <div>
      <PageHeader title="Add License" breadcrumbs={[{ label: "Licenses", href: "/licenses" }, { label: "New License" }]} />
      <div className="max-w-2xl">
        <form action={createLicense} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <FormField label="License Name" required><Input name="name" required placeholder="e.g. Adobe Creative Cloud" /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="License Key / Serial"><Input name="serial" placeholder="XXXX-XXXX-XXXX-XXXX" /></FormField>
            <FormField label="Seats" required><Input name="seats" type="number" min="1" defaultValue="1" required /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Licensed To (Name)"><Input name="licensedTo" placeholder="Acme Corporation" /></FormField>
            <FormField label="Licensed To (Email)"><Input name="licenseEmail" type="email" placeholder="licenses@acme.com" /></FormField>
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
            <FormField label="Supplier">
              <Select name="supplierId"><option value="">— None —</option>
                {(suppliers as any[]).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Company">
              <Select name="companyId"><option value="">— None —</option>
                {(companies as any[]).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Purchase Cost"><Input name="purchaseCost" type="number" step="0.01" placeholder="0.00" /></FormField>
            <FormField label="Purchase Date"><Input name="purchaseDate" type="date" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Expiration Date"><Input name="expirationDate" type="date" /></FormField>
            <FormField label="Order Number"><Input name="orderNumber" placeholder="PO-12345" /></FormField>
          </div>
          <FormField label="Notes"><Textarea name="notes" /></FormField>
          <div className="flex items-center gap-5">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" name="reassignable" defaultChecked className="rounded" /> Reassignable</label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" name="maintained" className="rounded" /> Under Maintenance</label>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Save License</Button>
            <Link href="/licenses"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
