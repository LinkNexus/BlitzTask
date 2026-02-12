import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar.tsx";
import { useLocation } from "@tanstack/react-router";
import { Calendar, Trash2 } from "lucide-react";
import { useMemo } from "react";

export function NavSecondary() {
  const currentLocation = useLocation();

  const tools = useMemo(
    () => [
      {
        title: "Calendar",
        url: "/calendar",
        icon: Calendar,
        isActive: currentLocation.pathname.includes("/calendar"),
      },
      {
        title: "Trash",
        url: "/trash",
        icon: Trash2,
        isActive: currentLocation.pathname.includes("/trash"),
      },
    ],
    [currentLocation],
  );

  return (
    <SidebarGroup className="mt-auto">
      <SidebarGroupLabel>Tools</SidebarGroupLabel>
      <SidebarMenu>
        {tools.map((t) => (
          <SidebarMenuItem key={t.title}>
            <SidebarMenuButton asChild tooltip={t.title} isActive={t.isActive}>
              <a href={t.url}>
                <t.icon />
                <span>{t.title}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
