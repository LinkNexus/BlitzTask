'use client';

import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {LoaderButton} from "@/components/custom/loader-button";
import {AjaxForm} from "@/components/custom/forms/ajax-form";
import {useEffect, useState} from "react";
import Link from "next/link";
import {displayFlashMessages} from "@/lib/flash-messages";
import {usePageInfos} from "@/components/custom/page-infos-provider";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const {setInfos} = usePageInfos();

    useEffect(() => {
        setInfos({
            title: "Welcome Back!",
            message: "Enter your email address to access our website"
        })
    }, []);

    return (
        <>
            <AjaxForm
                onResponse={displayFlashMessages}
                duringLoading={setLoading}
                action="/auth/login"
                className="flex flex-col gap-4"
            >
                <div className="flex flex-col gap-2">
                    <Label>Email</Label>
                    <Input name="email" type="email" placeholder="john@doe.com"/>
                </div>
                <div className='flex gap-[10px] w-full flex-col lg:flex-row'>
                    <LoaderButton loading={loading} type={"submit"} className='w-full'>
                        Submit
                    </LoaderButton>
                </div>
            </AjaxForm>

            <p className="text-sm w-full text-center">
                Don't have an account, <Link
                className="hover:text-primary hover:underline hover:underline-offset-4"
                href="/auth/register">create one here</Link>
            </p>
        </>
    );
}