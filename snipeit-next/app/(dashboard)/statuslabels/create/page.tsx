import { createStatusLabel } from "@/lib/actions/crud";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, Input, Textarea, Select, Button } from "@/components/ui/form-field";
import Link from "next/link";

export default function CreateStatusLabelPage() {
  return (
    <div>
      <PageHeader title="Create Status Label" breadcrumbs={[{ label: "Status Labels", href: "/statuslabels" }, { label: "New" }]} />
      <div className="max-w-lg">
        <form action={createStatusLabel} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <FormField label="Name" required><Input name="name" required placeholder="Ready to Deploy" /></FormField>
          <FormField label="Type" required>
            <Select name="type" required>
              <option value="deployable">Deployable</option>
              <option value="pending">Pending</option>
              <option value="archived">Archived</option>
              <option value="undeployable">Undeployable</option>
            </Select>
          </FormField>
          <FormField label="Color" hint="Hex color code"><Input name="color" type="color" defaultValue="#28a745" className="h-10 px-1 py-0.5" /></FormField>
          <FormField label="Notes"><Textarea name="notes" /></FormField>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" name="showInNav" defaultChecked className="rounded" /> Show in Navigation
          </label>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Save Status Label</Button>
            <Link href="/statuslabels"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
