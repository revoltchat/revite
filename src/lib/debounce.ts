import isEqual from "lodash.isequal";

import { Inputs, useCallback, useEffect, useRef } from "preact/hooks";

export function debounce(cb: (...args: unknown[]) => void, duration: number) {
    // Store the timer variable.
    let timer: NodeJS.Timeout;
    // This function is given to React.
    return (...args: unknown[]) => {
        // Get rid of the old timer.
        clearTimeout(timer);
        // Set a new timer.
        timer = setTimeout(() => {
            // Instead calling the new function.
            // (with the newer data)
            cb(...args);
        }, duration);
    };
}

export function useDebounceCallback(
    cb: (...args: unknown[]) => void,
    inputs: Inputs,
    duration = 1000,
) {
    // eslint-disable-next-line
    return useCallback(
        debounce(cb as (...args: unknown[]) => void, duration),
        inputs,
    );
}

export function useAutosaveCallback(
    cb: (...args: unknown[]) => void,
    inputs: Inputs,
    duration = 1000,
) {
    const ref = useRef(cb);

    // eslint-disable-next-line
    const callback = useCallback(
        debounce(() => ref.current(), duration),
        [],
    );

    useEffect(() => {
        ref.current = cb;
        callback();
        // eslint-disable-next-line
    }, [cb, callback, ...inputs]);
}

export function useAutosave<T>(
    cb: () => void,
    dependency: T,
    initialValue: T,
    onBeginChange?: () => void,
    duration?: number,
) {
    if (onBeginChange) {
        // eslint-disable-next-line
        useEffect(
            () => {
                !isEqual(dependency, initialValue) && onBeginChange();
            },
            // eslint-disable-next-line
            [dependency],
        );
    }

    return useAutosaveCallback(
        () => !isEqual(dependency, initialValue) && cb(),
        [dependency],
        duration,
    );
}
