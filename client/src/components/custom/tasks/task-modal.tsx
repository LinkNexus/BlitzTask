import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Task, User } from "@/types";
import { CollectionField } from "../forms/collection-field";
import { FormField } from "../forms/form-field";
import { MultiSelectField } from "../forms/multi-select-field";

export interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: (task: Task) => void;
}

export const TaskModal = ({
  isOpen,
  onClose,
  task,
  onSave,
}: TaskModalProps) => {
  const users: Pick<User, "name" | "avatar">[] = [
    { name: "John Doe", avatar: "/avatars/john.jpg" },
    { name: "Jane Smith", avatar: "/avatars/jane.jpg" },
    { name: "Alice Johnson", avatar: "/avatars/alice.jpg" },
    { name: "Bob Brown", avatar: "/avatars/bob.jpg" },
  ];

  const handleSubmit = (formData: FormData) => {
    const data: Record<string, any> = Object.fromEntries(formData.entries());

    onSave({
      id: task ? task.id : crypto.randomUUID(),
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.dueDate,
      labels: data.labels ? JSON.parse(data.labels) : [],
      assignees: data.assignees ? JSON.parse(data.assignees) : [],
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-y-scroll max-h-[calc(100vh-10px)]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit" : "Create"} Task</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <FormField
              defaultValue={task?.title || ""}
              name="title"
              placeholder="Enter the task title"
              required
            />

            <FormField name="description" type="textarea" />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                defaultValue={task?.priority || "Medium"}
                name="priority"
                type="select"
                options={{
                  Low: "Low",
                  Medium: "Medium",
                  High: "High",
                }}
              />

              <FormField
                defaultValue={task?.dueDate || ""}
                name="dueDate"
                type="date"
                placeholder="Select due date"
              />
            </div>

            <CollectionField name="labels" value={task?.labels} />

            <MultiSelectField
              name="assignees"
              label="Assign Users"
              options={users.map((user) => ({
                value: user.name,
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
                      <span className="truncate font-medium">{user.name}</span>
                    </div>
                  </div>
                ),
              }))}
            />
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
