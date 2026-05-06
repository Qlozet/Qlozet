"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { UseCounterOutput } from "../types";

export const useCounter = (
    initialValue?: number
): UseCounterOutput<Dispatch<SetStateAction<number>>> => {
    const [count, setCount] = useState(initialValue || 0);

    const increment = () => setCount((x) => x + 1);
    const decrement = () => setCount((x) => x - 1);
    const reset = () => setCount(initialValue || 0);

    return {
        count,
        increment,
        decrement,
        reset,
        setCount,
    };
};
