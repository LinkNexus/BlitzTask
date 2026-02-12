import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Route as CreateProjectRoute } from "@/routes/_authenticated/projects/create";

export function NavProjects() {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="text-shadow-sidebar-foreground/70">
            <Link to={CreateProjectRoute.to}>
              <Plus /> Add
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
