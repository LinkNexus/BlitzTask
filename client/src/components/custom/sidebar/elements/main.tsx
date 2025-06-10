"use client"

import {type LucideIcon} from "lucide-react"

import {SidebarMenu, SidebarMenuButton, SidebarMenuItem,} from "@/components/ui/sidebar"
import Link from "next/link";

export function NavMain({items}: {
    items: Array<{
        title: string
        url: string
        icon: LucideIcon
        isActive?: boolean
        onClick?: (e: React.MouseEvent) => void
    }>
}) {
    return (
        <SidebarMenu>
            {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                    {item.onClick ? (
                        <SidebarMenuButton asChild isActive={item.isActive}>
                            <button type="button" onClick={item.onClick} className="w-full flex items-center gap-2">
                                <item.icon/>
                                <span>{item.title}</span>
                            </button>
                        </SidebarMenuButton>
                    ) : (
                        <SidebarMenuButton asChild isActive={item.isActive}>
                            <Link href={item.url}>
                                <item.icon/>
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    )}
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    )
}
