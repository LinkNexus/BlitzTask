'use client';

import {ApiError, apiFetch} from "@/lib/fetch";
import {ComponentProps, useCallback, useEffect, useState} from "react";

interface AjaxFormProps<T> extends ComponentProps<"form"> {
    action: string,
    onRequestError?: (error: ApiError) => void,
    onResponse?: (response: T) => void,
    duringLoading?: (loading: boolean) => void,
    contentType?: "form-data" | "json",
}

export function AjaxForm<T, >({
                                  action,
                                  children,
                                  onRequestError,
                                  onResponse,
                                  duringLoading,
                                  method = 'POST',
                                  contentType = 'json',
                                  ...props
                              }: AjaxFormProps<T>) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        duringLoading?.(loading);
    }, [loading, duringLoading]);

    const handleSubmit = useCallback(async (formData: FormData) => {
        setLoading(true);
        try {
            const resData = await apiFetch<T>(action, {
                method: method,
                data: Object.fromEntries(formData.entries()),
                context: "client",
                contentType
            });

            onResponse?.(resData);
        } catch (error) {
            if (error instanceof ApiError) {
                onRequestError?.(error);
            } else {
                console.error("Unexpected error:", error);
            }
        } finally {
            setLoading(false);
        }
    }, [onRequestError, onResponse, action, method]);

    return (
        <form action={handleSubmit} {...props}>
            {children}
        </form>
    );
}