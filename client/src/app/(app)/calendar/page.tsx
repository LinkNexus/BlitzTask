"use client";

import {usePageInfos} from "@/components/custom/page-infos-provider";
import {useEffect} from "react";
import {Calendar} from "@/components/custom/calendar-view/calendar";

export default function CalendarPage() {
    const {setInfos} = usePageInfos();

    useEffect(() => {
        setInfos({
            title: "Calendar",
            currentActiveNavItem: "Calendar",
        })
    }, []);

    return (
        <Calendar/>
    );
}