import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {capitalize} from "@/lib/strings";
import {Label} from "@/components/ui/label";

export function FormField({errors, label, name, type, ...props}: {
    errors?: string[],
    label?: string,
    name: string,
    type?: React.ComponentProps<typeof Input>["type"] | "textarea";
} & Omit<React.ComponentProps<typeof Input>, "name" | "type"> & Omit<React.ComponentProps<typeof Textarea>, "name" | "type">) {
    return (
        <div className="flex flex-col gap-2">
            <Label>{label || capitalize(name)}</Label>
            {type === "textarea" ? (
                <Textarea name={name} {...(props as React.ComponentProps<typeof Textarea>)} />
            ) : (
                <Input type={type} name={name} {...(props as React.ComponentProps<typeof Input>)} />
            )}
            {errors?.length > 0 && (
                <ul>
                    {errors?.map((error, index) => (
                        <li key={`${name}-error-${index}`} className="text-red-500 text-sm">{error}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}