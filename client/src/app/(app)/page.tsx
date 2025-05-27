'use client';

import {useAuth} from "@/lib/auth";
import {useFlashMessages} from "@/lib/flash-messages";

export default function Home() {
    const {user} = useAuth();

    useFlashMessages();

    return (
        <div>
            {user!.name}
        </div>
    )
}
