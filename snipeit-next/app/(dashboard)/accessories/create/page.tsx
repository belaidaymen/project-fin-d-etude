import { getAllCategories, getAllCompanies, getAllSuppliers, getAllManufacturers, getAllLocations } from "@/lib/queries";
import { createAccessory } from "@/lib/actions/crud";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, Input, Textarea, Select, Button } from "@/components/ui/form-field";
import Link from "next/link";

export default async function CreateAccessoryPage() {
  const [categories, companies, suppliers, manufacturers, locations] = await Promise.all([
    getAllCategories("accessory"), getAllCompanies(), getAllSuppliers(), getAllManufacturers(), getAllLocations(),
  ]);
  return (
    <div>
      <PageHeader title="Add Accessory" breadcrumbs={[{ label: "Accessories", href: "/accessories" }, { label: "New" }]} />
      <div className="max-w-2xl">
        <form action={createAccessory} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Name" required><Input name="name" required placeholder="MX Keys Keyboard" /></FormField>
            <FormField label="Model Number"><Input name="modelNumber" placeholder="920-009295" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Quantity" required><Input name="qty" type="number" min="0" defaultValue="0" required /></FormField>
            <FormField label="Minimum Quantity" hint="For low stock alert"><Input name="minAmt" type="number" min="0" /></FormField>
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
            <FormField label="Purchase Cost"><Input name="purchaseCost" type="number" step="0.01" placeholder="0.00" /></FormField>
            <FormField label="Order Number"><Input name="orderNumber" placeholder="PO-12345" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Supplier">
              <Select name="supplierId"><option value="">— None —</option>
                {(suppliers as any[]).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Location">
              <Select name="locationId"><option value="">— None —</option>
                {(locations as any[]).map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </Select>
            </FormField>
          </div>
          <FormField label="Notes"><Textarea name="notes" /></FormField>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" name="requestable" className="rounded" /> Requestable</label>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Save Accessory</Button>
            <Link href="/accessories"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
