"use client";

import { LoadingScreen } from "@/components/custom/loading-screen";
import { AppContent } from "@/components/custom/sidebar/app-content";
import { SidebarLeft } from "@/components/custom/sidebar/sidebar-left";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { useFlashMessages } from "@/lib/flash-messages";
import { useAppStore } from "@/store/store-provider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { status, authenticate, setLastRequestedUrl } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { switchSidebarState, sidebarState } = useAppStore((state) => state);

  useFlashMessages();
  useEffect(() => {
    if (status === "unknown") {
      authenticate();
    }
  }, []);
  useEffect(() => {
    if (status === "unauthenticated") {
      setLastRequestedUrl(pathname);
      router.push("/auth/login");
    }
  }, [status]);

  if (status === "unknown") return <LoadingScreen />;
  if (status === "authenticated") {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SidebarProvider
          open={sidebarState === "open"}
          onOpenChange={switchSidebarState}
        >
          <SidebarLeft />
          <SidebarInset>
            <AppContent>{children}</AppContent>
          </SidebarInset>
        </SidebarProvider>
      </ThemeProvider>
    );
  }
}
