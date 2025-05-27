export async function apiFetch<T>(url: string | URL, options: Omit<RequestInit, "body"> & {
    data?: Record<string, any> | null;
    context?: "client" | "server";
    format?: "json" | "form-data";
} = {data: null, format: "json"}) {
    const {context = "client", data, ...rest} = options;
    const endpoint = context === "client" ? process.env.NEXT_PUBLIC_SERVER_URL : process.env.SERVER_URL;
    let requestData: string | FormData | null = null;
    let headers: Record<string, string> = {};

    if (options.format === "json") {
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...rest.headers,
        };

        if (data) {
            requestData = JSON.stringify(data);
        }
    } else if (options.format === "form-data") {
        headers = {
            "Accept": "application/json",
            ...rest.headers,
        };
        if (data) {
            const formData = new FormData();
            for (const [key, value] of Object.entries(data)) {
                formData.append(key, value);
            }
            requestData = formData;
        }
    }

    const res = await fetch(endpoint + url.toString(), {
        body: requestData,
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