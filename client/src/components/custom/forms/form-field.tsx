import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { splitCamelCaseAndCapitalize } from "@/lib/strings";
import { ComponentProps, ReactNode } from "react";
import { CalendarField } from "./calendar-field";

type ConditionalInputProps =
  | ({ type?: ComponentProps<typeof Input>["type"] } & ComponentProps<
      typeof Input
    >)
  | ({ type: "textarea" } & ComponentProps<typeof Textarea>)
  | ({ type: "select" } & {
      options: { [key: string]: ReactNode };
    } & ComponentProps<typeof Select>);

type FormFieldProps = {
  errors?: string[];
  label?: string;
  name: string;
  type?: ComponentProps<typeof Input>["type"] | "textarea" | "select";
} & ConditionalInputProps;

export function FormField({
  errors,
  label,
  name,
  type,
  ...props
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label || splitCamelCaseAndCapitalize(name)}</Label>
      {type === "textarea" ? (
        <Textarea
          name={name}
          {...(props as React.ComponentProps<typeof Textarea>)}
        />
      ) : type === "select" ? (
        (() => {
          const { options = [], ...selectProps } = props as {
            options?: Record<string, ReactNode>;
          } & React.ComponentProps<typeof Select>;
          return (
            <Select name={name} {...selectProps}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${name}`} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(options).map(([key, value]) => (
                  <SelectItem key={`select-item-${key}`} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        })()
      ) : type === "date" ? (
        <CalendarField
          name={name}
          value={
            props.value
              ? new Date(props.value as string | number | Date)
              : undefined
          }
        />
      ) : (
        <Input
          type={type}
          name={name}
          {...(props as React.ComponentProps<typeof Input>)}
        />
      )}
      {Array.isArray(errors) && errors.length > 0 && (
        <ul>
          {errors.map((error, index) => (
            <li key={`${name}-error-${index}`} className="text-red-500 text-sm">
              {error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
