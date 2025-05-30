'use client';

import {useAuth} from "@/lib/auth";
import {Button} from "@/components/ui/button";

export default function HomePage() {
    const {user, logout} = useAuth();

    return (
        <>
            <div>{user?.name}</div>
            <Button onClick={logout}>Logout</Button>
        </>
    );
}
