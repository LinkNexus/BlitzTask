"use client";

import React from "react";
import {motion} from "framer-motion";
import {AgendaEvents} from "@/components/custom/calendar-view/views/agenda-events";
import {isSameDay, parseISO} from "date-fns";
import {useCalendar} from "@/components/custom/calendar-view/contexts/calendar-context";
import {useFilteredEvents} from "@/lib/calendar-view/hooks";
import {fadeIn, transition} from "@/components/custom/calendar-view/animations";
import {CalendarDayView} from "@/components/custom/calendar-view/views/week-day-view/calendar-day-view";
import {CalendarWeekView} from "@/components/custom/calendar-view/views/week-day-view/calendar-week-view";
import {CalendarMonthView} from "@/components/custom/calendar-view/views/month-view/calendar-month-view";
import {CalendarYearView} from "@/components/custom/calendar-view/views/year-view/calendar-year-view";

export function CalendarBody() {
    const {view} = useCalendar();

    const singleDayEvents = useFilteredEvents().filter((event) => {
        const startDate = parseISO(event.startDate);
        const endDate = parseISO(event.endDate);
        return isSameDay(startDate, endDate);
    });

    const multiDayEvents = useFilteredEvents().filter((event) => {
        const startDate = parseISO(event.startDate);
        const endDate = parseISO(event.endDate);
        return !isSameDay(startDate, endDate);
    });

    return (
        <div className='h-[80vh] w-full overflow-scroll relative]'>
            <motion.div
                key={view}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={fadeIn}
                transition={transition}
            >
                {view === "month" && (
                    <CalendarMonthView
                        singleDayEvents={singleDayEvents}
                        multiDayEvents={multiDayEvents}
                    />
                )}
                {view === "week" && (
                    <CalendarWeekView
                        singleDayEvents={singleDayEvents}
                        multiDayEvents={multiDayEvents}
                    />
                )}
                {view === "day" && (
                    <CalendarDayView
                        singleDayEvents={singleDayEvents}
                        multiDayEvents={multiDayEvents}
                    />
                )}
                {view === "year" && (
                    <CalendarYearView
                        singleDayEvents={singleDayEvents}
                        multiDayEvents={multiDayEvents}
                    />
                )}
                {
                    view === "agenda" && (
                        <motion.div
                            key="agenda"
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            variants={fadeIn}
                            transition={transition}
                        >
                            <AgendaEvents/>
                        </motion.div>
                    )
                }
            </motion.div>
        </div>
    );
}