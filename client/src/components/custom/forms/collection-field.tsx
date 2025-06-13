import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useArrayState } from "@/hooks/use-array";
import { splitCamelCaseAndCapitalize } from "@/lib/strings";
import { X } from "lucide-react";
import { ComponentProps, useRef } from "react";

export const CollectionField = ({
  value,
  name,
  placeholder = "Add a label",
  label,
  ...props
}: {
  value?: string[];
  name: string;
  label?: string;
} & ComponentProps<typeof Input>) => {
  const {
    state: elements,
    addUnique: addLabel,
    remove: removeLabel,
  } = useArrayState(value || []);

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <Label>{label || splitCamelCaseAndCapitalize(name)}</Label>

      <div className="flex flex-wrap gap-2 mb-2">
        {elements.map((element, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {element}
            <X
              className="w-3 h-3 cursor-pointer hover:text-red-500"
              onClick={() => removeLabel(index)}
            />
          </Badge>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          {...props}
          ref={inputRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // Prevent form submission
              addLabel(e.currentTarget.value.trim());
              e.currentTarget.value = ""; // Clear input after adding
            }
          }}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const input = inputRef.current;
            if (input && input.value.trim()) {
              addLabel(input.value.trim());
              input.value = ""; // Clear input after adding
            }
          }}
        >
          Add
        </Button>
      </div>

      <input type="hidden" name={name} value={JSON.stringify(elements)} />
    </div>
  );
};
