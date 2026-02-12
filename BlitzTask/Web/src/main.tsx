import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "./index.css";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {createRouter, RouterProvider} from "@tanstack/react-router";
import {client} from "@/api/client.gen.ts";
import {routeTree} from "@/routeTree.gen.ts";

client.interceptors.request.use(
    (request) =>
        new Request(request, {
            ...request.headers,
            credentials: "include",
        }),
);

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
            <RouterProvider router={router}/>
        </QueryClientProvider>
    </StrictMode>,
);
