import {z} from "zod";

const EnvSchema = z.object({
    NEXT_PUBLIC_SERVER_URL: z.string().url(),
    SERVER_URL: z.string()
});

export const env = EnvSchema.parse(process.env);