import {useAppStore} from "@/store/store-provider";

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
    data?: Record<string, any> | null;
    contentType?: "json" | "form-data";
    accept?: "json" | "text";
}

export async function apiFetch<T>(url: string | URL, options: ApiFetchOptions = {
    data: null,
    contentType: "json",
    accept: "json"
}) {
    const {data = null, contentType = "json", accept = "json"} = options;
    let headers: Record<string, string> = {};
    let requestBody: string | FormData | null = null;

    if (contentType === "form-data") {
        if (!(data instanceof FormData)) {
            // @ts-ignore
            requestBody = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    requestBody.append(key, value);
                }
            })
        } else requestBody = data;
    } else {
        headers = {
            "Content-Type": "application/json",
        }
        if (data) requestBody = JSON.stringify(data);
    }

    if (accept === "json") headers["Accept"] = "application/json";

    const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + url.toString(), {
        ...options,
        body: requestBody,
        headers: {
            ...headers,
            ...options.headers
        },
        method: options.method ?? "GET",
        credentials: "include"
    });

    if (!response.ok) {
        if (response.status === 401) {
            useAppStore(state => state.setUser)(null);
        }

        throw new ApiError(await response.json(), response.status);
    }

    return accept === "json" ? (await response.json() as T) : (await response.text() as T);
}

export class ApiError extends Error {
    constructor(public data: any, public statusCode: number) {
        super();
        this.name = "ApiError";
    }
}