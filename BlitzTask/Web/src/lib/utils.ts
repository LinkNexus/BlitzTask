import type { FlashMessage } from "@/types";
import { type ClassValue, clsx } from "clsx";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function mapErrorsToForm<
	TFieldValues extends FieldValues = FieldValues,
	TContext = any,
	TTransformedValues = TFieldValues,
>(
	form: UseFormReturn<TFieldValues, TContext, TTransformedValues>,
	errors: { [key: string]: string | string[] },
) {
	Object.entries(errors).forEach(([field, message]) => {
		(Array.isArray(message) ? message : [message]).forEach((msg) => {
			form.setError(field as unknown as Path<TFieldValues>, {
				message: msg,
				type: "server",
			});
		});
	});
}

export function createFlashMessage(message: FlashMessage) {
	const serializedItems = localStorage.getItem("flashMessages");
	const currentMessages = serializedItems
		? (JSON.parse(serializedItems) as FlashMessage[])
		: [];

	currentMessages.push(message);
	localStorage.setItem("flashMessages", JSON.stringify(currentMessages));
}

export function readFlashMessages() {
	const serializedItems = localStorage.getItem("flashMessages");
	if (!serializedItems) return [];

	try {
		const messages = JSON.parse(serializedItems) as FlashMessage[];
		localStorage.removeItem("flashMessages");

		messages.forEach((msg) => {
			toast[msg.type](msg.title, {
				description: msg.description,
			});
		});
	} catch (error) {
		console.error("Failed to parse flash messages:", error);
		localStorage.removeItem("flashMessages");
	}
}
