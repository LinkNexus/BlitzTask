export interface User {
    id: number;
    email: string;
    name: string;
    roles: string[];
    isVerified: boolean;
    avatar: string;
}

export interface Task {
    id: number;
    title: string;
    priority: TaskPriority;
    assignees: TaskAssignee[];
    dueDate: string;
    labels: string[];
    description: string;
    columnId: number;
}

export interface TaskColumn {
    id: number;
    title: string;
    color: string;
    score: number;
    tasks: Task[];
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskAssignee = Pick<User, 'id' | 'name' | 'avatar'>;