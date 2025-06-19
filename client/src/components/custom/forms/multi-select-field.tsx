import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useArrayState } from "@/hooks/use-array";
import { X } from "lucide-react";
import { ReactNode } from "react";

export const MultiSelectField = ({
  options,
  name,
  label,
}: {
  options: { value: any; element: ReactNode }[];
  name: string;
  label?: string;
}) => {
  const {
    state: selectedOptions,
    addUnique: addSelectedOption,
    removeItem: removeSelectedOption,
  } = useArrayState([] as string[]);

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium">{label || "Select Options"}</Label>

      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedOptions.map((option) => (
            <div
              key={option}
              className="flex w-fit items-center space-x-2 border p-2 rounded mb-2 shadow-sm hover:bg-gray-50"
            >
              <X onClick={() => removeSelectedOption(option)} size={12} />
              <label className="text-sm">
                {options.find((o) => o.value === option)?.element}
              </label>
            </div>
          ))}
        </div>
      )}

      {(!options || Object.keys(options).length === 0) && (
        <div className="text-sm text-gray-500">No options available</div>
      )}

      <div>
        {options.map(({ value, element }, index) => (
          <div
            key={index}
            className="flex items-center space-x-2 border p-2 rounded mb-2 shadow-sm hover:bg-gray-50"
          >
            <Label className="w-full">
              <Input
                checked={selectedOptions.includes(value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    addSelectedOption(value);
                  } else {
                    removeSelectedOption(value);
                  }
                }}
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              {element}
              {/* <div className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /> */}
            </Label>
          </div>
        ))}
      </div>

      <input
        type="hidden"
        name={name}
        value={JSON.stringify(selectedOptions)}
      />
    </div>
  );
};
