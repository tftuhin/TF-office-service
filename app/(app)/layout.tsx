import { getProfile } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { BackgroundNotificationClient } from "@/components/background-notification-client";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  return (
    <>
      <AppShell profile={profile}>{children}</AppShell>
      <BackgroundNotificationClient />
    </>
  );
}
