'use client';

import { AuthHeader } from "@/components/custom/auth/header";
import { AjaxForm } from "@/components/custom/forms/ajax-form";
import { LoaderButton } from "@/components/custom/loader-button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/store-provider";
import { useState } from "react";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);

    return (
        <>
            <AuthHeader message="Welcome Back to BlitzTask!">
                <span>
                    Enter the code sent to your email address in order to authenticate to our website
                </span>
            </AuthHeader>

            <AjaxForm
                action="/auth/login"
                duringLoading={setLoading}
                onResponse={console.log}
            >
                <div className="flex flex-col gap-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="john@example.com" />
                </div>

                <div className='flex gap-[10px] w-full flex-col lg:flex-row'>
                    {/* <Button type='button' disabled={otpTimeLeft !== 0} onClick={generateOTP} variant='outline' className='lg:w-[calc(50%-5px)] w-full'>
                        Resend Code {otpTimeLeft > 0 ? `in ${otpTimeLeft}s` : ''}
                    </Button> */}
                    <LoaderButton loading={loading} type={"submit"} className='lg:w-[calc(50%-5px)] w-full'>
                        Submit
                    </LoaderButton>
                </div>
            </AjaxForm>
        </>
    )
}