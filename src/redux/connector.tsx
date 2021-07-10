/* eslint-disable @typescript-eslint/no-explicit-any */
import { connect, ConnectedComponent } from "react-redux";

import { h } from "preact";
import { memo } from "preact/compat";

import { State } from ".";

export function connectState<T>(
    component: (props: any) => h.JSX.Element | null,
    mapKeys: (state: State, props: T) => any,
    memoize?: boolean,
): ConnectedComponent<(props: any) => h.JSX.Element | null, T> {
    const c = connect(mapKeys)(component);
    return memoize ? memo(c) : c;
}
