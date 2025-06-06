import React from "react";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {Calendar, MoreHorizontal} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Task} from "@/types";

interface SortableTaskProps {
    task: Task;
    onEdit: (task: Task) => void;
}

export const SortableTask: React.FC<SortableTaskProps> = ({task, onEdit}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({id: task.id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'Low':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        }
    };

    const getLabelColor = (label: string) => {
        const colors = [
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
            'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
        ];
        return colors[label.length % colors.length];
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
        >
            <CardContent className="p-4">
                <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm leading-tight">{task.title}</h4>

                    <div className="flex flex-wrap gap-1">
                        {task.labels.map((label, index) => (
                            <Badge key={index} className={`text-xs ${getLabelColor(label)}`}>
                                {label}
                            </Badge>
                        ))}
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                            </Badge>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="p-1">
                                    <MoreHorizontal className="w-4 h-4"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => onEdit(task)}>
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>Move</DropdownMenuItem>
                                <DropdownMenuItem>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div
                        className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                            <Avatar className="w-6 h-6">
                                <AvatarImage src="/placeholder.svg"/>
                                <AvatarFallback className="text-xs">{task.assignee.avatar}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-600 dark:text-gray-400">{task.assignee.name}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3 h-3"/>
                            <span>{task.dueDate}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};