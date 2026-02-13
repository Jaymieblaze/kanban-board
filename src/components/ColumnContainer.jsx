import { useMemo, useState } from "react";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Trash2 } from "lucide-react";
import TaskCard from "./TaskCard";

function ColumnContainer({ column, deleteColumn, updateColumn, tasks, createTask, deleteTask, updateTask }) {
  const [editMode, setEditMode] = useState(false);
  
  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  // Make the column sortable/droppable
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: editMode, // Disable drag when editing title
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white/50 w-[350px] h-[500px] max-h-[500px] rounded-xl flex flex-col opacity-50 border-2 border-dashed border-rose-400 shadow-lg"
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white w-[350px] h-[500px] max-h-[500px] rounded-xl flex flex-col shadow-lg border border-gray-200"
    >
      {/* Title Area */}
      <div
        {...attributes}
        {...listeners}
        className="bg-gradient-to-r from-gray-50 to-gray-100 text-md h-[60px] cursor-grab rounded-t-xl p-3 font-bold border-b-2 border-gray-200 flex items-center justify-between hover:from-gray-100 hover:to-gray-200 transition-colors"
      >
        <div className="flex gap-2 items-center">
          <div className="flex justify-center items-center bg-rose-100 text-rose-700 px-2.5 py-1 text-xs rounded-full font-semibold">
            {tasks.length}
          </div>
          {!editMode && (
            <div
              onClick={() => setEditMode(true)}
              className="cursor-text px-2 py-1 rounded hover:bg-white/50 transition-colors"
            >
              {column.title}
            </div>
          )}
          {editMode && (
            <input
              className="bg-white border-2 border-rose-500 focus:border-rose-600 rounded-lg outline-none px-2 py-1 shadow-sm"
              value={column.title}
              onChange={(e) => updateColumn(column.id, e.target.value)}
              autoFocus
              onBlur={() => setEditMode(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditMode(false);
                }
              }}
            />
          )}
        </div>
        <button
          onClick={() => deleteColumn(column.id)}
          className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-2 transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Task List Area */}
      <div className="flex grow flex-col gap-3 p-3 overflow-x-hidden overflow-y-auto bg-gray-50/50">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} deleteTask={deleteTask} updateTask={updateTask} />
          ))}
        </SortableContext>
        
        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Plus size={32} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium">No tasks yet</p>
            <p className="text-xs mt-1">Click below to add one</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <button
        className="flex gap-2 items-center justify-center border-t-2 border-gray-200 rounded-b-xl p-3 bg-white hover:bg-gray-50 text-gray-600 hover:text-rose-600 transition-all font-medium text-sm"
        onClick={() => createTask(column.id)}
      >
        <Plus size={18} /> Add Task
      </button>
    </div>
  );
}

export default ColumnContainer;