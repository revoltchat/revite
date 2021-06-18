import { VNode } from 'preact';

export type Children = VNode | (VNode | string)[] | string;
