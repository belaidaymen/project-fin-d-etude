"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Monitor, Package, MapPin, ArrowLeftRight, Wrench,
  ClipboardList, Truck, Users, BarChart2, Settings,
  ChevronDown, ChevronRight, FlaskConical, PlusCircle, List
} from "lucide-react";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: { label: string; href: string; icon?: React.ReactNode }[];
  roles?: string[];
}

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
          <li key={child.href} className={pathname === child.href || pathname.startsWith(child.href + "/") ? "active" : ""}>
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
  const { data: session } = useSession();
  const role = (session?.user as any)?.role ?? "";

  const setCollapsed = (key: string, val: boolean) => {
    setCollapsedState(prev => ({ ...prev, [key]: !val }));
  };

  const commonItems: NavItem[] = [
    {
      label: "Tableau de bord",
      href: "/dashboard",
      icon: <Monitor size={16} />,
    },
  ];

  const equipementItems: NavItem[] = [
    {
      label: "Équipements",
      icon: <Package size={16} />,
      children: [
        { label: "Liste des équipements", href: "/equipements" },
        ...(role === "MAGASINIER" || role === "ADMIN" || role === "LOGISTICIEN"
          ? [{ label: "Nouvel équipement", href: "/equipements/create" }]
          : []),
      ],
    },
    {
      label: "Localisations",
      icon: <MapPin size={16} />,
      children: [
        { label: "Toutes les localisations", href: "/localisations" },
        ...(role === "ADMIN" || role === "LOGISTICIEN"
          ? [{ label: "Nouvelle localisation", href: "/localisations/create" }]
          : []),
      ],
    },
    {
      label: "Affectations",
      icon: <List size={16} />,
      children: [
        { label: "Liste des affectations", href: "/affectations" },
        ...(role === "MAGASINIER" || role === "ADMIN" || role === "LOGISTICIEN"
          ? [{ label: "Nouvelle affectation", href: "/affectations/create" }]
          : []),
      ],
    },
  ];

  const magasinierItems: NavItem[] = [
    {
      label: "Mouvements",
      icon: <ArrowLeftRight size={16} />,
      children: [
        { label: "Liste des mouvements", href: "/mouvements" },
        { label: "Nouveau mouvement", href: "/mouvements/create" },
      ],
    },
    {
      label: "Maintenances",
      icon: <Wrench size={16} />,
      children: [
        { label: "Liste des maintenances", href: "/maintenances" },
        { label: "Nouvelle maintenance", href: "/maintenances/create" },
      ],
    },
    {
      label: "Fournisseurs",
      icon: <Truck size={16} />,
      children: [
        { label: "Liste des fournisseurs", href: "/fournisseurs" },
        { label: "Nouveau fournisseur", href: "/fournisseurs/create" },
      ],
    },
  ];

  const logisticienItems: NavItem[] = [
    {
      label: "Mouvements",
      icon: <ArrowLeftRight size={16} />,
      href: "/mouvements",
    },
    {
      label: "Maintenances",
      icon: <Wrench size={16} />,
      href: "/maintenances",
    },
    {
      label: "Fournisseurs",
      icon: <Truck size={16} />,
      href: "/fournisseurs",
    },
  ];

  const chefLaboItems: NavItem[] = [
    {
      label: "Maintenances",
      icon: <Wrench size={16} />,
      href: "/maintenances",
    },
  ];

  const demandesItems: NavItem[] = [
    {
      label: "Demandes",
      icon: <ClipboardList size={16} />,
      children: [
        { label: "Toutes les demandes", href: "/demandes" },
        { label: "Nouvelle demande", href: "/demandes/create" },
      ],
    },
  ];

  const adminItems: NavItem[] = [
    {
      label: "Catégories",
      icon: <List size={16} />,
      href: "/categories",
    },
    {
      label: "Utilisateurs",
      icon: <Users size={16} />,
      children: [
        { label: "Liste des utilisateurs", href: "/utilisateurs" },
        { label: "Nouvel utilisateur", href: "/utilisateurs/create" },
      ],
    },
    {
      label: "Rapports",
      icon: <BarChart2 size={16} />,
      href: "/rapports",
    },
    {
      label: "Paramètres",
      icon: <Settings size={16} />,
      href: "/parametres",
    },
  ];

  const logisticienAdminItems: NavItem[] = [
    {
      label: "Catégories",
      icon: <List size={16} />,
      href: "/categories",
    },
    {
      label: "Utilisateurs",
      icon: <Users size={16} />,
      href: "/utilisateurs",
    },
    {
      label: "Rapports",
      icon: <BarChart2 size={16} />,
      href: "/rapports",
    },
  ];

  const getRoleSpecificItems = () => {
    if (role === "ADMIN") return [...magasinierItems, ...adminItems];
    if (role === "LOGISTICIEN") return [...logisticienItems, ...logisticienAdminItems];
    if (role === "MAGASINIER") return magasinierItems;
    if (role === "CHEF_LABO") return chefLaboItems;
    return [];
  };

  return (
    <aside className="main-sidebar">
      <div style={{ padding: "10px 15px", borderBottom: "1px solid rgba(255,255,255,.1)" }}>
        <Link href="/dashboard" style={{ color: "white", textDecoration: "none", fontSize: 20, fontWeight: 300 }}>
          <b style={{ fontWeight: 700 }}>Gest</b>Actifs
        </Link>
      </div>

      <section className="sidebar">
        <ul className="sidebar-menu">
          {commonItems.map(item => (
            <NavItemRow key={item.label} item={item} collapsed={collapsed} setCollapsed={setCollapsed} />
          ))}

          <li className="header">INVENTAIRE</li>
          {equipementItems.map(item => (
            <NavItemRow key={item.label} item={item} collapsed={collapsed} setCollapsed={setCollapsed} />
          ))}

          {demandesItems.map(item => (
            <NavItemRow key={item.label} item={item} collapsed={collapsed} setCollapsed={setCollapsed} />
          ))}

          <li className="header">GESTION</li>
          {getRoleSpecificItems().map(item => (
            <NavItemRow key={item.label} item={item} collapsed={collapsed} setCollapsed={setCollapsed} />
          ))}
        </ul>
      </section>
    </aside>
  );
}
