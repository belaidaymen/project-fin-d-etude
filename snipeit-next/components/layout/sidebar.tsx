"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Package, Users, Key, Keyboard, Box, Cpu, MapPin,
  Building2, Tags, Factory, Truck, LayoutDashboard,
  BarChart3, Settings, ChevronDown, ChevronRight, Tag,
  Layers, Wrench, FileText, ShieldCheck
} from "lucide-react";
import { useState } from "react";

const navGroups = [
  {
    label: null,
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Assets",
    items: [
      { href: "/assets", label: "Assets", icon: Package },
      { href: "/models", label: "Asset Models", icon: Layers },
      { href: "/statuslabels", label: "Status Labels", icon: Tag },
    ],
  },
  {
    label: "Inventory",
    items: [
      { href: "/licenses", label: "Licenses", icon: Key },
      { href: "/accessories", label: "Accessories", icon: Keyboard },
      { href: "/consumables", label: "Consumables", icon: Box },
      { href: "/components", label: "Components", icon: Cpu },
    ],
  },
  {
    label: "People & Places",
    items: [
      { href: "/users", label: "Users", icon: Users },
      { href: "/locations", label: "Locations", icon: MapPin },
      { href: "/departments", label: "Departments", icon: Building2 },
      { href: "/companies", label: "Companies", icon: Building2 },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/categories", label: "Categories", icon: Tags },
      { href: "/manufacturers", label: "Manufacturers", icon: Factory },
      { href: "/suppliers", label: "Suppliers", icon: Truck },
      { href: "/depreciations", label: "Depreciations", icon: BarChart3 },
    ],
  },
  {
    label: "Reports",
    items: [
      { href: "/reports/activity", label: "Activity Log", icon: FileText },
      { href: "/reports/maintenance", label: "Maintenance", icon: Wrench },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/groups", label: "Groups", icon: ShieldCheck },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-60 flex flex-col" style={{ background: "hsl(var(--sidebar-background))" }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="bg-blue-500 rounded-lg p-1.5">
          <Package className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-base leading-tight">Snipe-IT</div>
          <div className="text-blue-300 text-xs">Asset Management</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navGroups.map((group, gi) => (
          <div key={gi} className={gi > 0 ? "pt-3" : ""}>
            {group.label && (
              <p className="sidebar-section-label">{group.label}</p>
            )}
            {group.items.map((item) => {
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn("sidebar-link", active && "active")}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
