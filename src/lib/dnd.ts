import {
    Draggable as rbdDraggable,
    DraggableProps as rbdDraggableProps,
    DraggableProvided as rbdDraggableProvided,
    DraggableProvidedDraggableProps as rbdDraggableProvidedDraggableProps,
    DraggableProvidedDragHandleProps as rbdDraggableProvidedDragHandleProps,
    DraggableRubric,
    DraggableStateSnapshot,
    Droppable as rbdDroppable,
    DroppableProps,
    DroppableProvided,
    DroppableStateSnapshot,
} from "react-beautiful-dnd";

export type DraggableProvidedDraggableProps = Omit<
    rbdDraggableProvidedDraggableProps,
    "style" | "onTransitionEnd"
> & {
    style?: string;
    onTransitionEnd?: JSX.TransitionEventHandler<HTMLElement>;
};

export type DraggableProvidedDragHandleProps = Omit<
    rbdDraggableProvidedDragHandleProps,
    "onDragStart"
> & {
    onDragStart?: JSX.DragEventHandler<HTMLElement>;
};

export type DraggableProvided = rbdDraggableProvided & {
    draggableProps: DraggableProvidedDraggableProps;
    dragHandleProps?: DraggableProvidedDragHandleProps | undefined;
};

export type DraggableChildrenFn = (
    provided: DraggableProvided,
    snapshot: DraggableStateSnapshot,
    rubric: DraggableRubric,
) => JSX.Element;

export type DraggableProps = Omit<rbdDraggableProps, "children"> & {
    children: DraggableChildrenFn;
};

export const Draggable = rbdDraggable as unknown as (
    props: DraggableProps,
) => JSX.Element;

export const Droppable = rbdDroppable as unknown as (
    props: Omit<DroppableProps, "children"> & {
        children(
            provided: DroppableProvided,
            snapshot: DroppableStateSnapshot,
        ): JSX.Element;
    },
) => JSX.Element;
