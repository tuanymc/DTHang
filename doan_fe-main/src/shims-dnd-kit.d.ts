declare module "@dnd-kit/core" {
    import type { FC, ReactNode } from "react";

    export type DragEndEvent = {
        active: { id: string | number };
        over?: { id: string | number } | null;
    };

    export const DndContext: FC<{
        children?: ReactNode;
        collisionDetection?: unknown;
        onDragEnd?: (e: DragEndEvent) => void;
    }>;

    export const closestCenter: unknown;
}

declare module "@dnd-kit/sortable" {
    import type { FC, ReactNode } from "react";

    export function useSortable(options: { id: string }): {
        attributes: Record<string, unknown>;
        listeners: Record<string, unknown>;
        setNodeRef: (node: HTMLElement | null) => void;
        transform: unknown;
        transition: string | undefined;
        isDragging: boolean;
    };

    export const SortableContext: FC<{
        children?: ReactNode;
        items: string[];
        strategy: unknown;
    }>;

    export function arrayMove<T>(array: T[], from: number, to: number): T[];

    export const verticalListSortingStrategy: unknown;
}

declare module "@dnd-kit/utilities" {
    export const CSS: {
        Transform: {
            toString: (transform: unknown) => string | undefined;
        };
    };
}
