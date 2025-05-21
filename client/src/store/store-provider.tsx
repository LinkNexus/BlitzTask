'use client'

import { createContext, PropsWithChildren, useContext, useRef } from "react";
import { AppStore, createAppStore } from "./store";
import { useStore } from "zustand";

type AppStoreApi = ReturnType<typeof createAppStore>;

export const AppStoreContext = createContext<AppStoreApi | undefined>(undefined);

export function AppStoreProvider({ children }: PropsWithChildren) {
    const storeRef = useRef<AppStoreApi | null>(null);

    if (storeRef.current === null) {
        storeRef.current = createAppStore();
    }

    return (
        <AppStoreContext.Provider value={storeRef.current}>
            {children}
        </AppStoreContext.Provider>
    );
}

export function useAppStore<T,>(
    selector: (state: AppStore) => T
): T {
    const appStoreContext = useContext(AppStoreContext);
    if (!appStoreContext) {
        throw new Error("useAppStore must be used within an AppStoreProvider");
    }
    return useStore(appStoreContext, selector);
}