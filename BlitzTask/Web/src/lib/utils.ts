import { type ClassValue, clsx } from "clsx";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
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
