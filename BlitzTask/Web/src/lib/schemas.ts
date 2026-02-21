import z from "zod";

export const FlashMessageSchema = z.object({
	id: z.string(),
	type: z.enum(["success", "error", "info", "warning"]),
	message: z.object({
		title: z.string(),
		description: z.string(),
	}),
});
