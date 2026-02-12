import { createAccount } from "@/api";
import { getCurrentUserOptions } from "@/api/@tanstack/react-query.gen.ts";
import { InputField } from "@/components/forms/fields/input-field";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { mapErrorsToForm } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate, useRouteContext, } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Route as LoginRoute } from "./login";

export const CreateUserSchema = z
    .object({
        name: z
            .string()
            .min(1, "The name is required")
            .max(255, "The name must be at most 255 characters long"),
        email: z.email(),
        password: z
            .string()
            .min(8, "The password must be at least 8 characters long")
            .max(128, "The password must be at most 128 characters long")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/\d/, "Password must contain at least one digit")
            .regex(/[^\w\s]/, "Password must contain at least one special character"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const Route = createFileRoute("/_auth/create-account")({
    component: CreateAccountPage,
});

function CreateAccountPage() {
    const navigate = useNavigate();
    const {queryClient} = useRouteContext({from: "__root__"});

    const form = useForm({
        resolver: zodResolver(CreateUserSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(formData: z.infer<typeof CreateUserSchema>) {
        const {data, error} = await createAccount({body: formData});

        if (error) {
            if ("message" in error) {
                toast.error("An error happened during account creation", {
                    description: error.message,
                });
            } else if (error.errors) {
                mapErrorsToForm(form, error.errors);
            }

            return;
        }

        queryClient.setQueryData(getCurrentUserOptions().queryKey, data);
        toast.success("Account created!", {
            description: `Welcome to Blitz-Task, ${data.userName}!`,
        });

        toast.info("A confirmation email has been sent to your email address.");

        await navigate({to: "/dashboard"});
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="font-bold text-2xl">Join our community</h1>
                    <p className="text-balance text-muted-foreground">
                        Create your account and start managing your tasks
                    </p>
                </div>

                <Controller
                    control={form.control}
                    name="name"
                    render={({field, fieldState}) => (
                        <InputField
                            field={field}
                            fieldState={fieldState}
                            inputProps={{autoComplete: "name", type: "text"}}
                            labelProps={{children: "Name"}}
                        />
                    )}
                />

                <Controller
                    control={form.control}
                    name="email"
                    render={({field, fieldState}) => (
                        <InputField
                            field={field}
                            fieldState={fieldState}
                            inputProps={{autoComplete: "email", type: "email"}}
                            labelProps={{children: "Email Address"}}
                        />
                    )}
                />

                <Controller
                    control={form.control}
                    name="password"
                    render={({field, fieldState}) => (
                        <InputField
                            field={field}
                            fieldState={fieldState}
                            inputProps={{autoComplete: "new-password", type: "password"}}
                            labelProps={{children: "Password"}}
                        />
                    )}
                />

                <Controller
                    control={form.control}
                    name="confirmPassword"
                    render={({field, fieldState}) => (
                        <InputField
                            field={field}
                            fieldState={fieldState}
                            inputProps={{type: "password"}}
                            labelProps={{children: "Confirm Password"}}
                        />
                    )}
                />

                <Field>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? (
                            <>
                                <Spinner/> Creating account...
                            </>
                        ) : (
                            <>
                                <UserPlus/> Create Account
                            </>
                        )}
                    </Button>
                </Field>

                <FieldDescription className="text-center">
                    Already have an account? <Link to={LoginRoute.to}>Login</Link>
                </FieldDescription>
            </FieldGroup>
        </form>
    );
}
