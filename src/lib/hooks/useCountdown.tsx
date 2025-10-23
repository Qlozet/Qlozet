"use client";

import { useCallback } from "react";
import {
    CountdownHelpers,
    CountdownOption,
} from "../types";
import { useCounter } from "./useCounter";
import { useBoolean } from "./useBoolean";
import useInterval from "./useInterval";

/**
 *
 * @param  {CountdownOption} countdownOption
 * @param  {number} countdownOption.countStart - the countdown's starting number, initial value of the returned number.
 * @param  {?number} countdownOption.countStop -  `0` by default, the countdown's stopping number. Pass `-Infinity` to decrease forever.
 * @param  {?number} countdownOption.intervalMs - `1000` by default, the countdown's interval, in milliseconds.
 * @param  {?boolean} countdownOption.isIncrement - `false` by default, true if the countdown is increment.
 * @returns [counter, CountdownControllers]
 */

export const useCountdown = (
    countdownOption: CountdownOption
): [number, CountdownHelpers] => {
    /**
     * Use to determine the the API call is a deprecated version.
     */
    let isDeprecated = false;

    let countStart,
        intervalMs,
        isIncrement: boolean | undefined,
        countStop: number | undefined;

    if (countdownOption) {
        countStart = countdownOption.countStart;
        intervalMs = countdownOption.intervalMs;
        countStop = countdownOption.countStop;
        isIncrement = countdownOption.isIncrement;
    }

    // default values
    intervalMs = intervalMs ?? 1000;
    isIncrement = isIncrement ?? false;
    countStop = countStop ?? 0;

    const {
        count,
        increment,
        decrement,
        reset: resetCounter,
    } = useCounter(countStart);

    /**
     * Note: used to control the useInterval
     * running: If true, the interval is running
     * start: Should set running true to trigger interval
     * stop: Should set running false to remove interval
     */
    const {
        value: isCountdownRunning,
        setTrue: startCountdown,
        setFalse: stopCountdown,
    } = useBoolean(false);

    /**
     * Will set running false and reset the seconds to initial value
     */
    const resetCountdown = () => {
        stopCountdown();
        resetCounter();
    };

    const countdownCallback = useCallback(() => {
        if (count === countStop) {
            stopCountdown();
            return;
        }

        if (isIncrement) {
            increment();
        } else {
            decrement();
        }
    }, [count, countStop, decrement, increment, isIncrement, stopCountdown]);

    useInterval({
        callback: countdownCallback,
        delay: isCountdownRunning ? intervalMs : null,
    });

    return [
        count,
        {
            start: startCountdown,
            stop: stopCountdown,
            reset: resetCountdown,
        } as CountdownHelpers,
    ];
};
