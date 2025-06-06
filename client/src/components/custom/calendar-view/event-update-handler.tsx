"use client";

import {useCallback, useEffect} from "react";
import {toast} from "sonner";
import {IEvent} from "@/types/calendar-view-types";
import {useCalendar} from "@/components/custom/calendar-view/contexts/calendar-context";
import {useDragDrop} from "@/components/custom/calendar-view/contexts/drag-drop-context";

export function EventUpdateHandler() {
    const {setOnEventDropped} = useDragDrop();
    const {updateEvent} = useCalendar();

    const handleEventUpdate = useCallback((event: IEvent, newStartDate: Date, newEndDate: Date) => {
        try {
            const updatedEvent = {
                ...event,
                startDate: newStartDate.toISOString(),
                endDate: newEndDate.toISOString(),
            };

            updateEvent(updatedEvent);
            toast.success("Event updated successfully");
        } catch {
            toast.error("Failed to update event");
        }
    }, [updateEvent]);

    useEffect(() => {
        setOnEventDropped(handleEventUpdate);
    }, [setOnEventDropped, handleEventUpdate]);

    return null;
}
