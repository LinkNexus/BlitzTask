import React, {ReactNode} from 'react';
import {motion} from 'framer-motion';
import {useDragDrop} from "@/components/custom/calendar-view/contexts/drag-drop-context";
import {IEvent} from "@/types/calendar-view-types";
import {EventDetailsDialog} from "@/components/custom/calendar-view/dialogs/event-details-dialog";

interface DraggableEventProps {
    event: IEvent;
    children: ReactNode;
    className?: string;
}

export function DraggableEvent({event, children, className}: DraggableEventProps) {
    const {startDrag, endDrag, isDragging, draggedEvent} = useDragDrop();

    const isCurrentlyDragged = isDragging && draggedEvent?.id === event.id;

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };

    return (
        <EventDetailsDialog event={event}>
            <motion.div
                className={`${className || ''} ${isCurrentlyDragged ? 'opacity-50 cursor-grabbing' : 'cursor-grab'}`}
                draggable
                onClick={(e: React.MouseEvent<HTMLDivElement>) => handleClick(e)}
                onDragStart={(e) => {
                    (e as DragEvent).dataTransfer!.setData('text/plain', event.id.toString());
                    startDrag(event);
                }}
                onDragEnd={() => {
                    endDrag();
                }}
            >
                {children}
            </motion.div>
        </EventDetailsDialog>
    );
}