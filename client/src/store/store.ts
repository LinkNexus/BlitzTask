import type { User } from '@/types';
import { createStore } from 'zustand';
import { combine, persist } from 'zustand/middleware';

interface AppState {
    user: User | undefined | null;
    lastRequestedUrl: string | null;
    darkMode: boolean;
    sidebarCollapsed: boolean;
    mode: 'teams' | 'personal';
    sidebarState: 'open' | 'collapsed';
}

interface AppActions {
    setUser: (user: User | null) => void;
    setLastRequestedUrl: (url: string) => void;
    toggleDarkMode: () => void;
    toggleSidebarState: () => void;
    setMode : (mode: 'teams' | 'personal') => void;
    switchSidebarState: () => void;
}

export type AppStore = AppState & AppActions;

const defaultInitState: AppState = {
    user: undefined as User | undefined | null,
    lastRequestedUrl: null,
    darkMode: false,
    sidebarCollapsed: false,
    mode: 'personal',
    sidebarState: 'open'
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
                    toggleSidebarState: () => set(state => ({sidebarCollapsed: !state.sidebarCollapsed})),
                    setMode: (mode: 'teams' | 'personal') => set(state => ({mode})),
                    switchSidebarState: () => set(state => ({
                        sidebarState: state.sidebarState === 'open' ? 'collapsed' : 'open'
                    }))
                } satisfies AppActions)
            ),
            {name: "blitz-task-app"}
        )
    );
}