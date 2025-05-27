import {ChangeEventHandler, useEffect, useState} from "react";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {capitalize} from "@/lib/strings";

export function AjaxInput({errors, label, name, type, ...props}: {
    errors: Record<string, string> | null,
    label?: string,
    name: string,
    type?: React.ComponentProps<typeof Input>["type"] | "textarea";
} & Omit<React.ComponentProps<typeof Input>, "name" | "type"> & Omit<React.ComponentProps<typeof Textarea>, "name" | "type">) {
    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        setError(errors?.[name]);
    }, [errors?.[name], name]);

    const onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
        if (props.onChange) {
            (props.onChange as ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>)(e);
        }
        if (errors && errors[name] && error) {
            setError(undefined);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <Label>{label || capitalize(name)}</Label>
            {type === "textarea" ? (
                <Textarea onChange={onChange} name={name} {...(props as React.ComponentProps<typeof Textarea>)} />
            ) : (
                <Input type={type} onChange={onChange} name={name} {...(props as React.ComponentProps<typeof Input>)} />
            )}
            {error && (
                <span className="text-red-500 text-sm">{error}</span>
            )}
        </div>
    );
}