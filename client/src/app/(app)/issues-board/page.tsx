"use client";

import { Column } from "@/components/custom/columns/column";
import { TasksColumnModal } from "@/components/custom/columns/tasks-colmn-modal";
import { usePageInfos } from "@/components/custom/page-infos-provider";
import { SortableTask } from "@/components/custom/tasks/sortable-task";
import { TaskModal } from "@/components/custom/tasks/task-modal";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/store-provider";
import { Task, TaskColumn } from "@/types";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

const users = [
  { id: 1, name: "Sarah Wilson", avatar: "SW" },
  { id: 2, name: "Mike Johnson", avatar: "MJ" },
  { id: 3, name: "Emma Davis", avatar: "ED" },
  { id: 4, name: "Alex Chen", avatar: "AC" },
  { id: 5, name: "John Smith", avatar: "JS" },
  { id: 6, name: "Olivia Brown", avatar: "OB" },
  { id: 7, name: "Liam Taylor", avatar: "LT" },
  { id: 8, name: "Sophia Martinez", avatar: "SM" },
  { id: 9, name: "James Anderson", avatar: "JA" },
  { id: 10, name: "Isabella Thomas", avatar: "IT" },
];

const data: TaskColumn[] = [
  {
    id: 1,
    title: "Backlog",
    color: "#d1d5db",
    score: 0,
    tasks: [
      {
        id: 1,
        title: "Research competitor analysis",
        priority: "medium",
        assignees: [users[0], users[1]],
        dueDate: "2024-01-20",
        labels: ["Research"],
        description: "Analyze competitor features and pricing",
        columnId: 1,
      },
      {
        id: 6,
        title: "Create component library",
        priority: "medium",
        assignees: [users[4], users[2]],
        dueDate: "2024-01-19",
        labels: ["Development", "Frontend"],
        description: "Build reusable UI components",
        columnId: 1,
      },
    ],
  },
  {
    id: 2,
    title: "To Do",
    color: "#93c5fd",
    score: 100,
    tasks: [
      {
        id: 2,
        title: "Define user personas",
        priority: "high",
        assignees: [users[2]],
        dueDate: "2024-01-18",
        labels: ["UX"],
        description: "Create detailed user personas based on research",
        columnId: 2,
      },
      {
        id: 7,
        title: "API documentation",
        priority: "low",
        assignees: [users[1], users[3]],
        dueDate: "2024-01-14",
        labels: ["Documentation"],
        description: "Document all API endpoints and usage",
        columnId: 2,
      },
    ],
  },
  {
    id: 3,
    title: "In Progress",
    color: "#fde047",
    score: 300,
    tasks: [
      {
        id: 3,
        title: "Design homepage wireframes",
        priority: "high",
        assignees: [users[0], users[5]],
        dueDate: "2024-01-16",
        labels: ["Design"],
        description: "Create wireframes for the new homepage layout",
        columnId: 3,
      },
      {
        id: 8,
        title: "Project setup and planning",
        priority: "high",
        assignees: [users[4], users[7]],
        dueDate: "2024-01-10",
        labels: ["Planning"],
        description: "Initial project setup and milestone planning",
        columnId: 3,
      },
    ],
  },
  {
    id: 4,
    title: "Review",
    color: "#d8b4fe",
    score: 500,
    tasks: [
      {
        id: 4,
        title: "Setup development environment",
        priority: "medium",
        assignees: [users[8], users[9]],
        dueDate: "2024-01-17",
        labels: ["Development"],
        description: "Configure development tools and environment",
        columnId: 4,
      },
      {
        id: 9,
        title: "Team onboarding",
        priority: "medium",
        assignees: [users[6], users[3]],
        dueDate: "2024-01-12",
        labels: ["Management"],
        description: "Onboard team members and assign roles",
        columnId: 4,
      },
    ],
  },
  {
    id: 5,
    title: "Done",
    color: "#86efac",
    score: 700,
    tasks: [
      {
        id: 5,
        title: "Implement user authentication",
        priority: "high",
        assignees: [users[1], users[2], users[3]],
        dueDate: "2024-01-15",
        labels: ["Development", "Backend"],
        description: "Build secure user authentication system",
        columnId: 5,
      },
    ],
  },
];

