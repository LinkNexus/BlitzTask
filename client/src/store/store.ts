import { createStore } from 'zustand';
import { combine, createJSONStorage, persist } from 'zustand/middleware';
import type { User } from '../types';

interface AppState {
    user: User | undefined | null;
}

interface AppActions {
    setUser: (user: User | null) => void;
}

export type AppStore = AppState & AppActions;

const defaultInitState: AppState = {
    user: undefined as User | undefined | null,
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
                        set(state => ({ ...state, user }));
                    }
                })
            ),
            {
                name: 'blitz-task',
                storage: createJSONStorage(() => localStorage),
            }
        )
    );
}