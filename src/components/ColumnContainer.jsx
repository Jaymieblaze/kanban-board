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
        className="bg-white/50 w-[350px] h-[500px] max-h-[500px] rounded-xl flex flex-col opacity-50 border-2 border-dashed border-purple-400 shadow-lg"
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white/95 backdrop-blur-sm w-[350px] h-[500px] max-h-[500px] rounded-xl flex flex-col shadow-xl border border-white/40"
    >
      {/* Title Area */}
      <div
        {...attributes}
        {...listeners}
        className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 text-md h-[60px] cursor-grab rounded-t-xl p-3 font-bold border-b-2 border-purple-100 flex items-center justify-between hover:from-purple-100 hover:via-indigo-100 hover:to-purple-100 transition-colors"
      >
        <div className="flex gap-2 items-center">
          <div className="flex justify-center items-center bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700 px-2.5 py-1 text-xs rounded-full font-bold shadow-sm">
            {tasks.length}
          </div>
          {!editMode && (
            <div
              onClick={() => setEditMode(true)}
              className="cursor-text px-2 py-1 rounded-lg hover:bg-purple-100/50 transition-colors"
            >
              {column.title}
            </div>
          )}
          {editMode && (
            <input
              className="bg-white border-2 border-purple-400 focus:border-purple-600 rounded-lg outline-none px-2 py-1 shadow-sm"
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
      <div className="flex grow flex-col gap-3 p-3 overflow-x-hidden overflow-y-auto bg-gradient-to-b from-white/50 to-gray-50/30">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} deleteTask={deleteTask} updateTask={updateTask} />
          ))}
        </SortableContext>
        
        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mb-3 shadow-sm">
              <Plus size={32} className="text-purple-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">No tasks yet</p>
            <p className="text-xs mt-1 text-gray-400">Click below to add one</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <button
        className="flex gap-2 items-center justify-center border-t-2 border-purple-100 rounded-b-xl p-3 bg-white hover:bg-purple-50 text-gray-600 hover:text-purple-600 transition-all font-medium text-sm"
        onClick={() => createTask(column.id)}
      >
        <Plus size={18} /> Add Task
      </button>
    </div>
  );
}

export default ColumnContainer;