import { useDroppable } from '@dnd-kit/react';
import type { CSSProperties, ReactNode } from 'react';

export function Droppable({ id, children, style }: { id: string, children: ReactNode, style?: CSSProperties }) {
  const { ref, isDropTarget } = useDroppable({ id });

  return (
    <div style={style} ref={ref}

      className={`droppable ${isDropTarget ? "drag-over" : ""}`}
    >
      {children}
    </div>
  );
}
