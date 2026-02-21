import { confirmEmail } from "@/api";
import { getCurrentUserOptions } from "@/api/@tanstack/react-query.gen";
import { createFileRoute, redirect } from "@tanstack/react-router";
import z from "zod";

export const Route = createFileRoute("/confirm-email")({
	validateSearch: z.object({
		userId: z.string(),
		token: z.string(),
	}),

	errorComponent: () => {
		throw redirect({
			to: "/dashboard",
			search: {
				messages: [
					{
						id: crypto.randomUUID(),
						type: "error",
						message: {
							title: "Invalid confirmation link",
							description: "The confirmation link is invalid or malformed.",
						},
					},
				],
			},
		});
	},

	beforeLoad: async ({ search, context }) => {
		const { userId, token } = search;

		const { error } = await confirmEmail({ body: { userId, token } });
		if (error) {
			if ("message" in error) {
				throw redirect({
					to: "/login",
					search: {
						messages: [
							{
								id: crypto.randomUUID(),
								type: "error",
								message: {
									title: "Email confirmation failed",
									description: error.message,
								},
							},
						],
					},
				});
			}
		} else {
			context.queryClient.invalidateQueries(getCurrentUserOptions());
			throw redirect({
				to: "/dashboard",
				search: {
					messages: [
						{
							id: crypto.randomUUID(),
							type: "success",
							message: {
								title: "Email confirmed",
								description:
									"Your email address has been successfully confirmed! You can now have full access to all features.",
							},
						},
					],
				},
			});
		}
	},
});
