import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Route as CreateProjectRoute } from "@/routes/_authenticated/projects/create";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { memo } from "react";

export const NavProjects = memo(() => {
	return (
		<SidebarGroup className="group-data-[collapsible=icon]:hidden">
			<SidebarGroupLabel className="text-xs font-semibold">
				Projects
			</SidebarGroupLabel>
			<SidebarMenuItem>
				<SidebarMenuButton
					asChild
					className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
					tooltip="Create a new project"
				>
					<Link to={CreateProjectRoute.to} className="flex items-center gap-2">
						<Plus className="h-4 w-4" />
						<span className="text-sm font-medium">Create Project</span>
					</Link>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarGroup>
	);
});
