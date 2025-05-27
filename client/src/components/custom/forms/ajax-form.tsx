'use client';

import {ApiError, apiFetch} from "@/lib/fetch";
import {ComponentProps, useCallback, useEffect, useState} from "react";

interface AjaxFormProps<T> extends ComponentProps<"form"> {
    action: string,
    onRequestError?: (error: ApiError) => void,
    onResponse?: (response: T) => void,
    duringLoading?: (loading: boolean) => void,
    additionalData?: Record<string, any>,
    format?: "form-data" | "json",
}

export function AjaxForm<T, >({
                                  action,
                                  children,
                                  onRequestError,
                                  onResponse,
                                  duringLoading,
                                  method = 'POST',
                                  additionalData = {},
                                  format = 'json',
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
                data: {...Object.fromEntries(formData.entries()), ...additionalData},
                context: "client",
                format
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
    }, [onRequestError, onResponse, action, method, additionalData]);

    return (
        <form action={handleSubmit} {...props}>
            {children}
        </form>
    );
}