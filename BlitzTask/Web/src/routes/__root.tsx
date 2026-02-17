import type { CurrentUser } from "@/api";
import { getCurrentUserOptions } from "@/api/@tanstack/react-query.gen.ts";
import { Toaster } from "@/components/ui/sonner.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { ThemeProvider } from "@/hooks/use-theme.tsx";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

interface RouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	beforeLoad: async ({ context }) => {
		let user: CurrentUser | undefined;
		try {
			user = await context.queryClient.fetchQuery({
				...getCurrentUserOptions(),
				staleTime: Infinity,
			});
		} catch (_error) {
			user = undefined;
		}

		return { user };
	},
	component: RootLayout,
});

function RootLayout() {
	console.log("Rendering RootLayout");
	return (
		<ThemeProvider>
			<TooltipProvider>
				<Outlet />
				<Toaster />
			</TooltipProvider>
		</ThemeProvider>
	);
}
