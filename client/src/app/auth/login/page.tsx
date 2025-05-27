'use client';

import {AuthHeader} from "@/components/custom/auth/header";
import {AjaxForm} from "@/components/custom/forms/ajax-form";
import {LoaderButton} from "@/components/custom/loader-button";
import {useState} from "react";
import Link from "next/link";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);

    return (
        <>
            <AuthHeader message="Welcome Back to BlitzTask!">
                <span>
                    Enter your email address to access our website
                </span>
            </AuthHeader>

            <AjaxForm
                action="/auth/login"
                duringLoading={setLoading}
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
                If you don't already have an account, <Link
                className="hover:text-primary hover:underline hover:underline-offset-4"
                href="/auth/register">create an account here</Link>
            </p>
        </>
    )
}