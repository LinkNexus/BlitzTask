'use client';

import {useRouter} from "next/navigation";
import {useEffect} from "react";
import {useAuth} from "@/lib/auth";
import {LoadingSpinner} from "@/components/ui/spinner";

export default function AppLayout({children}: Readonly<{
    children: React.ReactNode;
}>) {
    const {status, authenticate} = useAuth();
    const router = useRouter();

    useEffect(() => {
        authenticate();
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        }
    }, [status]);

    if (status === "unknown") return <div className="h-screen w-screen flex justify-center items-center"><LoadingSpinner
        size={60}/></div>;
    if (status === "authenticated") return children;
}