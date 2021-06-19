import { VNode } from "preact";

export type Child = VNode | string | false | undefined;
export type Children = Child | Child[] | Children[];
