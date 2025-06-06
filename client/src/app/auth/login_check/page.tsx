'use client';

import {AjaxForm} from "@/components/custom/forms/ajax-form";
import {use, useEffect, useState} from "react";
import {User} from "@/types";
import {useAuth} from "@/lib/auth";
import {LoaderButton} from "@/components/custom/loader-button";
import {usePageInfos} from "@/components/custom/page-infos-provider";

export default function LoginCheckPage({searchParams}: {
    searchParams: Promise<{ user: string, expires: string, hash: string }>
}) {
    const {user, expires, hash} = use(searchParams);
    const {setUser} = useAuth();
    const [pending, setPending] = useState(false);
    const {setInfos} = usePageInfos();

    useEffect(() => {
        setInfos({
            title: "Just one more step to login!",
            message: "Click on the button below to login to our website!"
        })
    }, []);

    return (
        <AjaxForm<User>
            action="/auth/login-check"
            className="w-full"
            contentType="form-data"
            onResponse={setUser}
            onRequestError={(err) => {
                console.log(err);
                setUser(null);
            }}
            duringLoading={setPending}
        >
            <input type="hidden" name="expires" value={expires}/>
            <input type="hidden" name="user" value={user}/>
            <input type="hidden" name="hash" value={hash}/>
            <LoaderButton loading={pending} className="w-full" type="submit">Continue</LoaderButton>
        </AjaxForm>
    )
}