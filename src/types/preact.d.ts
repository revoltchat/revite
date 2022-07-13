/* eslint-disable */
import JSX = preact.JSX;

declare type Child =
    | JSX.Element
    | preact.VNode
    | string
    | number
    | boolean
    | undefined
    | null;

declare type Children = Child | Child[] | Children[];
