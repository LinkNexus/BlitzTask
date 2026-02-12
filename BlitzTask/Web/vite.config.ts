import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import tanstackRouter from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import {defineConfig} from "vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        tanstackRouter({
            target: "react",
            autoCodeSplitting: true,
        }),
        react({
            babel: {
                plugins: [["babel-plugin-react-compiler"]],
            },
        }),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            "@": path.join(__dirname, "src"),
        },
    },
    build: {
        emptyOutDir: true,
        outDir: path.join(__dirname, "../wwwroot"),
    },
    server: {
        port: "PORT" in process.env ? parseInt(process.env.PORT!, 10) : 8500,
        proxy: {
            "/api": "http://localhost:5209",
        },
    },
});
