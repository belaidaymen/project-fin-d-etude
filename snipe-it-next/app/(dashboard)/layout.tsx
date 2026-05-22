"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#ecf0f5" }}>
        <div style={{ textAlign: "center" }}>
          <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          <div style={{ marginTop: 12, color: "#777", fontSize: 14 }}>Chargement...</div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  const role = (session?.user as any)?.role;
  const roleLabel =
    role === "LOGISTIQUE" ? "Responsable Logistique" :
    role === "MAGASINIER" ? "Magasinier" :
    role === "LABORATOIRE" ? "Responsable Laboratoire" : "";

  return (
    <div className={`wrapper skin-blue ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar role={role} />
      <Header
        onToggleSidebar={() => setSidebarCollapsed(p => !p)}
        role={role}
        roleLabel={roleLabel}
      />
      <div className="content-wrapper">
        {children}
      </div>
      <footer className="main-footer" style={{ marginLeft: sidebarCollapsed ? 0 : 230, transition: "margin-left .3s" }}>
        <strong>GestActif</strong> — Gestion des Actifs Universitaires
        <div className="pull-right hidden-xs" style={{ float: "right", color: "#999" }}>
          v1.0.0
        </div>
      </footer>
    </div>
  );
}
