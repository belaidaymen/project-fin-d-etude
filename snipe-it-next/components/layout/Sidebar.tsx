"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Monitor, Package, ArrowLeftRight, ClipboardList,
  Beaker, FileText, LayoutDashboard, ChevronRight,
} from "lucide-react";

interface SidebarProps {
  role?: string;
}

const logistiqueNav = [
  { label: "Tableau de bord", href: "/logistique", icon: <LayoutDashboard size={16} /> },
  { label: "Inventaire Global", href: "/logistique/inventaire", icon: <Package size={16} /> },
  { label: "Valider les Demandes", href: "/logistique/demandes", icon: <ClipboardList size={16} /> },
];

const magasinierNav = [
  { label: "Tableau de bord", href: "/magasinier", icon: <LayoutDashboard size={16} /> },
  { label: "Équipements", href: "/magasinier/equipements", icon: <Package size={16} /> },
  { label: "Mouvements", href: "/magasinier/mouvements", icon: <ArrowLeftRight size={16} /> },
];

const laboratoireNav = [
  { label: "Tableau de bord", href: "/laboratoire", icon: <LayoutDashboard size={16} /> },
  { label: "Mon Laboratoire", href: "/laboratoire/equipements", icon: <Beaker size={16} /> },
  { label: "Mes Demandes", href: "/laboratoire/demandes", icon: <FileText size={16} /> },
];

const roleColors: Record<string, string> = {
  LOGISTIQUE: "#3c8dbc",
  MAGASINIER: "#00a65a",
  LABORATOIRE: "#f39c12",
};

const roleLabels: Record<string, string> = {
  LOGISTIQUE: "Responsable Logistique",
  MAGASINIER: "Magasinier",
  LABORATOIRE: "Resp. Laboratoire",
};

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const navItems =
    role === "LOGISTIQUE" ? logistiqueNav :
    role === "MAGASINIER" ? magasinierNav :
    role === "LABORATOIRE" ? laboratoireNav : [];

  const roleColor = role ? roleColors[role] : "#3c8dbc";

  return (
    <aside className="main-sidebar">
      <div style={{
        padding: "14px 16px",
        borderBottom: "1px solid rgba(255,255,255,.08)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 6,
          background: roleColor,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Monitor size={16} color="white" />
        </div>
        <div>
          <div style={{ color: "white", fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>GestActif</div>
          <div style={{ color: "rgba(255,255,255,.5)", fontSize: 10, lineHeight: 1.2 }}>
            Université
          </div>
        </div>
      </div>

      {role && (
        <div style={{
          padding: "10px 16px 10px",
          borderBottom: "1px solid rgba(255,255,255,.06)",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 20,
            background: roleColor + "25",
            border: `1px solid ${roleColor}50`,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: roleColor }} />
            <span style={{ color: roleColor, fontSize: 11, fontWeight: 600 }}>
              {roleLabels[role]}
            </span>
          </div>
        </div>
      )}

      <section className="sidebar">
        <ul className="sidebar-menu" style={{ paddingTop: 8 }}>
          {navItems.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href} className={isActive ? "active" : ""}>
                <Link href={item.href} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: isActive ? "white" : "rgba(255,255,255,.6)" }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {isActive && <ChevronRight size={12} style={{ marginLeft: "auto", opacity: 0.6 }} />}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </aside>
  );
}
