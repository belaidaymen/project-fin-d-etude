import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined, currency = "USD"): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(date));
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function buildSearchParams(params: Record<string, string | number | undefined | null>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== "") sp.set(k, String(v));
  }
  return sp.toString();
}

export const STATUS_COLORS: Record<string, string> = {
  deployable: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  archived: "bg-gray-100 text-gray-800",
  undeployable: "bg-red-100 text-red-800",
};

export function getStatusColor(type: string | null | undefined): string {
  return STATUS_COLORS[type ?? ""] ?? "bg-gray-100 text-gray-800";
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function getPaginationRange(page: number, total: number, perPage: number) {
  const totalPages = Math.ceil(total / perPage);
  return {
    page,
    totalPages,
    perPage,
    total,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    from: (page - 1) * perPage + 1,
    to: Math.min(page * perPage, total),
  };
}
