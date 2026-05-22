"use client";

import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { Menu, User, LogOut, ChevronDown, Building2 } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
  role?: string;
  roleLabel?: string;
}

const roleColors: Record<string, string> = {
  LOGISTIQUE: "#3c8dbc",
  MAGASINIER: "#00a65a",
  LABORATOIRE: "#f39c12",
};

export default function Header({ onToggleSidebar, role, roleLabel }: HeaderProps) {
  const { data: session } = useSession();
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const roleColor = role ? roleColors[role] : "#3c8dbc";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="main-header" style={{ background: roleColor }}>
      <button className="sidebar-toggle" onClick={onToggleSidebar} title="Réduire le menu">
        <Menu size={18} />
      </button>

      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "0 16px" }}>
        <Building2 size={15} style={{ color: "rgba(255,255,255,.7)" }} />
        <span style={{ color: "rgba(255,255,255,.85)", fontSize: 13 }}>
          Gestion des Actifs — Université
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, paddingRight: 12 }}>
        <div ref={userRef} style={{ position: "relative" }}>
          <button
            onClick={() => setUserOpen(p => !p)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(0,0,0,.15)", border: "none", color: "rgba(255,255,255,.95)",
              borderRadius: 4, padding: "6px 12px", cursor: "pointer", fontSize: 13,
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "rgba(255,255,255,.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 12,
              border: "2px solid rgba(255,255,255,.3)",
            }}>
              {session?.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 600, lineHeight: 1.2 }}>
                {session?.user?.name ?? "Utilisateur"}
              </div>
              <div style={{ fontSize: 10, opacity: 0.75, lineHeight: 1.2 }}>{roleLabel}</div>
            </div>
            <ChevronDown size={12} style={{ opacity: 0.7 }} />
          </button>

          {userOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", right: 0, minWidth: 220,
              background: "#fff", borderRadius: 6, boxShadow: "0 4px 16px rgba(0,0,0,.15)",
              zIndex: 1000, overflow: "hidden",
            }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
                <div style={{ fontWeight: 600, color: "#333", fontSize: 14 }}>
                  {session?.user?.name ?? "Utilisateur"}
                </div>
                <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>
                  {session?.user?.email ?? ""}
                </div>
                <div style={{
                  marginTop: 6, display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                  background: roleColor + "15", color: roleColor,
                  border: `1px solid ${roleColor}30`,
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: roleColor }} />
                  {roleLabel}
                </div>
              </div>

              <div style={{ borderTop: "1px solid #f0f0f0" }} />
              <button
                onClick={() => { setUserOpen(false); signOut({ callbackUrl: "/login" }); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
                  color: "#d9534f", background: "none", border: "none", width: "100%",
                  textAlign: "left", fontSize: 14, cursor: "pointer",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#fff5f5")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <LogOut size={15} /> Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
