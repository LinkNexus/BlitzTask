import {createStore} from 'zustand';
import {combine, persist} from 'zustand/middleware';
import type {User} from '@/types';

interface AppState {
    user: User | undefined | null;
    lastRequestedUrl: string | null;
    darkMode: boolean;
    sidebarCollapsed: boolean;
}

interface AppActions {
    setUser: (user: User | null) => void;
    setLastRequestedUrl: (url: string) => void;
    toggleDarkMode: () => void;
    toggleSidebarState: () => void;
}

export type AppStore = AppState & AppActions;

const defaultInitState: AppState = {
    user: undefined as User | undefined | null,
    lastRequestedUrl: null,
    darkMode: false,
    sidebarCollapsed: false
}

export const createAppStore = (
    initialState: AppState = defaultInitState
) => {
    return createStore(
        persist(
            combine(
                initialState,
                (set) => ({
                    setUser: (user: User | null) => {
                        set(state => ({...state, user}));
                    },
                    setLastRequestedUrl: (url: string) => set(state => ({lastRequestedUrl: url})),
                    toggleDarkMode: () => set(state => ({darkMode: !state.darkMode})),
                    toggleSidebarState: () => set(state => ({sidebarCollapsed: !state.sidebarCollapsed}))
                } satisfies AppActions)
            ),
            {name: "blitz-task-app"}
        )
    );
}