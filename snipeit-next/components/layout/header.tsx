"use client";

import { signOut, useSession } from "next-auth/react";
import { Bell, Search, LogOut, User, Settings, ChevronDown } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { getInitials } from "@/lib/utils";

export function Header({ title }: { title?: string }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const user = session?.user as any;

  const name = user?.name ?? "User";
  const parts = name.split(" ");
  const initials = parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {title && <h1 className="text-base font-semibold text-gray-800">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
              {initials}
            </div>
            <span className="hidden sm:block">{name}</span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800">{name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Link href="/account/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setOpen(false)}>
                <User className="h-4 w-4" /> My Profile
              </Link>
              <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setOpen(false)}>
                <Settings className="h-4 w-4" /> Settings
              </Link>
              <div className="border-t border-gray-100 mt-1">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
