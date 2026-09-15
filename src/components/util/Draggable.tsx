import { useDraggable } from '@dnd-kit/react';
import type { ReactNode } from 'react';

export function Draggable({ id, children, contained }: { id: string, children: ReactNode, contained?: boolean }) {
  const { ref } = useDraggable({
    id
  });

  return (
    <button className={`draggable ${contained ? "inside" : ""}`} ref={ref}>
      {children}
    </button>
  );
}
