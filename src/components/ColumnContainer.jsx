import { Plus, Trash2 } from "lucide-react";
import TaskCard from "./TaskCard";

function ColumnContainer({ column, deleteColumn, tasks, createTask, deleteTask }) {
  return (
    <div className="bg-gray-100 w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col">
      {/* Column Title */}
      <div className="bg-gray-100 text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-gray-400 border-4 flex items-center justify-between">
        <div className="flex gap-2">
          <div className="flex justify-center items-center bg-gray-200 px-2 py-1 text-sm rounded-full">
            {tasks.length}
          </div>
          {column.title}
        </div>
        <button
          onClick={() => deleteColumn(column.id)}
          className="stroke-gray-500 hover:stroke-white hover:bg-gray-500 rounded px-1 py-2"
        >
          <Trash2 />
        </button>
      </div>

      {/* Task List Area */}
      <div className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} deleteTask={deleteTask} />
        ))}
      </div>

      {/* Footer (Add Task Button) */}
      <button
        className="flex gap-2 items-center border-gray-400 border-2 rounded-md p-4 border-x-gray-400 hover:bg-gray-200 hover:text-rose-500 active:bg-black"
        onClick={() => createTask(column.id)}
      >
        <Plus /> Add Task
      </button>
    </div>
  );
}

export default ColumnContainer;