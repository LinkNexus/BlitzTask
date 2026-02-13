import { confirmEmail } from "@/api";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/_auth/confirm-email")({
	beforeLoad: async () => {
		const searchQuery = new URLSearchParams(window.location.search);
		const userId = searchQuery.get("userId");
		const token = searchQuery.get("token");

		if (!userId || !token) {
			throw redirect({ to: "/login" });
		}

		const { error } = await confirmEmail({ body: { userId, token } });
		if (error) {
			if ("message" in error) {
				toast.error("An error happened during email confirmation", {
					description: error.message,
				});
			}
		} else {
			toast.success(
				"Your email address has been successfully confirmed! You can now have full access to all features.",
			);
		}

		throw redirect({ to: "/login" });
	},
});
