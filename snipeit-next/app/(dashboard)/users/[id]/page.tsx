import { getUser } from "@/lib/actions/users";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency, getStatusColor } from "@/lib/utils";
import Link from "next/link";
import { deleteUser } from "@/lib/actions/users";
import { DeleteButton } from "@/components/shared/delete-button";
import { User, Package, Key, Keyboard, Building2, MapPin, Phone, Mail, Briefcase } from "lucide-react";

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const user = await getUser(parseInt(params.id));
  if (!user) notFound();

  return (
    <div>
      <PageHeader
        title={`${user.firstName} ${user.lastName}`}
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Users", href: "/users" }, { label: user.username }]}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/users/${user.id}/edit`} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium px-3 py-1.5 rounded-lg">
              Edit
            </Link>
            <DeleteButton action={deleteUser.bind(null, user.id)} label="Delete User" />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <h2 className="text-lg font-bold text-gray-900">{user.firstName} {user.lastName}</h2>
            <p className="text-sm text-gray-500">{user.jobtitle ?? "No title"}</p>
            <div className="flex justify-center gap-2 mt-3">
              {user.isAdmin && <Badge variant="info">Admin</Badge>}
              {user.isSuperUser && <Badge variant="warning">Super User</Badge>}
              {user.vip && <Badge variant="secondary">VIP</Badge>}
              {user.remote && <Badge variant="secondary">Remote</Badge>}
              <Badge variant={user.activated ? "success" : "danger"}>{user.activated ? "Active" : "Inactive"}</Badge>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            {user.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                <a href={`mailto:${user.email}`} className="hover:text-blue-600">{user.email}</a>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                {user.phone}
              </div>
            )}
            {user.employeeNum && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase className="h-4 w-4 text-gray-400 shrink-0" />
                Employee #{user.employeeNum}
              </div>
            )}
            {user.company && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
                {user.company.name}
              </div>
            )}
            {user.department && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
                {user.department.name}
              </div>
            )}
            {user.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                {user.location.name}
              </div>
            )}
            {user.manager && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4 text-gray-400 shrink-0" />
                Manager: {user.manager.firstName} {user.manager.lastName}
              </div>
            )}
          </div>
        </div>

        {/* Assets + Licenses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assigned Assets */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-400" />
                Assigned Assets ({user.assignedAssets.length})
              </h2>
            </div>
            {user.assignedAssets.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-400">No assets assigned.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {user.assignedAssets.map(asset => (
                  <Link key={asset.id} href={`/assets/${asset.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{asset.name ?? asset.assetTag}</p>
                      <p className="text-xs text-gray-400 font-mono">{asset.assetTag} · {asset.model?.name}</p>
                    </div>
                    {asset.status && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(asset.status.type)}`}>
                        {asset.status.name}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Licenses */}
          {user.licenseSeatUsers.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Key className="h-4 w-4 text-gray-400" />
                  Licenses ({user.licenseSeatUsers.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-50">
                {user.licenseSeatUsers.map(seat => (
                  <div key={seat.id} className="px-5 py-3">
                    <p className="text-sm font-medium text-gray-700">{seat.license.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accessories */}
          {user.accessoryCheckouts.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Keyboard className="h-4 w-4 text-gray-400" />
                  Accessories ({user.accessoryCheckouts.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-50">
                {user.accessoryCheckouts.map(checkout => (
                  <div key={checkout.id} className="px-5 py-3 flex justify-between">
                    <p className="text-sm font-medium text-gray-700">{checkout.accessory.name}</p>
                    <span className="text-xs text-gray-400">Qty: {checkout.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
