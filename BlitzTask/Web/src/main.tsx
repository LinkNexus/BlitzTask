import { routeTree } from "@/routeTree.gen.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import type { CsrfTokenResponse } from "./api";
import { client } from "./api/client.gen";
import "./index.css";

client.interceptors.request.use(async (request) => {
	let token: string | null = null;
	const csrfTokenResponse = await fetch("/api/csrf-token");

	if (csrfTokenResponse.ok) {
		const { token: csrfToken } =
			(await csrfTokenResponse.json()) as CsrfTokenResponse;
		token = csrfToken;
	}

	// Create new headers from the existing request headers
	const headers = new Headers(request.headers);
	headers.set("X-CSRF-Token", token ?? "");

	return new Request(request, {
		credentials: "include",
		headers,
	});
});

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
		},
	},
});

const router = createRouter({
	routeTree,
	context: {
		queryClient,
	},
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	</StrictMode>,
);
