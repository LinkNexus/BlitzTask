'use client';

import {useAuth} from "@/lib/auth";
import {useEffect} from "react";
import {usePathname, useRouter} from "next/navigation";
import {LoadingScreen} from "@/components/custom/loading-screen";
import {useFlashMessages} from "@/lib/flash-messages";

export default function AppLayout({children}: { children: React.ReactNode }) {
    const {status, authenticate, setLastRequestedUrl} = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useFlashMessages();

    useEffect(() => {
        if (status === "unknown") {
            authenticate();
        }
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            setLastRequestedUrl(pathname);
            router.push("/auth/login");
        }
    }, [status]);

    if (status === "unknown") return <LoadingScreen/>;
    if (status === "authenticated") return children;
}