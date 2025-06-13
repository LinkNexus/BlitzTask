"use client";

import { usePageInfos } from "@/components/custom/page-infos-provider";
import { SortableTask } from "@/components/custom/tasks/sortable-task";
import { TaskModal } from "@/components/custom/tasks/task-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task } from "@/types";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Edit, MoreVertical, Plus, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";

// import {TaskEditModal} from './TaskEditModal';
// import {NewTaskModal} from './NewTaskModal';

interface IssueBoardProps {
  selectedProject?: string | null;
}

// Define the Column type for type safety
interface Column {
  id: string;
  title: string;
  color: string;
}

const IssuesBoardPage: React.FC<IssueBoardProps> = ({
  selectedProject,
}: IssueBoardProps) => {
  const [selectedBoard, setSelectedBoard] = useState("website-redesign");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [renamingColumnId, setRenamingColumnId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [newTaskColumnId, setNewTaskColumnId] = useState<string | null>(null);
  const { setInfos } = usePageInfos();

  const boards = [
    { id: "website-redesign", name: "Website Redesign", color: "bg-blue-500" },
    { id: "mobile-app", name: "Mobile App", color: "bg-purple-500" },
    { id: "marketing", name: "Marketing Campaign", color: "bg-green-500" },
  ];

  useEffect(() => {
    if (selectedProject) {
      setSelectedBoard(
        selectedProject === "1"
          ? "website-redesign"
          : selectedProject === "2"
            ? "mobile-app"
            : "marketing"
      );
    }
  }, [selectedProject]);

  useEffect(() => {
    setInfos({
      title: "Issues Board",
      currentActiveNavItem: "Issues Board",
    });
  }, []);

  // Ensure all columns have at least an empty array
  useEffect(() => {
    const initializedTasks = { ...tasks };
    columns.forEach((column: Column) => {
      if (!(initializedTasks as any)[column.id]) {
        (initializedTasks as any)[column.id] = [];
      }
    });
    setTasks(initializedTasks);
  }, []);

  const [columns, setColumns] = useState<Column[]>([
    { id: "backlog", title: "Backlog", color: "border-gray-300" },
    { id: "todo", title: "To Do", color: "border-blue-300" },
    { id: "in-progress", title: "In Progress", color: "border-yellow-300" },
    { id: "review", title: "Review", color: "border-purple-300" },
    { id: "done", title: "Done", color: "border-green-300" },
  ]);

  // Initialize tasks state with all columns, even empty ones
  const [tasks, setTasks] = useState<{ [key: string]: Task[] }>({
    ...Object.fromEntries(columns.map((col: Column) => [col.id, []])),
    // Then add the actual tasks
    backlog: [
      {
        id: "1",
        title: "Research competitor analysis",
        priority: "Medium",
        assignees: [{ name: "Sarah Wilson", avatar: "SW" }],
        dueDate: "2024-01-20",
        labels: ["Research"],
        description: "Analyze competitor features and pricing",
      },
      {
        id: "2",
        title: "Define user personas",
        priority: "High",
        assignees: [{ name: "Mike Johnson", avatar: "MJ" }],
        dueDate: "2024-01-18",
        labels: ["UX"],
        description: "Create detailed user personas based on research",
      },
    ],
    todo: [
      {
        id: "3",
        title: "Design homepage wireframes",
        priority: "High",
        assignees: [{ name: "Emma Davis", avatar: "ED" }],
        dueDate: "2024-01-16",
        labels: ["Design"],
        description: "Create wireframes for the new homepage layout",
      },
      {
        id: "4",
        title: "Setup development environment",
        priority: "Medium",
        assignees: [{ name: "Alex Chen", avatar: "AC" }],
        dueDate: "2024-01-17",
        labels: ["Development"],
        description: "Configure development tools and environment",
      },
    ],
    "in-progress": [
      {
        id: "5",
        title: "Implement user authentication",
        priority: "High",
        assignees: [
          { name: "Sarah Wilson", avatar: "SW" },
          { name: "Alex Chen", avatar: "AC" },
        ],
        dueDate: "2024-01-15",
        labels: ["Development", "Backend"],
        description: "Build secure user authentication system",
      },
      {
        id: "6",
        title: "Create component library",
        priority: "Medium",
        assignees: [{ name: "Mike Johnson", avatar: "MJ" }],
        dueDate: "2024-01-19",
        labels: ["Development", "Frontend"],
        description: "Build reusable UI components",
      },
    ],
    review: [
      {
        id: "7",
        title: "API documentation",
        priority: "Low",
        assignees: [{ name: "Emma Davis", avatar: "ED" }],
        dueDate: "2024-01-14",
        labels: ["Documentation"],
        description: "Document all API endpoints and usage",
      },
    ],
    done: [
      {
        id: "8",
        title: "Project setup and planning",
        priority: "High",
        assignees: [
          { name: "Alex Chen", avatar: "AC" },
          { name: "Emma Davis", avatar: "ED" },
        ],
        dueDate: "2024-01-10",
        labels: ["Planning"],
        description: "Initial project setup and milestone planning",
      },
      {
        id: "9",
        title: "Team onboarding",
        priority: "Medium",
        assignees: [{ name: "Sarah Wilson", avatar: "SW" }],
        dueDate: "2024-01-12",
        labels: ["Management"],
        description: "Onboard team members and assign roles",
      },
    ],
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    let overColumnId = overId;
    const isDirectColumnDrop = columns.some((col: Column) => col.id === overId);
    const isDroppableContainer = overId.startsWith("droppable-");
    const isContentContainer = overId.startsWith("content-");
    if (isDirectColumnDrop) {
      overColumnId = overId;
    } else if (isDroppableContainer) {
      overColumnId = overId.replace("droppable-", "");
    } else if (isContentContainer) {
      overColumnId = overId.replace("content-", "");
    } else {
      const element = document.getElementById(overId);
      if (element && element.dataset.columnId) {
        overColumnId = element.dataset.columnId;
      } else {
        const taskColumn = findColumn(overId);
        if (taskColumn) {
          overColumnId = taskColumn;
        }
      }
    }
    if (!columns.some((col: Column) => col.id === overColumnId)) {
      return;
    }
    const activeColumn = findColumn(activeId);
    if (!activeColumn || !overColumnId || activeColumn === overColumnId) return;
    setTasks((prev: { [key: string]: Task[] }) => {
      const activeItems = prev[activeColumn] || [];
      const overItems = prev[overColumnId] || [];
      const activeIndex = activeItems.findIndex(
        (item: Task) => item.id === activeId
      );
      const activeItem = activeItems[activeIndex];
      return {
        ...prev,
        [activeColumn]: activeItems.filter(
          (item: Task) => item.id !== activeId
        ),
        [overColumnId]: [...overItems, activeItem],
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const isOverColumn = columns.some((col: Column) => col.id === overId);
    const isOverDroppable = overId.startsWith("droppable-");
    const activeColumn = findColumn(activeId);
    const overColumn = isOverColumn
      ? overId
      : isOverDroppable
        ? overId.replace("droppable-", "")
        : findColumn(overId);
    if (!activeColumn || !overColumn) return;
    if (isOverColumn && activeColumn !== overColumn) {
      setTasks((prev: { [key: string]: Task[] }) => {
        const activeItems = prev[activeColumn];
        const overItems = prev[overColumn] || [];
        const activeIndex = activeItems.findIndex(
          (item: Task) => item.id === activeId
        );
        const activeItem = activeItems[activeIndex];
        return {
          ...prev,
          [activeColumn]: activeItems.filter(
            (item: Task) => item.id !== activeId
          ),
          [overColumn]: [...overItems, activeItem],
        };
      });
      return;
    }
    if (activeColumn === overColumn) {
      setTasks((prev: { [key: string]: Task[] }) => {
        const items = prev[activeColumn];
        const activeIndex = items.findIndex(
          (item: Task) => item.id === activeId
        );
        const overIndex = items.findIndex((item: Task) => item.id === overId);
        return {
          ...prev,
          [activeColumn]: arrayMove(items, activeIndex, overIndex),
        };
      });
    }
  };

  // Find which column contains a task with the given id
  const findColumn = (id: string) => {
    if (id.startsWith("droppable-")) {
      return id.replace("droppable-", "");
    }
    const element = document.getElementById(id);
    if (element && element.dataset.columnId) {
      return element.dataset.columnId;
    }
    if (id.startsWith("content-")) {
      return id.replace("content-", "");
    }
    if (columns.some((col: Column) => col.id === id)) {
      return id;
    }
    for (const [columnId, items] of Object.entries(tasks)) {
      if (Array.isArray(items) && items.some((item: Task) => item?.id === id)) {
        return columnId;
      }
    }
    return null;
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleSaveTask = (updatedTask: Task) => {
    setTasks((prev: { [key: string]: Task[] }) => {
      const newTasks = { ...prev };
      for (const columnKey of Object.keys(newTasks)) {
        const taskIndex = newTasks[columnKey].findIndex(
          (t: Task) => t.id === updatedTask.id
        );
        if (taskIndex !== -1) {
          newTasks[columnKey][taskIndex] = updatedTask;
          break;
        }
      }
      return newTasks;
    });
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  const handleAddTask = (task: Task, columnId: string) => {
    setTasks((prev: { [key: string]: Task[] }) => ({
      ...prev,
      [columnId]: [...(prev[columnId] || []), task],
    }));
    setIsNewTaskModalOpen(false);
  };

  // Move a task to a different column
  const handleMoveTask = (taskId: string, targetColumnId: string) => {
    setTasks((prev: { [key: string]: Task[] }) => {
      const sourceColumnId = findColumn(taskId);
      if (!sourceColumnId || sourceColumnId === targetColumnId) return prev;
      const sourceTasks = [...(prev[sourceColumnId] || [])];
      const targetTasks = [...(prev[targetColumnId] || [])];
      const taskIdx = sourceTasks.findIndex((t: Task) => t.id === taskId);
      if (taskIdx === -1) return prev;
      const [task] = sourceTasks.splice(taskIdx, 1);
      return {
        ...prev,
        [sourceColumnId]: sourceTasks,
        [targetColumnId]: [...targetTasks, task],
      };
    });
  };

  // Delete a task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev: { [key: string]: Task[] }) => {
      const columnId = findColumn(taskId);
      if (!columnId) return prev;
      return {
        ...prev,
        [columnId]: prev[columnId].filter((t: Task) => t.id !== taskId),
      };
    });
  };

  // Rename column handler
  const handleRenameColumn = (columnId: string, newTitle: string) => {
    setColumns((prev: Column[]) =>
      prev.map((col: Column) =>
        col.id === columnId ? { ...col, title: newTitle } : col
      )
    );
    setRenamingColumnId(null);
    setRenameValue("");
  };
  const handleDeleteColumn = (columnId: string) => {
    setColumns((prev: Column[]) =>
      prev.filter((col: Column) => col.id !== columnId)
    );
    setTasks((prev: { [key: string]: Task[] }) => {
      const newTasks = { ...prev };
      delete newTasks[columnId];
      return newTasks;
    });
  };

  const activeTask = activeId
    ? (Object.values(tasks)
        .flat()
        .find((task: any) => (task as Task).id === activeId) as Task | null)
    : null;

  return (
    <div className="space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col md:flex-row items-center space-x-4 mt-2">
          {boards.map((board) => (
            <Button
              key={board.id}
              variant={selectedBoard === board.id ? "default" : "outline"}
              className={selectedBoard === board.id ? "bg-primary" : ""}
              onClick={() => setSelectedBoard(board.id)}
            >
              <div className={`w-3 h-3 rounded-full ${board.color} mr-2`}></div>
              {board.name}
            </Button>
          ))}
        </div>
        <Button variant="outline" onClick={() => setIsNewTaskModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Column
        </Button>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-6 overflow-x-auto pb-6">
          {columns.map((column: Column) => (
            <div key={column.id} className="flex-shrink-0 w-80">
              <Card className={`border-t-4 ${column.color}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    {renamingColumnId === column.id ? (
                      <form
                        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                          e.preventDefault();
                          handleRenameColumn(column.id, renameValue);
                        }}
                        className="flex items-center w-full"
                      >
                        <input
                          className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide bg-transparent border-b border-gray-400 focus:outline-none w-full"
                          value={renameValue}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setRenameValue(e.target.value)
                          }
                          autoFocus
                          onBlur={() => setRenamingColumnId(null)}
                        />
                      </form>
                    ) : (
                      <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        {column.title}
                      </CardTitle>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {tasks[column.id as keyof typeof tasks]?.length || 0}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setRenamingColumnId(column.id);
                              setRenameValue(column.title);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteColumn(column.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <SortableContext
                    items={
                      tasks[column.id as keyof typeof tasks]?.map(
                        (task: Task) => task.id
                      ) || []
                    }
                    strategy={verticalListSortingStrategy}
                  >
                    <div
                      className="space-y-3 min-h-[100px]"
                      id={`droppable-${column.id}`}
                      data-column-id={column.id}
                    >
                      {tasks[column.id as keyof typeof tasks]?.map(
                        (task: Task) => (
                          <SortableTask
                            key={task.id}
                            task={task}
                            onEdit={handleEditTask}
                            onMove={(targetColumnId: string) =>
                              handleMoveTask(task.id, targetColumnId)
                            }
                            onDelete={() => handleDeleteTask(task.id)}
                            moveOptions={columns
                              .filter((col: Column) => col.id !== column.id)
                              .map((col: Column) => ({
                                id: col.id,
                                title: col.title,
                              }))}
                          />
                        )
                      )}
                    </div>
                  </SortableContext>
                  <Button
                    variant="ghost"
                    className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => {
                      setIsNewTaskModalOpen(true);
                      setNewTaskColumnId(column.id);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add task
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <SortableTask
              task={activeTask}
              onEdit={() => {}}
              onMove={() => {}}
              onDelete={() => {}}
              moveOptions={columns
                .filter((col: Column) => col.id !== findColumn(activeTask.id))
                .map((col: Column) => ({
                  id: col.id,
                  title: col.title,
                }))}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* <TaskEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={editingTask}
        onSave={handleSaveTask}
      />

      {/* New Task Modal */}
      {/* <AddTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onAdd={handleAddTask}
        columnId={newTaskColumnId}
      />  */}

      <TaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={editingTask}
        onSave={handleSaveTask}
      />
    </div>
  );
};

export default IssuesBoardPage;
