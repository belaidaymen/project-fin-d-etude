"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#ecf0f5" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className={`wrapper skin-blue ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar />
      <Header onToggleSidebar={() => setSidebarCollapsed(p => !p)} />
      <div className="content-wrapper">
        {children}
      </div>
      <footer className="main-footer" style={{ marginLeft: sidebarCollapsed ? 0 : 230, transition: "margin-left .3s" }}>
        <strong>Copyright &copy; 2024 <a href="#">Snipe-IT</a>.</strong> All rights reserved.
        <div className="pull-right hidden-xs" style={{ float: "right" }}>
          Version <b>7.0.0-nextjs</b>
        </div>
      </footer>
    </div>
  );
}
