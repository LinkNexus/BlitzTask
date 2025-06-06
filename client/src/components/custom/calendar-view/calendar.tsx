import {DragDropProvider} from "@/components/custom/calendar-view/contexts/drag-drop-context";
import {CALENDAR_ITEMS_MOCK, USERS_MOCK} from "@/components/custom/calendar-view/mocks";
import {CalendarProvider} from "@/components/custom/calendar-view/contexts/calendar-context";
import {EventUpdateHandler} from "@/components/custom/calendar-view/event-update-handler";
import {CalendarHeader} from "@/components/custom/calendar-view/header/calendar-header";
import {CalendarBody} from "@/components/custom/calendar-view/calendar-body";

export function Calendar() {
    return (
        <DragDropProvider>
            <CalendarProvider events={CALENDAR_ITEMS_MOCK} users={USERS_MOCK} view="month">
                <div className="w-full border rounded-xl">
                    <EventUpdateHandler/>
                    <CalendarHeader/>
                    <CalendarBody/>
                </div>
            </CalendarProvider>
        </DragDropProvider>
    );
}