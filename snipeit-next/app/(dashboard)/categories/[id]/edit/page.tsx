import { getCategory } from "@/lib/queries";
import { updateCategory } from "@/lib/actions/crud";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, Input, Textarea, Select, Button } from "@/components/ui/form-field";
import Link from "next/link";

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const cat = await getCategory(parseInt(params.id));
  if (!cat) notFound();
  return (
    <div>
      <PageHeader title={`Edit: ${cat.name}`} breadcrumbs={[{ label: "Categories", href: "/categories" }, { label: "Edit" }]} />
      <div className="max-w-lg">
        <form action={updateCategory.bind(null, cat.id)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <FormField label="Name" required><Input name="name" required defaultValue={cat.name} /></FormField>
          <FormField label="Type" required>
            <Select name="type" required>
              {["asset","license","accessory","consumable","component"].map(t => (
                <option key={t} value={t} selected={cat.type === t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
              ))}
            </Select>
          </FormField>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" name="requireAcceptance" className="rounded" defaultChecked={cat.requireAcceptance} /> Require Acceptance
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" name="checkinEmail" className="rounded" defaultChecked={cat.checkinEmail} /> Check-in Email
            </label>
          </div>
          <FormField label="Notes"><Textarea name="notes" defaultValue={cat.notes ?? ""} /></FormField>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Update Category</Button>
            <Link href="/categories"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
