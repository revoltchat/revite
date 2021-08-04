export const stopPropagation = (
    ev: JSX.TargetedMouseEvent<HTMLElement>,
    _consume?: any,
) => {
    ev.preventDefault();
    ev.stopPropagation();
    return true;
};
