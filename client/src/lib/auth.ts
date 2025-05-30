import {useAppStore} from "@/store/store-provider";
import {useCallback} from "react";
import {apiFetch} from "@/lib/fetch";
import {User} from "@/types";

export enum AuthStatus {
    Unknown = 'unknown',
    Authenticated = 'authenticated',
    Unauthenticated = 'unauthenticated'
}

export function useAuth() {
    const {user, setUser, lastRequestedUrl, setLastRequestedUrl} = useAppStore(state => state);
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

    const authenticate = useCallback(function () {
        apiFetch<User>("/me").then(setUser).catch(() => setUser(null));
    }, [setUser]);

    const logout = useCallback(function () {
        apiFetch<User>("/auth/logout").then(() => setUser(null));
    }, [setUser]);

    return {
        user,
        status,
        authenticate,
        logout,
        setUser,
        lastRequestedUrl,
        setLastRequestedUrl
    }
}