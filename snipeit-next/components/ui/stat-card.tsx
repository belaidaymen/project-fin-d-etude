import Link from "next/link";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  href?: string;
  color?: string;
  description?: string;
}

export function StatCard({ title, value, icon, href, color = "blue", description }: StatCardProps) {
  const colorMap: Record<string, { bg: string; icon: string; text: string }> = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600", text: "text-blue-600" },
    green: { bg: "bg-green-50", icon: "text-green-600", text: "text-green-600" },
    yellow: { bg: "bg-amber-50", icon: "text-amber-600", text: "text-amber-600" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", text: "text-purple-600" },
    red: { bg: "bg-red-50", icon: "text-red-600", text: "text-red-600" },
    indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", text: "text-indigo-600" },
  };
  const c = colorMap[color] ?? colorMap.blue;

  const content = (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={cn("p-2 rounded-lg", c.bg)}>
          <div className={c.icon}>{icon}</div>
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{typeof value === "number" ? value.toLocaleString() : value}</p>
      {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
