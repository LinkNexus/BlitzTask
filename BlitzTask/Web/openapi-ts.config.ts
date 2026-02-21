import { defineConfig } from "@hey-api/openapi-ts";
import path from "node:path";

export default defineConfig({
	input: path.join(__dirname, "../BlitzTask.json"),
	output: "src/api",
	plugins: [
		"@hey-api/typescript",
		"@hey-api/sdk",
		"@hey-api/client-fetch",
		"@tanstack/react-query",
	],
});
