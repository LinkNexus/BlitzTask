import {useQuery} from "@tanstack/react-query";
import {useRouteContext} from "@tanstack/react-router";
import {toast} from "sonner";
import {getCurrentUserOptions} from "@/api/@tanstack/react-query.gen.ts";

export function useCurrentUser() {
    const routeContext = useRouteContext({from: "__root__"});

    const {data, error} = useQuery({
        ...getCurrentUserOptions(),
        initialData: routeContext.user,
        staleTime: Infinity,
    });

    if (error) {
        toast.error("Failed to fetch current user");
        return null;
    }

    return data;
}

export function useAccount() {
    const user = useCurrentUser();

    if (!user) {
        throw new Error("useAccount should not be called before user is loaded");
    }

    return {
        user,
    };
}
