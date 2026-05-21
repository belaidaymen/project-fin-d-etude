"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Menu, Bell, Plus, Search, User, LogOut, Settings, ChevronDown } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { data: session } = useSession();
  const [userOpen, setUserOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const createRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
      if (createRef.current && !createRef.current.contains(e.target as Node)) setCreateOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="main-header">
      <button className="sidebar-toggle" onClick={onToggleSidebar} title="Toggle sidebar">
        <Menu size={18} />
      </button>

      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "0 10px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(0,0,0,.15)", borderRadius: 4, padding: "5px 10px",
        }}>
          <Search size={14} style={{ color: "rgba(255,255,255,.7)" }} />
          <input
            type="text"
            placeholder="Search assets, users..."
            style={{
              background: "none", border: "none", outline: "none",
              color: "white", fontSize: 13, width: 220,
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, paddingRight: 10 }}>
        {/* Quick Create */}
        <div ref={createRef} style={{ position: "relative" }}>
          <button
            onClick={() => setCreateOpen(p => !p)}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "rgba(0,0,0,.15)", border: "none", color: "rgba(255,255,255,.9)",
              borderRadius: 4, padding: "6px 10px", cursor: "pointer", fontSize: 13,
            }}
          >
            <Plus size={14} />
            Create
            <ChevronDown size={12} />
          </button>
          {createOpen && (
            <div style={{
              position: "absolute", top: "100%", right: 0, minWidth: 180,
              background: "#fff", borderRadius: 4, boxShadow: "0 4px 12px rgba(0,0,0,.2)",
              zIndex: 1000, overflow: "hidden", marginTop: 4,
            }}>
              {[
                { label: "Asset", href: "/hardware/create" },
                { label: "License", href: "/licenses/create" },
                { label: "Accessory", href: "/accessories/create" },
                { label: "Consumable", href: "/consumables/create" },
                { label: "Component", href: "/components/create" },
                { label: "User", href: "/users/create" },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setCreateOpen(false)}
                  style={{
                    display: "block", padding: "9px 16px", color: "#333",
                    textDecoration: "none", fontSize: 14, transition: "background .1s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f5f5f5")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div ref={userRef} style={{ position: "relative" }}>
          <button
            onClick={() => setUserOpen(p => !p)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(0,0,0,.15)", border: "none", color: "rgba(255,255,255,.9)",
              borderRadius: 4, padding: "6px 10px", cursor: "pointer", fontSize: 13,
            }}
          >
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: "rgba(255,255,255,.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <User size={13} />
            </div>
            <span>{session?.user?.name?.split(" ")[0] ?? "Admin"}</span>
            <ChevronDown size={12} />
          </button>
          {userOpen && (
            <div style={{
              position: "absolute", top: "100%", right: 0, minWidth: 200,
              background: "#fff", borderRadius: 4, boxShadow: "0 4px 12px rgba(0,0,0,.2)",
              zIndex: 1000, overflow: "hidden", marginTop: 4,
            }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #eee" }}>
                <div style={{ fontWeight: 600, color: "#333", fontSize: 14 }}>
                  {session?.user?.name ?? "Administrator"}
                </div>
                <div style={{ color: "#777", fontSize: 12, marginTop: 2 }}>
                  {session?.user?.email ?? ""}
                </div>
              </div>
              <Link
                href="/profile"
                onClick={() => setUserOpen(false)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", color: "#333", textDecoration: "none", fontSize: 14 }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f5f5f5")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <User size={14} /> Profile
              </Link>
              <Link
                href="/settings"
                onClick={() => setUserOpen(false)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", color: "#333", textDecoration: "none", fontSize: 14 }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f5f5f5")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <Settings size={14} /> Settings
              </Link>
              <div style={{ borderTop: "1px solid #eee", margin: "4px 0" }} />
              <button
                onClick={() => { setUserOpen(false); signOut({ callbackUrl: "/login" }); }}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "9px 16px",
                  color: "#d9534f", background: "none", border: "none", width: "100%",
                  textAlign: "left", fontSize: 14, cursor: "pointer",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f5f5f5")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
