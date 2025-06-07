"use client"

import type * as React from "react"
import {
    Bell,
    Calendar,
    ChevronUp,
    HelpCircle,
    Home,
    Kanban,
    MessageSquare,
    Plus,
    Settings,
    Sparkles,
    User2,
    Users,
} from "lucide-react"

import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import {Badge} from "@/components/ui/badge"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    currentPage: string
    onPageChange: (page: string) => void
}

// This is sample data for the sidebar
const data = {
    user: {
        name: "John Doe",
        email: "john@taskflow.com",
        avatar: "/placeholder.svg?height=32&width=32",
    },
    navMain: [
        {
            title: "Overview",
            items: [
                {
                    title: "Dashboard",
                    url: "dashboard",
                    icon: Home,
                    isActive: false,
                },
            ],
        },
        {
            title: "Work",
            items: [
                {
                    title: "Board",
                    url: "board",
                    icon: Kanban,
                    isActive: false,
                    badge: "12",
                },
                {
                    title: "Messages",
                    url: "messages",
                    icon: MessageSquare,
                    isActive: false,
                    badge: "3",
                },
                {
                    title: "Calendar",
                    url: "calendar",
                    icon: Calendar,
                    isActive: false,
                },
            ],
        },
        {
            title: "Team",
            items: [
                {
                    title: "Members",
                    url: "team",
                    icon: Users,
                    isActive: false,
                },
                {
                    title: "AI Assistant",
                    url: "ai-assistant",
                    icon: Sparkles,
                    isActive: false,
                    badge: "New",
                },
            ],
        },
    ],
    projects: [
        {
            name: "Website Redesign",
            url: "#",
            icon: "🎨",
        },
        {
            name: "Mobile App",
            url: "#",
            icon: "📱",
        },
        {
            name: "API Integration",
            url: "#",
            icon: "🔗",
        },
    ],
}

export function AppSidebar({currentPage, onPageChange, ...props}: AppSidebarProps) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#" className="flex items-center">
                                <div
                                    className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Kanban className="size-4"/>
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">TaskFlow</span>
                                    <span className="truncate text-xs">Project Management</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Quick Actions */}
                <SidebarGroup>
                    <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton className="w-full">
                                    <Plus className="size-4"/>
                                    <span>New Task</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Navigation */}
                {data.navMain.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={currentPage === item.url}
                                            onClick={() => onPageChange(item.url)}
                                        >
                                            <a href="#" className="flex items-center justify-between w-full">
                                                <div className="flex items-center">
                                                    <item.icon className="size-4"/>
                                                    <span>{item.title}</span>
                                                </div>
                                                {item.badge && (
                                                    <Badge variant={item.badge === "New" ? "default" : "secondary"}
                                                           className="ml-auto">
                                                        {item.badge}
                                                    </Badge>
                                                )}
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}

                {/* Projects */}
                <SidebarGroup>
                    <SidebarGroupLabel>Projects</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {data.projects.map((project) => (
                                <SidebarMenuItem key={project.name}>
                                    <SidebarMenuButton asChild>
                                        <a href={project.url}>
                                            <span className="text-lg">{project.icon}</span>
                                            <span>{project.name}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            <SidebarMenuItem>
                                <SidebarMenuButton className="text-sidebar-foreground/70">
                                    <Plus className="size-4"/>
                                    <span>Add Project</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Settings */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <a href="#">
                                        <Settings className="size-4"/>
                                        <span>Settings</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <a href="#">
                                        <HelpCircle className="size-4"/>
                                        <span>Help & Support</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={data.user.avatar || "/placeholder.svg"} alt={data.user.name}/>
                                        <AvatarFallback className="rounded-lg">JD</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{data.user.name}</span>
                                        <span className="truncate text-xs">{data.user.email}</span>
                                    </div>
                                    <ChevronUp className="ml-auto size-4"/>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src={data.user.avatar || "/placeholder.svg"}
                                                         alt={data.user.name}/>
                                            <AvatarFallback className="rounded-lg">JD</AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{data.user.name}</span>
                                            <span className="truncate text-xs">{data.user.email}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem>
                                    <User2 className="size-4 mr-2"/>
                                    Account
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Bell className="size-4 mr-2"/>
                                    Notifications
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="size-4 mr-2"/>
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem>Log out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    )
}
