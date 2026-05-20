import { getLocation, getAllLocations } from "@/lib/queries";
import { updateLocation } from "@/lib/actions/crud";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { FormField, Input, Select, Button } from "@/components/ui/form-field";
import Link from "next/link";

export default async function EditLocationPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const [loc, allLocs] = await Promise.all([getLocation(id), getAllLocations()]);
  if (!loc) notFound();
  const otherLocs = (allLocs as any[]).filter((l: any) => l.id !== id);
  return (
    <div>
      <PageHeader title={`Edit: ${loc.name}`} breadcrumbs={[{ label: "Locations", href: "/locations" }, { label: "Edit" }]} />
      <div className="max-w-lg">
        <form action={updateLocation.bind(null, loc.id)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <FormField label="Name" required><Input name="name" required defaultValue={loc.name} /></FormField>
          <FormField label="Parent Location">
            <Select name="parentId"><option value="">— None —</option>
              {otherLocs.map((l: any) => <option key={l.id} value={l.id} selected={l.id === loc.parentId}>{l.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Address"><Input name="address" defaultValue={loc.address ?? ""} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="City"><Input name="city" defaultValue={loc.city ?? ""} /></FormField>
            <FormField label="State"><Input name="state" defaultValue={loc.state ?? ""} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Zip"><Input name="zip" defaultValue={loc.zip ?? ""} /></FormField>
            <FormField label="Country"><Input name="country" defaultValue={loc.country ?? ""} /></FormField>
          </div>
          <FormField label="Phone"><Input name="phone" defaultValue={loc.phone ?? ""} /></FormField>
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button type="submit" variant="primary">Update Location</Button>
            <Link href="/locations"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
