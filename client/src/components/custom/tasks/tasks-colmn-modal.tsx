import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskColumn } from "@/types";
import { AjaxForm } from "../forms/ajax-form";
import { FormField } from "../forms/form-field";

export interface TasksColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (column: TaskColumn) => void;
  column: TaskColumn | Pick<TaskColumn, "score">;
}

export const TasksColumnModal = ({
  isOpen,
  onClose,
  onSubmit,
  column,
}: TasksColumnModalProps) => {
  const handleSubmit = (formData: FormData) => {
    const newColumn: TaskColumn = {
      ...column,
      id: Date.now(),
      title: formData.get("title") as string,
      color: formData.get("color") as string,
    };
    onSubmit(newColumn);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-y-scroll max-h-[calc(100vh-10px)]">
        <DialogHeader>
          <DialogTitle>Create Column</DialogTitle>
          <DialogDescription>
            Fill in the details for your new column.
          </DialogDescription>
        </DialogHeader>

        <AjaxForm<TaskColumn>
          onResponse={(response) => {
            console.log(response);
            onSubmit(response);
          }}
          onRequestError={(error) => {
            console.error("Error submitting form:", error.data);
          }}
          mutateData={(data) => ({
            ...data,
            score: column.score,
            id: "id" in column ? column.id : undefined,
          })}
          action={"/columns"}
          className="space-y-4"
        >
          <div className="space-y-4">
            <FormField
              required
              name="title"
              defaultValue={"title" in column ? column.title || "" : ""}
            />
            <FormField
              type="color"
              name="color"
              required
              defaultValue={"color" in column ? column.color || "" : ""}
            />
          </div>
          <DialogFooter>
            <Button onClick={onClose} type="button" variant="outline">
              Cancel
            </Button>
            <Button>Create Column</Button>
          </DialogFooter>
        </AjaxForm>
      </DialogContent>
    </Dialog>
  );
};
