import type { CurrentUser } from "@/api";
import { getCurrentUserOptions } from "@/api/@tanstack/react-query.gen.ts";
import { Toaster } from "@/components/ui/sonner.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { ThemeProvider } from "@/hooks/use-theme.tsx";
import { FlashMessageSchema } from "@/lib/schemas";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	Outlet,
	useRouter,
	useRouterState,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import z from "zod";

interface RouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	validateSearch: z.object({
		messages: FlashMessageSchema.array().optional(),
	}),
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
	const router = useRouter();
	const search = useRouterState({
		select: (state) => state.location.search,
	});
	const shownMessageIds = useRef<Set<string>>(new Set());

	useEffect(() => {
		if (!search.messages?.length) return;

		const newMessages = search.messages.filter(
			(m) => !shownMessageIds.current.has(m.id),
		);

		if (newMessages.length === 0) return;

		newMessages.forEach((m) => {
			toast[m.type](m.message.title, {
				description: m.message.description,
			});
			shownMessageIds.current.add(m.id);
		});

		router.navigate({
			replace: true,
			// @ts-expect-error - We know this is safe because we validated the search with Zod
			search: (prev) => {
				const { messages, ...rest } = prev;
				return rest;
			},
		});
	}, [search.messages]);

	return (
		<ThemeProvider>
			<TooltipProvider>
				<Outlet />
				<Toaster />
			</TooltipProvider>
		</ThemeProvider>
	);
}
