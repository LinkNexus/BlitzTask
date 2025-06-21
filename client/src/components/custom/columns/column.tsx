import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task, TaskColumn } from "@/types";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Edit, MoreVertical, Plus, Trash2 } from "lucide-react";
import { SortableTask } from "../tasks/sortable-task";

interface TaskColumnProps {
  onAdd: (position: "before" | "after") => void;
  onEdit: () => void;
  onDelete: () => void;
  column: TaskColumn;
  columns: TaskColumn[];
  tasksOptions: {
    onMove: (taskId: number, targetColumnId: number) => void;
    onEdit: (task: Task) => void;
    onDelete: (taskId: number) => void;
    onAdd: () => void;
  };
}

export const Column = ({
  column,
  columns,
  tasksOptions,
  onAdd,
  onEdit,
  onDelete,
}: TaskColumnProps) => {
  return (
    <div key={column.id} className="flex-shrink-0 w-80">
      <Card className={`border-t-4`} style={{ borderColor: column.color }}>
        <ColumnHeader
          onEdit={onEdit}
          onDelete={onDelete}
          onAdd={onAdd}
          column={column}
        />
        <ColumnBody
          column={column}
          columns={columns}
          tasksOptions={tasksOptions}
        />
      </Card>
    </div>
  );
};

const ColumnHeader = ({
  column,
  onAdd,
  onEdit,
  onDelete,
}: Pick<TaskColumnProps, "column" | "onAdd" | "onDelete" | "onEdit">) => {
  return (
    <CardHeader className="pb-3">
      <div className="flex justify-between items-center">
        <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          {column.title}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {column.tasks.length}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem>
                    <Plus className="w-4 h-4 mr-2" /> Insert Column
                  </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onAdd("before")}>
                    Before
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAdd("after")}>
                    After
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </CardHeader>
  );
};

const ColumnBody = ({
  column,
  columns,
  tasksOptions,
}: Omit<TaskColumnProps, "onAdd" | "onEdit" | "onDelete">) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <CardContent className="space-y-3">
      <div
        ref={setNodeRef}
        className={`space-y-3 min-h-[350px] transition-colors duration-150 ${
          isOver ? "bg-gray-100 dark:bg-gray-800" : ""
        }`}
      >
        <SortableContext
          items={column.tasks}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task: Task) => (
            <SortableTask
              key={task.id}
              task={task}
              onEdit={() => tasksOptions.onEdit(task)}
              onMove={(targetColumnId) =>
                tasksOptions.onMove(task.id, targetColumnId)
              }
              onDelete={() => tasksOptions.onDelete(task.id)}
              moveOptions={columns
                .filter((col: TaskColumn) => col.id !== column.id)
                .map((col: TaskColumn) => ({
                  id: col.id,
                  title: col.title,
                }))}
            />
          ))}
        </SortableContext>
      </div>
      <Button
        onClick={tasksOptions.onAdd}
        variant="ghost"
        className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add task
      </Button>
    </CardContent>
  );
};
