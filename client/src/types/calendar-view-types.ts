export interface IEvent {
    id: number;
    startDate: string;
    endDate: string;
    title: string;
    color: TEventColor;
    description: string;
    user: IUser;
}

export interface IUser {
    id: string;
    name: string;
    picturePath: string | null;
}

export interface ICalendarCell {
    day: number;
    currentMonth: boolean;
    date: Date;
}

export type TCalendarView = "day" | "week" | "month" | "year" | "agenda";
export type TEventColor = "blue" | "green" | "red" | "yellow" | "purple" | "orange";