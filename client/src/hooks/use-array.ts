import { useState } from "react";

export const useArrayState = <T> (initialValue: T[]) => {

    const [state, setState] = useState(initialValue);

    const addItem = (item: T) => setState((prev) => [...prev, item]);
    const addUnique = (item: T) => {
        if (!state.includes(item)) {
            addItem(item);
        }
    }
    const remove = (index: number) => setState((prev) => prev.filter((_, i) => i !== index));
    const removeItem = (item: T) => setState((prev) => prev.filter((i) => i !== item));

    return {
        state,
        setState,
        addItem,
        addUnique,
        remove,
        removeItem
    }

}