export type FlashMessage = {
	type: "success" | "error" | "info" | "warning";
	title: string;
	description?: string;
};
