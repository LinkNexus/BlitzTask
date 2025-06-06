'use client';

import {Zap} from "lucide-react";
import {PropsWithChildren, useEffect} from "react";
import {useAuth} from "@/lib/auth";
import {LoadingScreen} from "@/components/custom/loading-screen";
import {useRouter} from "next/navigation";
import {useFlashMessages} from "@/lib/flash-messages";
import {AuthFormStructure} from "@/components/custom/auth/auth-form-structure";

export default function AuthLayout({children}: PropsWithChildren) {
    const {status, authenticate, lastRequestedUrl} = useAuth();
    const router = useRouter();

    useFlashMessages();
    useEffect(() => {
        authenticate();
    }, []);
    useEffect(() => {
        if (status === "authenticated") {
            router.push(lastRequestedUrl || "/");
        }
    }, [status]);

    if (status === "unknown") return <LoadingScreen/>;
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a href="#" className="flex items-center gap-2 self-center font-medium">
                    <div
                        className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                        <Zap className="size-4"/>
                    </div>
                    BlitzTask
                </a>
                <div className="flex flex-col gap-6">
                    <AuthFormStructure>
                        {children}
                    </AuthFormStructure>
                    <div
                        className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                        and <a href="#">Privacy Policy</a>.
                    </div>
                </div>
            </div>
        </div>
    );
}