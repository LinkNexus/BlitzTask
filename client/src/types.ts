export interface User {
    id: number;
    email: string;
    name: string;
    roles: string[];
    isVerified: boolean;
}

export interface Task {
    id: string;
    title: string;
    priority: string;
    assignee: { name: string; avatar: string };
    dueDate: string;
    labels: string[];
    description: string;
}