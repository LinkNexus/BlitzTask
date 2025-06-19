"use client";
import { usePageInfos } from "@/components/custom/page-infos-provider";
import { Favorites } from "@/components/custom/sidebar/elements/favorites";
import { NavMain } from "@/components/custom/sidebar/elements/main";
import { NavProjects } from "@/components/custom/sidebar/elements/projects";
import { NavSecondary } from "@/components/custom/sidebar/elements/secondary";
import { TeamSwitcher } from "@/components/custom/sidebar/elements/team-switcher";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  AudioWaveform,
  Blocks,
  Calendar,
  Command,
  Home,
  Inbox,
  Kanban,
  MessageCircleQuestion,
  Search,
  Settings2,
  Sparkles,
  Trash2,
} from "lucide-react";
import * as React from "react";
import { NavUser } from "./elements/user";

// This is sample data.
type NavMainItem = {
  title: string;
  url: string;
  icon: any;
  isActive?: boolean;
  badge?: string;
  onClick?: (e: React.MouseEvent) => void;
};

type NavSecondaryItem = {
  title: string;
  url: string;
  icon: any;
  isActive?: boolean;
  badge?: string;
};

const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: Command,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
    {
      title: "Ask AI",
      url: "/ask-ai",
      icon: Sparkles,
    },
    {
      title: "Home",
      url: "/",
      icon: Home,
      isActive: true,
    },
    {
      title: "Issues Board",
      url: "/issues-board",
      icon: Kanban,
    },
    {
      title: "Inbox",
      url: "/inbox",
      icon: Inbox,
      badge: "10",
    },
  ] as NavMainItem[],
  navSecondary: [
    {
      title: "Calendar",
      url: "/calendar",
      icon: Calendar,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
    },
    {
      title: "Templates",
      url: "#",
      icon: Blocks,
    },
    {
      title: "Trash",
      url: "#",
      icon: Trash2,
    },
    {
      title: "Help",
      url: "#",
      icon: MessageCircleQuestion,
    },
  ] as NavSecondaryItem[],
  favorites: [
    {
      name: "Project Management & Task Tracking",
      url: "#",
      emoji: "📊",
    },
    {
      name: "Family Recipe Collection & Meal Planning",
      url: "#",
      emoji: "🍳",
    },
    {
      name: "Fitness Tracker & Workout Routines",
      url: "#",
      emoji: "💪",
    },
    {
      name: "Book Notes & Reading List",
      url: "#",
      emoji: "📚",
    },
    {
      name: "Sustainable Gardening Tips & Plant Care",
      url: "#",
      emoji: "🌱",
    },
    {
      name: "Language Learning Progress & Resources",
      url: "#",
      emoji: "🗣️",
    },
    {
      name: "Home Renovation Ideas & Budget Tracker",
      url: "#",
      emoji: "🏠",
    },
    {
      name: "Personal Finance & Investment Portfolio",
      url: "#",
      emoji: "💰",
    },
    {
      name: "Movie & TV Show Watchlist with Reviews",
      url: "#",
      emoji: "🎬",
    },
    {
      name: "Daily Habit Tracker & Goal Setting",
      url: "#",
      emoji: "✅",
    },
  ],
  projects: [
    {
      name: "Personal Life Management",
      emoji: "🏠",
      pages: [
        {
          name: "Daily Journal & Reflection",
          url: "#",
          emoji: "📔",
        },
        {
          name: "Health & Wellness Tracker",
          url: "#",
          emoji: "🍏",
        },
        {
          name: "Personal Growth & Learning Goals",
          url: "#",
          emoji: "🌟",
        },
      ],
    },
    {
      name: "Professional Development",
      emoji: "💼",
      pages: [
        {
          name: "Career Objectives & Milestones",
          url: "#",
          emoji: "🎯",
        },
        {
          name: "Skill Acquisition & Training Log",
          url: "#",
          emoji: "🧠",
        },
        {
          name: "Networking Contacts & Events",
          url: "#",
          emoji: "🤝",
        },
      ],
    },
    {
      name: "Creative Projects",
      emoji: "🎨",
      pages: [
        {
          name: "Writing Ideas & Story Outlines",
          url: "#",
          emoji: "✍️",
        },
        {
          name: "Art & Design Portfolio",
          url: "#",
          emoji: "🖼️",
        },
        {
          name: "Music Composition & Practice Log",
          url: "#",
          emoji: "🎵",
        },
      ],
    },
    {
      name: "Home Management",
      emoji: "🏡",
      pages: [
        {
          name: "Household Budget & Expense Tracking",
          url: "#",
          emoji: "💰",
        },
        {
          name: "Home Maintenance Schedule & Tasks",
          url: "#",
          emoji: "🔧",
        },
        {
          name: "Family Calendar & Event Planning",
          url: "#",
          emoji: "📅",
        },
      ],
    },
    {
      name: "Travel & Adventure",
      emoji: "🧳",
      pages: [
        {
          name: "Trip Planning & Itineraries",
          url: "#",
          emoji: "🗺️",
        },
        {
          name: "Travel Bucket List & Inspiration",
          url: "#",
          emoji: "🌎",
        },
        {
          name: "Travel Journal & Photo Gallery",
          url: "#",
          emoji: "📸",
        },
      ],
    },
  ],
};

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { infos } = usePageInfos();
  const [isSearchModalOpen, setSearchModalOpen] = React.useState(false);
  const navMainItems = data.navMain.map((item) => ({
    ...item,
    isActive: item.title === infos?.currentActiveNavItem,
    onClick:
      item.title === "Search"
        ? (e: React.MouseEvent) => {
            e.preventDefault();
            setSearchModalOpen(true);
          }
        : item.onClick,
  }));
  const navSecondaryItems = data.navSecondary.map((item) => ({
    ...item,
    isActive: item.title === infos?.currentActiveNavItem,
  }));

  return (
    <>
      <Sidebar className="border-r-0" {...props}>
        <SidebarHeader>
          <TeamSwitcher teams={data.teams} />
          <NavMain items={navMainItems} />
        </SidebarHeader>
        <SidebarContent>
          <Favorites favorites={data.favorites} />
          <NavProjects projects={data.projects} />
          <NavSecondary items={navSecondaryItems} className="mt-auto" />
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <Dialog open={isSearchModalOpen} onOpenChange={setSearchModalOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input
              id="link"
              placeholder="Type to search..."
              className="w-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
