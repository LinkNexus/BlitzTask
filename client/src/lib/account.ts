import {useAuth} from "@/lib/auth";

export function useAccount() {
    const {user, setUser} = useAuth();

    if (!user) throw new Error("The user must be authenticated to use this hook.");

    return {
        user
    };
}