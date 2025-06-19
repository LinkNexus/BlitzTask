"use client";

import { ApiError, apiFetch } from "@/lib/fetch";
import { ComponentProps, useActionState, useCallback, useEffect } from "react";

interface AjaxFormProps<T> extends ComponentProps<"form"> {
  action: string;
  onRequestError?: (error: ApiError) => void;
  onResponse?: (response: T) => void;
  duringLoading?: (loading: boolean) => void;
  contentType?: "form-data" | "json";
  mutateData?: (data: Record<string, any>) => Record<string, any>;
}

export function AjaxForm<T>({
  action,
  children,
  onRequestError,
  onResponse,
  duringLoading,
  method = "POST",
  contentType = "json",
  mutateData = (data) => data,
  ...props
}: AjaxFormProps<T>) {
  const executeRequest = useCallback(
    async (_: void | null, formData: FormData) => {
      try {
        onResponse?.(
          await apiFetch<T>(action, {
            method,
            contentType,
            data: mutateData(Object.fromEntries(formData.entries())),
          })
        );
      } catch (error) {
        if (error instanceof ApiError) {
          onRequestError?.(error);
        } else {
          console.error("Unexpected error:", error);
        }
      }
    },
    []
  );

  const [_, formAction, pending] = useActionState(executeRequest, null);

  useEffect(() => {
    duringLoading?.(pending);
  }, [pending, duringLoading]);

  return (
    <form action={formAction} {...props}>
      {children}
    </form>
  );
}
