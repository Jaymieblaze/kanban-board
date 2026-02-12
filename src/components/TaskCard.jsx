import { Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function TaskCard({ task, deleteTask }) {
  // The Hook: Connects the card to the DnD system
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  // The Styles: Calculate the movement
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  // Visual feedback when dragging (make the original ghost-like)
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-gray-100 p-4 h-[100px] min-h-[100px] items-center flex text-left rounded-xl border-2 border-rose-500 cursor-grab relative"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-rose-500 cursor-grab relative task"
    >
      <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap">
        {task.content}
      </p>

      <button
        onClick={() => deleteTask(task.id)}
        className="stroke-gray-500 absolute right-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded opacity-60 hover:opacity-100"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

export default TaskCard;