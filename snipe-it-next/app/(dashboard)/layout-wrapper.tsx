import Providers from "@/components/layout/Providers";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
