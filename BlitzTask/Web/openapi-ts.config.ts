import {defineConfig} from "@hey-api/openapi-ts";

const port = "PORT" in process.env ? parseInt(process.env.PORT!, 10) : 8500;
export default defineConfig({
    input: `http://localhost:${port}/api/openapi/v1.json`,
    output: "src/api",
    plugins: [
        "@hey-api/typescript",
        "@hey-api/sdk",
        "@hey-api/client-fetch",
        "@tanstack/react-query",
    ],
});
