import { getSetting, getSettings } from "@/lib/queries";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { queryCount } from "@/lib/db";
import { FormField, Input, Select, Button } from "@/components/ui/form-field";

async function saveSettings(formData: FormData) {
  "use server";
  const keys = ["site_name", "site_url", "currency", "per_page", "date_display_format"];
  for (const key of keys) {
    const value = formData.get(key) as string ?? "";
    await db.query(
      `INSERT INTO "Setting" (key, value, "updatedAt") VALUES ($1,$2,NOW()) ON CONFLICT (key) DO UPDATE SET value=$2, "updatedAt"=NOW()`,
      [key, value]
    );
  }
  revalidatePath("/settings");
  redirect("/settings");
}

export default async function SettingsPage() {
  const [siteName, siteUrl, currency, perPage] = await Promise.all([
    getSetting("site_name", "Snipe-IT"),
    getSetting("site_url", ""),
    getSetting("currency", "USD"),
    getSetting("per_page", "25"),
  ]);

  const [assets, users, licenses, categories, manufacturers, suppliers, locations, companies] = await Promise.all([
    queryCount(`SELECT COUNT(*) FROM "Asset" WHERE "deletedAt" IS NULL`),
    queryCount(`SELECT COUNT(*) FROM "User" WHERE "deletedAt" IS NULL`),
    queryCount(`SELECT COUNT(*) FROM "License" WHERE "deletedAt" IS NULL`),
    queryCount(`SELECT COUNT(*) FROM "Category" WHERE "deletedAt" IS NULL`),
    queryCount(`SELECT COUNT(*) FROM "Manufacturer" WHERE "deletedAt" IS NULL`),
    queryCount(`SELECT COUNT(*) FROM "Supplier" WHERE "deletedAt" IS NULL`),
    queryCount(`SELECT COUNT(*) FROM "Location" WHERE "deletedAt" IS NULL`),
    queryCount(`SELECT COUNT(*) FROM "Company" WHERE "deletedAt" IS NULL`),
  ]);

  const stats = [assets, users, licenses, categories, manufacturers, suppliers, locations, companies];

  return (
    <div>
      <PageHeader title="Settings" description="Configure application preferences"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form action={saveSettings} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h2 className="font-semibold text-gray-800 mb-4">General Settings</h2>
            <FormField label="Site Name" hint="Displayed in the browser tab and header">
              <Input name="site_name" defaultValue={siteName} placeholder="Snipe-IT" />
            </FormField>
            <FormField label="Site URL">
              <Input name="site_url" type="url" defaultValue={siteUrl} placeholder="https://assets.example.com" />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Currency">
                <Select name="currency">
                  {["USD","EUR","GBP","CAD","AUD","JPY","CNY"].map(c => (
                    <option key={c} value={c} selected={currency === c}>{c}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Items Per Page">
                <Select name="per_page">
                  {["10","25","50","100"].map(n => (
                    <option key={n} value={n} selected={perPage === n}>{n}</option>
                  ))}
                </Select>
              </FormField>
            </div>
            <FormField label="Date Format">
              <Select name="date_display_format">
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MMM D, YYYY">MMM D, YYYY</option>
              </Select>
            </FormField>
            <div className="pt-2 border-t border-gray-100">
              <Button type="submit" variant="primary">Save Settings</Button>
            </div>
          </form>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Database Stats</h2>
            <div className="space-y-2">
              {["Assets","Users","Licenses","Categories","Manufacturers","Suppliers","Locations","Companies"].map((label, i) => (
                <div key={label} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className="text-sm font-semibold text-gray-800">{stats[i].toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Application Info</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between"><span>Version</span><span className="font-medium text-gray-800">1.0.0</span></div>
              <div className="flex justify-between"><span>Framework</span><span className="font-medium text-gray-800">Next.js 14</span></div>
              <div className="flex justify-between"><span>Database</span><span className="font-medium text-gray-800">PostgreSQL</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
