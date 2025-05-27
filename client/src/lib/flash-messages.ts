import {apiFetch} from "@/lib/fetch";
import {toast} from "sonner";
import {useEffect, useRef} from "react";

type FlashMessages = { [key: "success" | "error" | "info"]: string[] };

export function useFlashMessages() {
    const wasDisplayed = useRef(false);

    useEffect(() => {
        if (!wasDisplayed.current) {
            displayFlashMessages();
            wasDisplayed.current = true;
        }
    }, []);
}

export function displayFlashMessages() {
    apiFetch<FlashMessages>("/flash-messages", {method: "GET"})
        .then(data => {
            Object.entries(data).forEach(([key, messages]) => {
                messages.forEach(message => toast[key](message, {closeButton: true}));
            });
        });
}