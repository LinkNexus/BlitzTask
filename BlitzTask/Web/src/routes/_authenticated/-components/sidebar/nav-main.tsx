import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible.tsx";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar.tsx";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useLocation } from "@tanstack/react-router";
import { Bot, Home, Inbox, Search } from "lucide-react";
import { useMemo } from "react";

// type NavigationItem = {
//   title: string;
//   url: string;
//   icon: ComponentType<any>;
//   isActive: boolean;
//   badge?: string;
// };

const projects = [
	{
		name: "Project Alpha",
	},
	{
		name: "Project Beta",
	},
	{
		name: "Project Gamma",
	},
];

export function NavMain() {
	const currentLocation = useLocation();

	const items = useMemo(
		() => [
			{
				title: "Search",
				url: "/search",
				icon: Search,
				isActive: currentLocation.pathname === "/search",
			},
			{
				title: "Home",
				url: "/",
				icon: Home,
				isActive: currentLocation.pathname === "/",
			},
			{
				title: "Inbox",
				url: "/inbox",
				icon: Inbox,
				isActive: currentLocation.pathname === "/inbox",
			},
			{
				title: "Ask AI",
				url: "/ask-ai",
				icon: Bot,
				isActive: currentLocation.pathname === "/ask-ai",
			},
		],
		[currentLocation],
	);

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Platform</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => (
					<Collapsible
						key={item.title}
						defaultOpen={item.isActive}
						className="group/collapsible"
					>
						<SidebarMenuItem>
							{item.title === "Projects" ? (
								<>
									<CollapsibleTrigger>
										<SidebarMenuButton
											tooltip={item.title}
											isActive={item.isActive}
										>
											{item.icon && <item.icon />}
											<span>{item.title}</span>
										</SidebarMenuButton>
									</CollapsibleTrigger>
									<CollapsibleContent>
										<SidebarMenuSub className="w-full">
											{!projects ? (
												<Spinner className="size-3" />
											) : (
												projects.map((p) => (
													<SidebarMenuSubItem key={p.name}>
														<SidebarMenuSubButton asChild>
															<a href={"/projects"}>
																<span>{p.name}</span>
															</a>
														</SidebarMenuSubButton>
													</SidebarMenuSubItem>
												))
											)}
										</SidebarMenuSub>
									</CollapsibleContent>
								</>
							) : (
								<SidebarMenuButton
									asChild
									tooltip={item.title}
									isActive={item.isActive}
								>
									<a href={item.url}>
										{item.icon && <item.icon />}
										<span>{item.title}</span>
										{/* {"badge" in item && item.badge && ( */}
										{/*   <Badge variant="secondary" className="ml-auto"> */}
										{/*     {item.badge} */}
										{/*   </Badge> */}
										{/* )} */}
									</a>
								</SidebarMenuButton>
							)}
						</SidebarMenuItem>
					</Collapsible>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
