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
import { useState } from "react";
import { AjaxForm } from "../forms/ajax-form";
import { FormField } from "../forms/form-field";
import { LoaderButton } from "../loader-button";

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
  // const handleSubmit = (formData: FormData) => {
  //   const actualColumn: TaskColumn = {
  //     ...column,
  //     id: "id" in column ? column.id : Date.now(),
  //     title: formData.get("title") as string,
  //     color: formData.get("color") as string,
  //     tasks: "tasks" in column ? column.tasks : [],
  //   };
  //   onSubmit(actualColumn);
  //   onClose();
  // };

  const [pending, setPending] = useState(false);

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
          onResponse={(col) => {
            column = {
              ...col,
              id: "id" in column ? column.id : Date.now(),
            };
            console.log("Column created/updated:", column);
            onSubmit(column);
            onClose();
          }}
          onRequestError={(error) => console.error(error.data)}
          action={"/columns"}
          className="space-y-4"
          mutateData={(data) => {
            return {
              ...data,
              score: column.score,
            };
          }}
          duringLoading={setPending}
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
            <LoaderButton loading={pending}>
              {"id" in column ? "Save Changes" : "Create Column"}
            </LoaderButton>
          </DialogFooter>
        </AjaxForm>
      </DialogContent>
    </Dialog>
  );
};
