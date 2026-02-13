import { requestPasswordReset } from "@/api";
import { InputField } from "@/components/forms/fields/input-field";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { mapErrorsToForm } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Route as LoginRoute } from "./login";

export const RequestPasswordResetSchema = z.object({
	email: z.email("Please enter a valid email address"),
});

export const Route = createFileRoute("/_auth/request-reset-password")({
	component: RequestResetPasswordPage,
});

function RequestResetPasswordPage() {
	const navigate = useNavigate();

	const form = useForm({
		resolver: zodResolver(RequestPasswordResetSchema),
		defaultValues: {
			email: "",
		},
	});

	async function onSubmit(data: z.infer<typeof RequestPasswordResetSchema>) {
		const { error } = await requestPasswordReset({ body: data });

		if (error) {
			if ("message" in error) {
				toast.error("An error occurred", {
					description: String(error.message),
				});
			} else if (error.errors) {
				mapErrorsToForm(form, error.errors);
			}

			return;
		}

		toast.success("Reset email sent!", {
			description: `Check your inbox for further instructions`,
		});

		await navigate({ to: LoginRoute.to });
	}

	return (
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<FieldGroup>
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="font-bold text-2xl">Reset your password</h1>
					<p className="text-balance text-muted-foreground">
						Enter your email and we'll send you a link to reset your password
					</p>
				</div>

				<Controller
					control={form.control}
					name="email"
					render={({ field, fieldState }) => (
						<InputField
							field={field}
							fieldState={fieldState}
							inputProps={{ autoComplete: "email", type: "email" }}
							labelProps={{ children: "Email Address" }}
						/>
					)}
				/>

				<Field>
					<Button type="submit" disabled={form.formState.isSubmitting}>
						{form.formState.isSubmitting ? (
							<>
								<Spinner /> Sending...
							</>
						) : (
							<>
								<Mail /> Send Reset Link
							</>
						)}
					</Button>
				</Field>

				<FieldDescription className="text-center">
					Remember your password? <Link to={LoginRoute.to}>Back to login</Link>
				</FieldDescription>
			</FieldGroup>
		</form>
	);
}
