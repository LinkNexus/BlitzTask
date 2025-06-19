import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppStore } from "@/store/store-provider";
import { Task, TaskPriority, User } from "@/types";
import { CollectionField } from "../forms/collection-field";
import { FormField } from "../forms/form-field";
import { MultiSelectField } from "../forms/multi-select-field";

export interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: { columnId: number } | Task;
  onSave: (task: Task) => void;
}

export const TaskModal = ({
  isOpen,
  onClose,
  task,
  onSave,
}: TaskModalProps) => {
  const users: Pick<User, "name" | "avatar">[] = [
    { name: "John Doe", avatar: "JD" },
    { name: "Jane Smith", avatar: "JS" },
    { name: "Alice Johnson", avatar: "AJ" },
    { name: "Bob Brown", avatar: "BB" },
  ];
  const { mode } = useAppStore((state) => state);

  const handleSubmit = (formData: FormData) => {
    const data: Record<string, any> = Object.fromEntries(formData.entries());

    onSave({
      id: "id" in task ? task.id : Date.now(), // Generate a new ID if creating a task
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.dueDate,
      labels: JSON.parse(data.labels),
      assignees: JSON.parse(data.assignees),
      columnId: task.columnId,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-y-scroll max-h-[calc(100vh-10px)]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit" : "Create"} Task</DialogTitle>
          <DialogDescription>
            {task
              ? "Edit your task details below."
              : "Fill in the details for your new task."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" action={handleSubmit}>
          <div className="space-y-4">
            <FormField
              defaultValue={"title" in task ? task.title : ""}
              name="title"
              placeholder="Enter the task title"
              required
            />

            <FormField
              name="description"
              type="textarea"
              defaultValue={"description" in task ? task.description : ""}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                defaultValue={"priority" in task ? task.priority : "medium"}
                name="priority"
                type="select"
                options={
                  {
                    low: "Low",
                    medium: "Medium",
                    high: "High",
                    urgent: "Urgent",
                  } as Record<TaskPriority, string>
                }
              />

              <FormField
                defaultValue={"dueDate" in task ? task.dueDate : ""}
                name="dueDate"
                type="date"
                placeholder="Select due date"
              />
            </div>

            <CollectionField
              name="labels"
              value={"labels" in task ? task.labels : []}
            />

            {mode === "teams" && (
              <MultiSelectField
                name="assignees"
                label="Assign Users"
                options={users.map((user) => ({
                  value: user,
                  element: (
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="rounded-lg">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          {user.name}
                        </span>
                      </div>
                    </div>
                  ),
                }))}
              />
            )}
          </div>

          <DialogFooter>
            <Button onClick={onClose} type="button" variant="outline">
              Cancel
            </Button>
            <Button>{task ? "Save Changes" : "Create Task"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
