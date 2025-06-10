'use client';

import {useAuth} from "@/lib/auth";
import {Button} from "@/components/ui/button";
import {useEffect} from "react";
import {CheckCircle, Clock, Plus, TrendingUp, Users} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Progress} from "@/components/ui/progress";
import {Badge} from "@/components/ui/badge";
import {usePageInfos} from "@/components/custom/page-infos-provider";

const stats = [
    {title: 'Total Tasks', value: 156, change: '+12%', icon: CheckCircle, color: 'text-green-600'},
    {title: 'In Progress', value: 23, change: '+5%', icon: Clock, color: 'text-blue-600'},
    {title: 'Team Members', value: 8, change: '+2', icon: Users, color: 'text-purple-600'},
    {title: 'Completed Today', value: 12, change: '+8%', icon: TrendingUp, color: 'text-emerald-600'},
];

const projects = [
    {name: 'Website Redesign', progress: 75, tasks: 24, completed: 18},
    {name: 'Mobile App', progress: 45, tasks: 32, completed: 14},
    {name: 'Marketing Campaign', progress: 90, tasks: 16, completed: 14},
];

const tasksForToday = [
    {
        id: 1,
        title: 'Design user authentication flow',
        status: 'In Progress',
        priority: 'High',
        assignee: 'Sarah Wilson',
        dueDate: '2024-01-15'
    },
    {
        id: 2,
        title: 'Implement API endpoints',
        status: 'Review',
        priority: 'Medium',
        assignee: 'Mike Johnson',
        dueDate: '2024-01-16'
    },
    {
        id: 3,
        title: 'Update documentation',
        status: 'Done',
        priority: 'Low',
        assignee: 'Emma Davis',
        dueDate: '2024-01-14'
    },
    {
        id: 4,
        title: 'Setup CI/CD pipeline',
        status: 'Todo',
        priority: 'High',
        assignee: 'Alex Chen',
        dueDate: '2024-01-18'
    },
];

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'High':
            return 'bg-red-100 text-red-800';
        case 'Medium':
            return 'bg-yellow-100 text-yellow-800';
        case 'Low':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Done':
            return 'bg-green-100 text-green-800';
        case 'In Progress':
            return 'bg-blue-100 text-blue-800';
        case 'Review':
            return 'bg-purple-100 text-purple-800';
        case 'Todo':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export default function HomePage() {
    const {user, logout} = useAuth();
    const {setInfos} = usePageInfos();

    useEffect(() => {
        setInfos({
            title: "Dashboard",
            currentActiveNavItem: "Home"
        });
    }, []);

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="w-full flex justify-end">
                <Button>
                    <Plus/>
                    New Task
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Schedules and Deadlines of Today</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {tasksForToday.map((task) => (
                            <Card key={task.id}
                                  className="flex flex-row items-center rounded-none justify-between p-3 hover:bg-gray-50">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1">Assigned to {task.assignee}</p>
                                </div>
                                <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 min-[520px]:grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                    <p className={`text-sm ${stat.color} mt-1`}>{stat.change} from last week</p>
                                </div>
                                <div className={`p-3 rounded-full bg-gray-50`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`}/>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Project Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {projects.map((project, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium text-gray-900">{project.name}</h4>
                                <span
                                    className="text-sm text-gray-500">{project.completed}/{project.tasks} tasks</span>
                            </div>
                            <Progress value={project.progress} className="h-2"/>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button variant="outline" className="h-24 flex flex-col space-y-2">
                            <Plus className="w-6 h-6"/>
                            <span>Create Task</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col space-y-2">
                            <Users className="w-6 h-6"/>
                            <span>Invite Member</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col space-y-2">
                            <Clock className="w-6 h-6"/>
                            <span>Schedule Meeting</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col space-y-2">
                            <TrendingUp className="w-6 h-6"/>
                            <span>View Reports</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
