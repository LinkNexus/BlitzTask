export async function apiFetch<T>(url: string | URL, options: Omit<RequestInit, "body"> & {
    data: Record<string, any> | null;
    context?: "client" | "server";
} = {data: null}) {
    const {context = "client", data, ...rest} = options;
    const endpoint = context === "client" ? process.env.NEXT_PUBLIC_SERVER_URL : process.env.SERVER_URL;
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...rest.headers,
    };

    console.log(endpoint + url.toString());

    const res = await fetch(endpoint + url.toString(), {
        body: data ? JSON.stringify(data) : null,
        headers: {
            ...headers,
            ...options.headers
        },
        method: options.method || "POST",
        credentials: "include",
        ...rest
    });

    if (!res.ok) {
        throw new ApiError(await res.json(), res.status);
    }

    return await res.json() as T;
}

export class ApiError extends Error {
    constructor(public data: any, public statusCode: number) {
        super();
        this.name = "ApiError";
    }
}