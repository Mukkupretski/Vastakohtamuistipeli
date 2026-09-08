import { useDraggable, useDroppable } from '@dnd-kit/react';
import { DragDropProvider } from '@dnd-kit/react';
import { useState, type ReactNode } from 'react';
function Draggable() {
  const { ref } = useDraggable({
    id: 'draggable',
  });

  return (
    <button ref={ref}>
      Draggable
    </button>
  );
} function Droppable({ id, children }: { id: string, children: ReactNode }) {
  const { ref } = useDroppable({
    id,
  });

  return (
    <div ref={ref} style={{ width: 300, height: 300, border: "1px solid black" }}>
      {children}
    </div>
  );
}
export default function Yhdyssanapiiri() {
  const [isDropped, setIsDropped] = useState(false);

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;

        const { target } = event.operation;
        setIsDropped(target?.id === 'droppable');
      }}
    >
      {!isDropped && <Draggable />}

      <Droppable id="droppable">
        {isDropped && <Draggable />}
      </Droppable>
    </DragDropProvider>
  );
}
