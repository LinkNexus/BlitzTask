import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar.tsx";
import { type ComponentProps, memo } from "react";
import { NavMain } from "./nav-main.tsx";
import { NavSecondary } from "./nav-secondary.tsx";
import { NavUser } from "./nav-user.tsx";
import Logo from "@/assets/logo.svg";
import { NavProjects } from "./nav-projects.tsx";

const AppSidebar = memo(function ({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <img src={Logo} alt="Blitz-Task" className="h-10 w-10" />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Blitz-Task</span>
            <span className="truncate text-xs text-muted-foreground">Tasks Management</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain />
        <NavProjects />
        <NavSecondary />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <NavUser />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
});

export { AppSidebar };
