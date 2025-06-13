export interface User {
    id: number;
    email: string;
    name: string;
    roles: string[];
    isVerified: boolean;
    avatar: string;
}

export interface Task {
    id: string;
    title: string;
    priority: string;
    assignees: Pick<User, 'name' | 'avatar'>[];
    dueDate: string;
    labels: string[];
    description: string;
}