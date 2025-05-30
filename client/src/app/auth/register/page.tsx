"use client";

import {AuthHeader} from "@/components/custom/auth/header";
import Link from "next/link";
import {FormField} from "@/components/custom/forms/form-field";
import {LoaderButton} from "@/components/custom/loader-button";
import {AjaxForm} from "@/components/custom/forms/ajax-form";
import {useState} from "react";
import {formErrors, FormErrors} from "@/lib/forms";

export default function RegistrationPage() {
    const [pending, setPending] = useState(false);
    const [errors, setErrors] = useState<FormErrors>();

    const {getErrors, clearErrors} = formErrors(errors, setErrors);

    return (
        <>
            <AuthHeader message="Welcome to BlitzTask!">
                <span>
                    Enter your information in order to create an account
                </span>
            </AuthHeader>

            <AjaxForm
                action="/auth/register"
                duringLoading={setPending}
                className="flex flex-col gap-4"
                onResponse={console.log}
                onRequestError={(err) => setErrors(err.data)}
            >

                <FormField
                    onChange={() => clearErrors("name")}
                    errors={getErrors("name")}
                    name="name"
                    placeholder="John Doe"/>
                <FormField
                    onChange={() => clearErrors("email")}
                    errors={getErrors("email")}
                    name="email"
                    type="email"
                    placeholder="john@doe.com"/>

                <div className='flex gap-[10px] w-full flex-col lg:flex-row'>
                    <LoaderButton loading={pending} type="submit" className='w-full'>
                        Submit
                    </LoaderButton>
                </div>
            </AjaxForm>

            <p className="text-sm w-full text-center">
                If you already have an account, <Link
                className="hover:text-primary hover:underline hover:underline-offset-4"
                href="/auth/login">sign in here</Link>
            </p>
        </>
    )
}