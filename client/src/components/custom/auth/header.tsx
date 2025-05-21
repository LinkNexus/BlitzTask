import { Zap } from "lucide-react";

export function AuthHeader({ children, message }: { children: React.ReactNode; message: string }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <a
                href="#"
                className="flex flex-col items-center gap-2 font-medium"
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-md">
                    <Zap className="size-6" />
                </div>
                <span className="sr-only">BlitzTask</span>
            </a>

            <h1 className="text-xl font-bold">{message}</h1>
            <div className="flex flex-col gap-y-3 text-center text-sm">
                {children}
            </div>
        </div>
    );
}