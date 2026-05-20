import { getStatusLabel } from "@/lib/queries";
import { updateStatusLabel } from "@/lib/actions/crud";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, Input, Textarea, Select, Button } from "@/components/ui/form-field";
import Link from "next/link";

export default async function EditStatusLabelPage({ params }: { params: { id: string } }) {
  const sl = await getStatusLabel(parseInt(params.id));
  if (!sl) notFound();
  return (
    <div>
      <PageHeader title={`Edit: ${sl.name}`} breadcrumbs={[{ label: "Status Labels", href: "/statuslabels" }, { label: "Edit" }]} />
      <div className="max-w-lg">
        <form action={updateStatusLabel.bind(null, sl.id)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <FormField label="Name" required><Input name="name" required defaultValue={sl.name} /></FormField>
          <FormField label="Type" required>
            <Select name="type" required>
              {["deployable","pending","archived","undeployable"].map(t => (
                <option key={t} value={t} selected={sl.type === t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Color"><Input name="color" type="color" defaultValue={sl.color ?? "#28a745"} /></FormField>
          <FormField label="Notes"><Textarea name="notes" defaultValue={sl.notes ?? ""} /></FormField>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" name="showInNav" className="rounded" defaultChecked={sl.showInNav} /> Show in Navigation
          </label>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Update Status Label</Button>
            <Link href="/statuslabels"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
