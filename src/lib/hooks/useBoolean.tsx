"use client";

import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { IUseBooleanOutputProps } from "../types";

export const useBoolean = (
    defaultValue?: boolean
): IUseBooleanOutputProps<Dispatch<SetStateAction<boolean>>> => {
    const [value, setValue] = useState(!!defaultValue);

    const setTrue = useCallback(() => setValue(true), []);
    const setFalse = useCallback(() => setValue(false), []);
    const toggle = useCallback(() => setValue((x) => !x), []);

    return { value, setValue, setTrue, setFalse, toggle };
};
