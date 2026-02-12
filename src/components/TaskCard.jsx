import { Trash2 } from "lucide-react";

function TaskCard({ task, deleteTask }) {
  return (
    <div
      className="bg-white p-4 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-rose-500 cursor-grab relative task"
    >
      <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap">
        {task.content}
      </p>

      {/* Delete Button (Only visible on hover group) */}
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