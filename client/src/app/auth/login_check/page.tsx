'use client';

import {AuthHeader} from "@/components/custom/auth/header";
import {Button} from "@/components/ui/button";
import {AjaxForm} from "@/components/custom/forms/ajax-form";
import {use} from "react";
import {User} from "@/types";
import {useAuth} from "@/lib/auth";

export default function LoginCheckPage({searchParams}: {
    searchParams: Promise<{ user: string, expires: string, hash: string }>
}) {
    const {user, expires, hash} = use(searchParams);
    const {setUser} = useAuth();

    return (
        <>
            <AuthHeader message="Just one more step to login!">
                <span>
                    Click on the button below to login to our website!
                </span>
            </AuthHeader>

            <AjaxForm<User>
                action="/auth/login-check"
                className="w-full"
                contentType="form-data"
                onResponse={(res) => setUser(res)}
                onRequestError={(err) => {
                    console.log(err);
                    setUser(null);
                }}
            >
                <input type="hidden" name="expires" value={expires}/>
                <input type="hidden" name="user" value={user}/>
                <input type="hidden" name="hash" value={hash}/>
                <Button className="w-full" type="submit">Continue</Button>
            </AjaxForm>
        </>
    )
}