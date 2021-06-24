export const stopPropagation = (ev: JSX.TargetedMouseEvent<HTMLDivElement>, _consume?: any) => {
    ev.preventDefault();
    ev.stopPropagation();
    return true;
};
