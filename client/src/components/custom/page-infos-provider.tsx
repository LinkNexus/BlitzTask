'use client';

import {createContext, useContext, useState} from "react";

interface PageInfos {
    title: string;
    currentActiveNavItem: string;
}

const PageInfosContext = createContext<{
    infos: PageInfos & Record<string, string> | undefined,
    setInfos: (infos: PageInfos & Record<string, string>) => void
} | undefined>(undefined);

export function PageInfosProvider({children}: { children: React.ReactNode }) {
    const [infos, setInfos] = useState<Record<string, string>>();

    return (
        <PageInfosContext.Provider value={{infos, setInfos}}>
            {children}
        </PageInfosContext.Provider>
    );
}

export function usePageInfos() {
    const context = useContext(PageInfosContext);

    if (!context) {
        throw new Error("usePageInfos must be used within a PageInfosProvider");
    }

    return context;
}