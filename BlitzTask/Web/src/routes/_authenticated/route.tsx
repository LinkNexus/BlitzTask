import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { AppSidebar } from "./-components/sidebar/app-sidebar";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: ({ context, location }) => {
		console.log({ user: context.user });
		if (!context.user) {
			throw redirect({
				to: "/login",
				search: {
					redirect: location.href,
				},
			});
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const [sidebarOpen, setSidebarOpen] = useState(true);

	return (
		<SidebarProvider
			open={sidebarOpen}
			onOpenChange={(open) => {
				setSidebarOpen(open);
			}}
			className="max-w-screen"
		>
			<AppSidebar />
			<SidebarInset
				className={cn(
					"w-full",
					sidebarOpen
						? "md:max-w-[calc(100%-var(--sidebar-width))]"
						: "md:max-w-[calc(100%-var(--sidebar-width-icon))]",
				)}
			>
				<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
