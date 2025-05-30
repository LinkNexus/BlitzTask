import {LoadingSpinner} from "@/components/ui/spinner";

export function LoadingScreen() {
    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <LoadingSpinner size={60}/>
        </div>
    )
}