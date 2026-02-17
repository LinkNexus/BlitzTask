import { resendConfirmEmail } from "@/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function EmailVerificationBanner() {
	async function handleResendVerificationEmail() {
		const { data, error } = await resendConfirmEmail();

		if (error) {
			toast.error(
				"Failed to resend verification email. Please try again later.",
			);
			return;
		}

		toast.success(data.message);
	}
	return (
		<div className="flex flex-1 flex-col gap-4 mb-8">
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Email verification required</AlertTitle>
				<AlertDescription className="gap-y-3">
					<div>
						You must verify your email address before creating projects. Check
						the verfication email we sent you when you signed up. If you can't
						find it, click the button below to resend the verification email.
					</div>
					<Button className="w-full" variant={"outline"}>
						Resend
					</Button>
				</AlertDescription>
			</Alert>
		</div>
	);
}
