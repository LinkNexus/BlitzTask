import {apiFetch} from "@/lib/fetch";
import {toast} from "sonner";

export function displayFlashMessages() {
    apiFetch<{ [key: "success" | "error" | "info"]: string[] }>("/flash-messages", {
        "method": "GET",
    })
        .then(flashMessages => {
            Object.entries(flashMessages).forEach(([type, messages]) => {
                messages.forEach(message => toast[type](message, {closeButton: true}));
            })
        });
}