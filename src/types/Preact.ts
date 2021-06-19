import { VNode } from "preact";

export type Child = VNode | string | number | boolean | undefined | null;
export type Children = Child | Child[] | Children[];
