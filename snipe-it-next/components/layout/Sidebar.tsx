"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Laptop, FileText, Package, Cpu, Users, MapPin, Tag,
  Building, Truck, Briefcase, BarChart2, Settings,
  ChevronDown, ChevronRight, Layers, Monitor,
  ShoppingCart, Wrench
} from "lucide-react";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <Monitor size={16} />,
  },
  {
    label: "Assets",
    icon: <Laptop size={16} />,
    children: [
      { label: "List All Assets", href: "/hardware" },
      { label: "Create Asset", href: "/hardware/create" },
      { label: "Asset Models", href: "/models" },
      { label: "Categories", href: "/categories" },
      { label: "Manufacturers", href: "/manufacturers" },
      { label: "Suppliers", href: "/suppliers" },
      { label: "Depreciation", href: "/depreciations" },
      { label: "Status Labels", href: "/statuslabels" },
      { label: "Maintenances", href: "/maintenances" },
    ],
  },
  {
    label: "Licenses",
    icon: <FileText size={16} />,
    children: [
      { label: "List All Licenses", href: "/licenses" },
      { label: "Create License", href: "/licenses/create" },
    ],
  },
  {
    label: "Accessories",
    icon: <Package size={16} />,
    children: [
      { label: "List All Accessories", href: "/accessories" },
      { label: "Create Accessory", href: "/accessories/create" },
    ],
  },
  {
    label: "Consumables",
    icon: <ShoppingCart size={16} />,
    children: [
      { label: "List All Consumables", href: "/consumables" },
      { label: "Create Consumable", href: "/consumables/create" },
    ],
  },
  {
    label: "Components",
    icon: <Cpu size={16} />,
    children: [
      { label: "List All Components", href: "/components" },
      { label: "Create Component", href: "/components/create" },
    ],
  },
];

const peopleItems: NavItem[] = [
  {
    label: "Users",
    icon: <Users size={16} />,
    children: [
      { label: "List All Users", href: "/users" },
      { label: "Create User", href: "/users/create" },
    ],
  },
  {
    label: "Locations",
    href: "/locations",
    icon: <MapPin size={16} />,
  },
  {
    label: "Departments",
    href: "/departments",
    icon: <Briefcase size={16} />,
  },
  {
    label: "Companies",
    href: "/companies",
    icon: <Building size={16} />,
  },
  {
    label: "Groups",
    href: "/groups",
    icon: <Layers size={16} />,
  },
];

const adminItems: NavItem[] = [
  {
    label: "Reports",
    href: "/reports",
    icon: <BarChart2 size={16} />,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings size={16} />,
  },
];

function NavItemRow({ item, collapsed, setCollapsed }: {
  item: NavItem;
  collapsed: Record<string, boolean>;
  setCollapsed: (key: string, val: boolean) => void;
}) {
  const pathname = usePathname();
  const key = item.label;
  const isOpen = !collapsed[key];
  const isActive = item.href
    ? pathname === item.href || pathname.startsWith(item.href + "/")
    : item.children?.some(c => pathname.startsWith(c.href));

  if (item.href && !item.children) {
    return (
      <li className={isActive ? "active" : ""}>
        <Link href={item.href}>
          {item.icon}
          <span>{item.label}</span>
        </Link>
      </li>
    );
  }

  return (
    <li className={`treeview ${isActive ? "active" : ""}`}>
      <a
        href="#"
        onClick={e => { e.preventDefault(); setCollapsed(key, !isOpen); }}
        style={{ justifyContent: "space-between" }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {item.icon}
          <span>{item.label}</span>
        </span>
        {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </a>
      <ul className={`treeview-menu ${isOpen ? "open" : ""}`}>
        {item.children?.map(child => (
          <li key={child.href} className={pathname === child.href ? "active" : ""}>
            <Link href={child.href}>
              <ChevronRight size={10} />
              {child.label}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsedState] = useState<Record<string, boolean>>({});

  const setCollapsed = (key: string, val: boolean) => {
    setCollapsedState(prev => ({ ...prev, [key]: !val }));
  };

  return (
    <aside className="main-sidebar">
      <div style={{ padding: "10px 15px", borderBottom: "1px solid rgba(255,255,255,.1)" }}>
        <Link href="/dashboard" style={{ color: "white", textDecoration: "none", fontSize: 20, fontWeight: 300 }}>
          <b style={{ fontWeight: 700 }}>Snipe</b>-IT
        </Link>
      </div>

      <section className="sidebar">
        <ul className="sidebar-menu">
          {navItems.map(item => (
            <NavItemRow key={item.label} item={item} collapsed={collapsed} setCollapsed={setCollapsed} />
          ))}

          <li className="header">PEOPLE</li>
          {peopleItems.map(item => (
            <NavItemRow key={item.label} item={item} collapsed={collapsed} setCollapsed={setCollapsed} />
          ))}

          <li className="header">ADMIN</li>
          {adminItems.map(item => (
            <NavItemRow key={item.label} item={item} collapsed={collapsed} setCollapsed={setCollapsed} />
          ))}
        </ul>
      </section>
    </aside>
  );
}
