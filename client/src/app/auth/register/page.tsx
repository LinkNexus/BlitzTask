'use client';

import {AuthHeader} from "@/components/custom/auth/header";
import {LoaderButton} from "@/components/custom/loader-button";
import {useState} from "react";
import {AjaxForm} from "@/components/custom/forms/ajax-form";
import {AjaxInput} from "@/components/custom/forms/ajax-input";
import Link from "next/link";
import {toast} from "sonner";
import {displayFlashMessages} from "@/lib/flash-messages";

export default function RegistrationPage() {
    const [loading, setLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<Record<string, string>>(null);

    return (
        <>
            <AuthHeader message="Welcome to BlitzTask!">
                <span>
                    Enter your information in order to create an account
                </span>
            </AuthHeader>

            <AjaxForm
                action="/auth/register"
                duringLoading={setLoading}
                onResponse={displayFlashMessages}
                onRequestError={(e) => setErrors(e.data)}
                className="flex flex-col gap-4"
            >
                <AjaxInput errors={errors} name="name" placeholder="John Doe"/>
                <AjaxInput errors={errors} name="email" type="email" placeholder="john@doe.com"/>
                <div className='flex gap-[10px] w-full flex-col lg:flex-row'>
                    <LoaderButton loading={loading} type="submit" className='w-full'>
                        Submit
                    </LoaderButton>
                </div>
            </AjaxForm>

            <p className="text-sm w-full text-center">
                If you already have an account, <Link
                className="hover:text-primary hover:underline hover:underline-offset-4"
                href="/auth/login">login here</Link>
            </p>
        </>
    )
}