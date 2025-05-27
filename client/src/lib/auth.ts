import {useAppStore} from "@/store/store-provider";
import {useCallback} from "react";
import {apiFetch} from "@/lib/fetch";
import {User} from "@/types";

export enum AuthStatus {
    Unknown = 'unknown',
    Authenticated = 'authenticated',
    Unauthenticated = 'unauthenticated'
}

export const useAuth = () => {
    const {user, setUser} = useAppStore(state => state);
    let status: AuthStatus;

    switch (user) {
        case null:
            status = AuthStatus.Unauthenticated;
            break;
        case undefined:
            status = AuthStatus.Unknown;
            break;
        default:
            status = AuthStatus.Authenticated;
            break;
    }

    const authenticate = useCallback(async () => {
        try {
            setUser(await apiFetch<User>("/auth/me", {method: "GET"}));
        } catch (error) {
            setUser(null);
        }
    }, [setUser]);

    const logout = useCallback(async () => {
        await apiFetch<void>("/auth/logout");
        setUser(null);
    }, []);

    return {
        status,
        user,
        setUser,
        authenticate,
        logout
    }
}