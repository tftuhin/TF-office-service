import { getProfile } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  return <AppShell profile={profile}>{children}</AppShell>;
}
