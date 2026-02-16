import Logo from "@/assets/logo.svg";
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
import { NavProjects } from "./nav-projects.tsx";
import { NavSecondary } from "./nav-secondary.tsx";
import { NavUser } from "./nav-user.tsx";

export const AppSidebar = memo(
	({ ...props }: ComponentProps<typeof Sidebar>) => (
		<Sidebar collapsible="icon" {...props}>
			{/* Header with logo */}
			<SidebarHeader className="border-b border-sidebar-border">
				<div className="flex items-center gap-3 px-2 py-3">
					<img src={Logo} alt="Blitz-Task" className="h-10 w-10 shrink-0" />
					<div className="flex flex-1 flex-col gap-0.5 text-left">
						<span className="truncate text-sm font-bold text-sidebar-foreground">
							Blitz-Task
						</span>
						<span className="truncate text-xs text-sidebar-foreground/60">
							Task Management
						</span>
					</div>
				</div>
			</SidebarHeader>

			{/* Main navigation content */}
			<SidebarContent className="gap-0">
				<NavMain />
				<NavProjects />
				<NavSecondary />
			</SidebarContent>

			{/* User menu footer */}
			<SidebarFooter className="border-t border-sidebar-border">
				<SidebarMenu>
					<SidebarMenuItem>
						<NavUser />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	),
);

AppSidebar.displayName = "AppSidebar";
