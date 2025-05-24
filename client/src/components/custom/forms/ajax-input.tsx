import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {ChangeEventHandler, ComponentProps, useEffect, useState} from "react";
import {capitalize} from "@/lib/strings";

export function AjaxInput({errors, label, name, ...props}: Omit<ComponentProps<typeof Input>, "name"> & {
    errors: Record<string, string> | null,
    label?: string,
    name: string
}) {
    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        setError(errors?.[name]);
    }, [errors?.[name]]);

    const onChange: ChangeEventHandler = (e) => {
        props.onChange?.call(e);
        if (errors && errors[name] && error) {
            setError(null);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <Label>{label || capitalize(name)}</Label>
            <Input onChange={onChange} name={name} {...props} />
            {error && (
                <span className="text-red-500 text-sm">{error}</span>
            )}
        </div>
    );

}