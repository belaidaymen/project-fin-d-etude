import { getAllCategories } from "@/lib/queries";
import { createConsumable } from "@/lib/actions/crud";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, Input, Textarea, Select, Button } from "@/components/ui/form-field";
import Link from "next/link";

export default async function CreateConsumablePage() {
  const categories = await getAllCategories("consumable");
  return (
    <div>
      <PageHeader title="Add Consumable" breadcrumbs={[{ label: "Consumables", href: "/consumables" }, { label: "New" }]} />
      <div className="max-w-2xl">
        <form action={createConsumable} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Name" required><Input name="name" required placeholder="HP 58A Toner" /></FormField>
            <FormField label="Item No / Model"><Input name="itemNo" placeholder="CF258A" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Quantity" required><Input name="qty" type="number" min="0" defaultValue="0" required /></FormField>
            <FormField label="Minimum Qty"><Input name="minAmt" type="number" min="0" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category">
              <Select name="categoryId"><option value="">— None —</option>
                {(categories as any[]).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Purchase Cost"><Input name="purchaseCost" type="number" step="0.01" placeholder="0.00" /></FormField>
          </div>
          <FormField label="Notes"><Textarea name="notes" /></FormField>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Save Consumable</Button>
            <Link href="/consumables"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
