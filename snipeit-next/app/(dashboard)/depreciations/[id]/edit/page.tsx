import { getDepreciation } from "@/lib/queries";
import { updateDepreciation } from "@/lib/actions/crud";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, Input, Select, Button } from "@/components/ui/form-field";
import Link from "next/link";

export default async function EditDepreciationPage({ params }: { params: { id: string } }) {
  const d = await getDepreciation(parseInt(params.id));
  if (!d) notFound();
  return (
    <div>
      <PageHeader title={`Edit: ${d.name}`} breadcrumbs={[{ label: "Depreciations", href: "/depreciations" }, { label: "Edit" }]} />
      <div className="max-w-lg">
        <form action={updateDepreciation.bind(null, d.id)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <FormField label="Name" required><Input name="name" required defaultValue={d.name} /></FormField>
          <FormField label="Term (months)" required><Input name="months" type="number" min="1" required defaultValue={d.months} /></FormField>
          <FormField label="Method">
            <Select name="type">
              <option value="straight-line" selected={d.type === "straight-line"}>Straight Line</option>
              <option value="declining-balance" selected={d.type === "declining-balance"}>Declining Balance</option>
            </Select>
          </FormField>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Update</Button>
            <Link href="/depreciations"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
