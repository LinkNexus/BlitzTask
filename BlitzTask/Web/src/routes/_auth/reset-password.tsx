import { resetPassword } from "@/api";
import { InputField } from "@/components/forms/fields/input-field";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { mapErrorsToForm } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	createFileRoute,
	Link,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Route as LoginRoute } from "./login";

export const ResetPasswordSchema = z
	.object({
		newPassword: z
			.string()
			.min(8, "The password must be at least 8 characters long")
			.max(128, "The password must be at most 128 characters long")
			.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
			.regex(/[a-z]/, "Password must contain at least one lowercase letter")
			.regex(/\d/, "Password must contain at least one digit")
			.regex(/[^\w\s]/, "Password must contain at least one special character"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export const Route = createFileRoute("/_auth/reset-password")({
	validateSearch: z.object({
		userId: z.string().optional(),
		token: z.string().optional(),
	}),
	component: ResetPasswordPage,
});

function ResetPasswordPage() {
	const navigate = useNavigate();
	const { userId, token } = useSearch({ from: "/_auth/reset-password" });

	const form = useForm({
		resolver: zodResolver(ResetPasswordSchema),
		defaultValues: {
			newPassword: "",
			confirmPassword: "",
		},
	});

	async function onSubmit(formData: z.infer<typeof ResetPasswordSchema>) {
		if (!userId || !token) {
			toast.error("Invalid reset link", {
				description: "The reset link is missing required parameters",
			});
			return;
		}

		const { error } = await resetPassword({
			body: {
				userId,
				token,
				newPassword: formData.newPassword,
				confirmPassword: formData.confirmPassword,
			},
		});

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

		toast.success("Password reset successfully!", {
			description: "You can now login with your new password",
		});

		await navigate({ to: LoginRoute.to });
	}

	if (!userId || !token) {
		return (
			<FieldGroup>
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="font-bold text-2xl">Invalid reset link</h1>
					<p className="text-balance text-muted-foreground">
						The password reset link is invalid or has expired
					</p>
				</div>

				<Field>
					<FieldDescription className="text-center">
						<Link to={LoginRoute.to}>Back to login</Link>
					</FieldDescription>
				</Field>
			</FieldGroup>
		);
	}

	return (
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<FieldGroup>
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="font-bold text-2xl">Create new password</h1>
					<p className="text-balance text-muted-foreground">
						Enter your new password below
					</p>
				</div>

				<Controller
					control={form.control}
					name="newPassword"
					render={({ field, fieldState }) => (
						<InputField
							field={field}
							fieldState={fieldState}
							inputProps={{ autoComplete: "new-password", type: "password" }}
							labelProps={{ children: "New Password" }}
						/>
					)}
				/>

				<Controller
					control={form.control}
					name="confirmPassword"
					render={({ field, fieldState }) => (
						<InputField
							field={field}
							fieldState={fieldState}
							inputProps={{ type: "password" }}
							labelProps={{ children: "Confirm Password" }}
						/>
					)}
				/>

				<Field>
					<Button type="submit" disabled={form.formState.isSubmitting}>
						{form.formState.isSubmitting ? (
							<>
								<Spinner /> Resetting...
							</>
						) : (
							<>
								<Lock /> Reset Password
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