const defaultColumns: TaskColumn[] = [
  {
    id: 1,
    title: "Backlog",
    color: "#d1d5db",
    score: 0,
    tasks: [],
  },
  {
    id: 2,
    title: "To Do",
    color: "#93c5fd",
    score: 100,
    tasks: [],
  },
  {
    id: 3,
    title: "In Progress",
    color: "#fde047",
    score: 300,
    tasks: [],
  },
  {
    id: 4,
    title: "Review",
    color: "#d8b4fe",
    score: 500,
    tasks: [],
  },
  {
    id: 5,
    title: "Done",
    color: "#86efac",
    score: 700,
    tasks: [],
  },
];

const IssuesBoardPage = () => {
  const { mode } = useAppStore((state) => state);
  const { setInfos } = usePageInfos();
  useEffect(() => {
    setInfos({
      title: "Issues Board",
      currentActiveNavItem: "Issues Board",
    });
  }, []);

  const [columns, setColumns] = useState<TaskColumn[]>(
    mode === "personal" ? defaultColumns : data
  );
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<{ columnId: number } | Task>({
    columnId: 0,
  });
  const [editingColumn, setEditingColumn] = useState<
    TaskColumn | { score: number }
  >({
    score: 0,
  });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

  useEffect(() => {
    setColumns(mode === "personal" ? defaultColumns : data);
  }, [mode]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  // Helper to find column by task id
  const findColumn = (taskId: number) =>
    columns.find((col) => col.tasks.some((task) => task.id === taskId));

  // Handle drag end
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    // Find source and destination columns
    const sourceCol = findColumn(Number(active.id));
    const destCol = findColumn(Number(over.id));
    if (!sourceCol || !destCol) return;

    // If moving within the same column
    if (sourceCol.id === destCol.id) {
      const colIdx = columns.findIndex((col) => col.id === sourceCol.id);
      const oldIdx = sourceCol.tasks.findIndex(
        (task) => task.id === Number(active.id)
      );
      const newIdx = destCol.tasks.findIndex(
        (task) => task.id === Number(over.id)
      );
      if (oldIdx === -1 || newIdx === -1) return;
      const newTasks = arrayMove(sourceCol.tasks, oldIdx, newIdx);
      const newColumns = [...columns];
      newColumns[colIdx] = { ...sourceCol, tasks: newTasks };
      setColumns(newColumns);
    } else {
      // Moving between columns
      const sourceColIdx = columns.findIndex((col) => col.id === sourceCol.id);
      const destColIdx = columns.findIndex((col) => col.id === destCol.id);
      const taskIdx = sourceCol.tasks.findIndex(
        (task) => task.id === Number(active.id)
      );
      if (taskIdx === -1) return;
      const task = { ...sourceCol.tasks[taskIdx], columnId: destCol.id };
      const newSourceTasks = [...sourceCol.tasks];
      newSourceTasks.splice(taskIdx, 1);
      // Insert at the position of the hovered task, or at the end
      const overIdx = destCol.tasks.findIndex(
        (task) => task.id === Number(over.id)
      );
      const newDestTasks = [...destCol.tasks];
      if (overIdx === -1) {
        newDestTasks.push(task);
      } else {
        newDestTasks.splice(overIdx, 0, task);
      }
      const newColumns = [...columns];
      newColumns[sourceColIdx] = { ...sourceCol, tasks: newSourceTasks };
      newColumns[destColIdx] = { ...destCol, tasks: newDestTasks };
      setColumns(newColumns);
    }
    setActiveTask(null);
  };

  // Handle drag start for overlay
  const handleDragStart = (event: any) => {
    const { active } = event;
    const col = findColumn(Number(active.id));
    const task = col?.tasks.find((t) => t.id === Number(active.id));
    if (task) setActiveTask(task);
  };

  const getColumnScore = (columndId: number, position: "before" | "after") => {
    const column = columns.find((col) => col.id === columndId);
    const index = columns.findIndex((col) => col.id === columndId);

    if (!column || !index) throw new Error("Column not found");

    if (position === "before") {
      if (index > 0) return (column.score + columns[index - 1].score) / 2;
      return column.score - 200;
    } else {
      if (index < columns.length - 1) {
        return (column.score + columns[index + 1].score) / 2;
      }
      return column.score + 200;
    }
  };

  return (
    <div className="space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex justify-end items-center">
        <Button
          onClick={() => {
            setEditingColumn({
              score: columns[columns.length - 1].score + 200,
            });
            setIsColumnModalOpen(true);
          }}
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Column
        </Button>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <SortableContext items={columns.map((col) => col.id)}>
          <div className="flex space-x-6 overflow-x-auto pb-6">
            {columns.map((column) => (
              <SortableContext
                key={column.id}
                items={column.tasks.map((t) => t.id)}
              >
                <Column
                  onEdit={() => {
                    setEditingColumn(column);
                    setIsColumnModalOpen(true);
                  }}
                  onDelete={() => {
                    setColumns((prev) =>
                      prev.filter((col) => col.id !== column.id)
                    );
                  }}
                  key={column.id}
                  column={column}
                  columns={columns}
                  tasksOptions={{
                    onMove: (taskId, targetColumnId) => {
                      console.log(
                        "Moving task",
                        taskId,
                        "to column",
                        targetColumnId
                      );
                      const sourceCol = findColumn(taskId);
                      const targetCol = columns.find(
                        (col) => col.id === targetColumnId
                      );
                      if (!sourceCol || !targetCol) return;

                      const task = sourceCol.tasks.find((t) => t.id === taskId);
                      if (!task) return;

                      // Remove from source column
                      const updatedSourceTasks = sourceCol.tasks.filter(
                        (t) => t.id !== taskId
                      );
                      // Add to target column
                      const updatedTargetTasks = [
                        ...targetCol.tasks,
                        { ...task, columnId: targetColumnId },
                      ];

                      setColumns((prev) =>
                        prev.map((col) =>
                          col.id === sourceCol.id
                            ? { ...col, tasks: updatedSourceTasks }
                            : col.id === targetCol.id
                              ? { ...col, tasks: updatedTargetTasks }
                              : col
                        )
                      );
                    },
                    onEdit: (task) => {
                      setEditingTask(task);
                      setIsTaskModalOpen(true);
                    },
                    onDelete: (taskId) => {
                      setColumns((prev) =>
                        prev.map((col) => ({
                          ...col,
                          tasks: col.tasks.filter((t) => t.id !== taskId),
                        }))
                      );
                    },
                    onAdd: () => {
                      setEditingTask({ columnId: column.id });
                      setIsTaskModalOpen(true);
                    },
                  }}
                  onAdd={(position) => {
                    setEditingColumn({
                      score: getColumnScore(column.id, position),
                    });
                    setIsColumnModalOpen(true);
                  }}
                />
              </SortableContext>
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeTask ? (
            <SortableTask
              task={activeTask}
              onEdit={() => {}}
              onMove={() => {}}
              onDelete={() => {}}
              moveOptions={columns
                .filter((col) => col.id !== findColumn(activeTask.id)?.id)
                .map((col) => ({ id: col.id, title: col.title }))}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskModal
        users={columns.flatMap((col) =>
          col.tasks.flatMap((task) => task.assignees)
        )}
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={editingTask}
        onSave={(task) => {
          const actualTask: Task = {
            ...task,
            assignees: task.assignees.map(
              (a) => users.find((u) => u.id === a)!
            ),
          };
          if (columns.some((col) => col.id === actualTask.columnId)) {
            setColumns((prev) =>
              prev.map((col) =>
                col.id === actualTask.columnId
                  ? {
                      ...col,
                      tasks: col.tasks.some((t) => t.id === task.id)
                        ? col.tasks.map((t) =>
                            t.id === actualTask.id ? actualTask : t
                          )
                        : [...col.tasks, actualTask],
                    }
                  : col
              )
            );
          } else {
            setColumns((prev) => {
              return prev.map((col, index) => {
                if (index === 0) {
                  return {
                    ...col,
                    tasks: [...col.tasks, actualTask],
                  };
                }
                return col;
              });
            });
          }

          setIsTaskModalOpen(false);
          setEditingTask({ columnId: 0 });
        }}
      />

      <TasksColumnModal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        onSubmit={(column) => {
          console.log(column);
          setColumns((prev) => {
            const existingColumn = prev.find((col) => col.id === column.id);
            if (existingColumn) {
              return prev
                .map((col) =>
                  col.id === column.id ? { ...col, ...column } : col
                )
                .sort((a, b) => a.score - b.score);
            }
            return [...prev, { ...column, tasks: [] }].sort(
              (a, b) => a.score - b.score
            );
          });
          setEditingColumn({ score: 0 });
          setIsColumnModalOpen(false);
        }}
        column={editingColumn}
      />
    </div>
  );
};

export default IssuesBoardPage;
