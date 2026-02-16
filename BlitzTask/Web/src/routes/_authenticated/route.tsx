import { resendConfirmEmail } from "@/api";
import { client } from "@/api/client.gen";
import { Button } from "@/components/ui/button";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppSidebar } from "./-components/sidebar/app-sidebar";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: ({ context, location }) => {
		if (!context.user) {
			throw redirect({
				to: "/login",
				search: {
					redirect: location.href,
				},
			});
		}

		client.interceptors.response.use((response) => {
			if (response.status === 401) {
				throw redirect({
					to: "/login",
					search: {
						redirect: location.href,
					},
				});
			}

			if (response.status === 403) {
				toast.error(
					"You don't have permission to perform this action, because your email adress is not verified.",
					{
						action: (
							<Button
								onClick={async () => {
									await resendConfirmEmail().then(() => {
										toast.success(
											"Verification email resent! Please check your inbox.",
										);
									});
								}}
							>
								Resend verification email
							</Button>
						),
					},
				);
			}

			return response;
		});
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
