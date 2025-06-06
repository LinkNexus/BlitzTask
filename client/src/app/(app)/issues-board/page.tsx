"use client";

import React, {useEffect, useState} from 'react';
import {Plus} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
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
} from '@dnd-kit/core';
import {arrayMove, SortableContext, verticalListSortingStrategy,} from '@dnd-kit/sortable';
import {Task} from "@/types";
import {SortableTask} from "@/components/custom/tasks/sortable-task";
import {TaskEditModal} from "@/components/custom/tasks/task-edit-modal";
import {usePageInfos} from "@/components/custom/page-infos-provider";
// import {TaskEditModal} from './TaskEditModal';
// import {NewTaskModal} from './NewTaskModal';

interface IssueBoardProps {
    selectedProject?: string | null;
}

const IssuesBoardPage: React.FC<IssueBoardProps> = ({selectedProject}) => {
    const [selectedBoard, setSelectedBoard] = useState('website-redesign');
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const {setInfos} = usePageInfos();

    const boards = [
        {id: 'website-redesign', name: 'Website Redesign', color: 'bg-blue-500'},
        {id: 'mobile-app', name: 'Mobile App', color: 'bg-purple-500'},
        {id: 'marketing', name: 'Marketing Campaign', color: 'bg-green-500'},
    ];

    useEffect(() => {
        if (selectedProject) {
            setSelectedBoard(selectedProject === '1' ? 'website-redesign' : selectedProject === '2' ? 'mobile-app' : 'marketing');
        }
    }, [selectedProject]);

    useEffect(() => {
        setInfos({
            title: "Issues Board",
            currentActiveNavItem: "Issues Board"
        });
    }, []);

    const columns = [
        {id: 'backlog', title: 'Backlog', color: 'border-gray-300'},
        {id: 'todo', title: 'To Do', color: 'border-blue-300'},
        {id: 'in-progress', title: 'In Progress', color: 'border-yellow-300'},
        {id: 'review', title: 'Review', color: 'border-purple-300'},
        {id: 'done', title: 'Done', color: 'border-green-300'},
    ];

    const [tasks, setTasks] = useState({
        'backlog': [
            {
                id: '1',
                title: 'Research competitor analysis',
                priority: 'Medium',
                assignee: {name: 'Sarah Wilson', avatar: 'SW'},
                dueDate: '2024-01-20',
                labels: ['Research'],
                description: 'Analyze competitor features and pricing'
            },
            {
                id: '2',
                title: 'Define user personas',
                priority: 'High',
                assignee: {name: 'Mike Johnson', avatar: 'MJ'},
                dueDate: '2024-01-18',
                labels: ['UX'],
                description: 'Create detailed user personas based on research'
            },
        ],
        'todo': [
            {
                id: '3',
                title: 'Design homepage wireframes',
                priority: 'High',
                assignee: {name: 'Emma Davis', avatar: 'ED'},
                dueDate: '2024-01-16',
                labels: ['Design'],
                description: 'Create wireframes for the new homepage layout'
            },
            {
                id: '4',
                title: 'Setup development environment',
                priority: 'Medium',
                assignee: {name: 'Alex Chen', avatar: 'AC'},
                dueDate: '2024-01-17',
                labels: ['Development'],
                description: 'Configure development tools and environment'
            },
        ],
        'in-progress': [
            {
                id: '5',
                title: 'Implement user authentication',
                priority: 'High',
                assignee: {name: 'Sarah Wilson', avatar: 'SW'},
                dueDate: '2024-01-15',
                labels: ['Development', 'Backend'],
                description: 'Build secure user authentication system'
            },
            {
                id: '6',
                title: 'Create component library',
                priority: 'Medium',
                assignee: {name: 'Mike Johnson', avatar: 'MJ'},
                dueDate: '2024-01-19',
                labels: ['Development', 'Frontend'],
                description: 'Build reusable UI components'
            },
        ],
        'review': [
            {
                id: '7',
                title: 'API documentation',
                priority: 'Low',
                assignee: {name: 'Emma Davis', avatar: 'ED'},
                dueDate: '2024-01-14',
                labels: ['Documentation'],
                description: 'Document all API endpoints and usage'
            },
        ],
        'done': [
            {
                id: '8',
                title: 'Project setup and planning',
                priority: 'High',
                assignee: {name: 'Alex Chen', avatar: 'AC'},
                dueDate: '2024-01-10',
                labels: ['Planning'],
                description: 'Initial project setup and milestone planning'
            },
            {
                id: '9',
                title: 'Team onboarding',
                priority: 'Medium',
                assignee: {name: 'Sarah Wilson', avatar: 'SW'},
                dueDate: '2024-01-12',
                labels: ['Management'],
                description: 'Onboard team members and assign roles'
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
        const {active, over} = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeColumn = findColumn(activeId);
        const overColumn = findColumn(overId) || overId;

        if (!activeColumn || activeColumn === overColumn) return;

        setTasks(prev => {
            const activeItems = prev[activeColumn as keyof typeof prev];
            const overItems = prev[overColumn as keyof typeof prev];

            const activeIndex = activeItems.findIndex(item => item.id === activeId);
            const activeItem = activeItems[activeIndex];

            return {
                ...prev,
                [activeColumn]: activeItems.filter(item => item.id !== activeId),
                [overColumn]: [...overItems, activeItem],
            };
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const {active, over} = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeColumn = findColumn(activeId);
        const overColumn = findColumn(overId) || overId;

        if (!activeColumn) return;

        if (activeColumn === overColumn) {
            setTasks(prev => {
                const items = prev[activeColumn as keyof typeof prev];
                const activeIndex = items.findIndex(item => item.id === activeId);
                const overIndex = items.findIndex(item => item.id === overId);

                return {
                    ...prev,
                    [activeColumn]: arrayMove(items, activeIndex, overIndex),
                };
            });
        }
    };

    const findColumn = (id: string) => {
        for (const [columnId, items] of Object.entries(tasks)) {
            if (items.find(item => item.id === id)) {
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
        setTasks(prev => {
            const newTasks = {...prev};

            for (const columnKey in newTasks) {
                const column = columnKey as keyof typeof tasks;
                const taskIndex = newTasks[column].findIndex(t => t.id === updatedTask.id);
                if (taskIndex !== -1) {
                    newTasks[column][taskIndex] = updatedTask;
                    break;
                }
            }

            return newTasks;
        });
        setIsEditModalOpen(false);
        setEditingTask(null);
    };

    const handleNewTask = (newTask: any) => {
        const taskWithDescription = {
            ...newTask,
            description: newTask.description || ''
        };
        setTasks(prev => ({
            ...prev,
            'backlog': [...prev.backlog, taskWithDescription]
        }));
    };

    const activeTask = activeId ? Object.values(tasks).flat().find(task => task.id === activeId) : null;

    return (
        <div className="space-y-6 overflow-auto">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4 mt-2">
                    {boards.map((board) => (
                        <Button
                            key={board.id}
                            variant={selectedBoard === board.id ? "default" : "outline"}
                            className={selectedBoard === board.id ? 'bg-primary' : ''}
                            onClick={() => setSelectedBoard(board.id)}
                        >
                            <div className={`w-3 h-3 rounded-full ${board.color} mr-2`}></div>
                            {board.name}
                        </Button>
                    ))}
                </div>
                <Button
                    variant="outline"
                    onClick={() => setIsNewTaskModalOpen(true)}
                >
                    <Plus className="w-4 h-4 mr-2"/>
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
                    {columns.map((column) => (
                        <div key={column.id} className="flex-shrink-0 w-80">
                            <Card className={`border-t-4 ${column.color}`}>
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-center">
                                        <CardTitle
                                            className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                            {column.title}
                                        </CardTitle>
                                        <Badge variant="secondary" className="text-xs">
                                            {tasks[column.id as keyof typeof tasks]?.length || 0}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <SortableContext
                                        items={tasks[column.id as keyof typeof tasks].map(task => task.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-3 min-h-[100px]">
                                            {tasks[column.id as keyof typeof tasks]?.map((task) => (
                                                <SortableTask
                                                    key={task.id}
                                                    task={task}
                                                    onEdit={handleEditTask}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>

                                    <Button
                                        variant="ghost"
                                        className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        onClick={() => setIsNewTaskModalOpen(true)}
                                    >
                                        <Plus className="w-4 h-4 mr-2"/>
                                        Add task
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <SortableTask task={activeTask} onEdit={() => {
                        }}/>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <TaskEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                task={editingTask}
                onSave={handleSaveTask}
            />

            {/*<NewTaskModal*/}
            {/*    isOpen={isNewTaskModalOpen}*/}
            {/*    onClose={() => setIsNewTaskModalOpen(false)}*/}
            {/*    onSave={handleNewTask}*/}
            {/*/>*/}
        </div>
    );
};

export default IssuesBoardPage;
