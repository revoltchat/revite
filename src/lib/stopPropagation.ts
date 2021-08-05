export const stopPropagation = (
    ev: JSX.TargetedMouseEvent<HTMLElement>,
    // eslint-disable-next-line
    _consume?: unknown,
) => {
    ev.preventDefault();
    ev.stopPropagation();
    return true;
};
