import { useMemo, useState } from "react";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Trash2 } from "lucide-react";
import TaskCard from "./TaskCard";
import ConfirmDialog from "./ConfirmDialog";

function ColumnContainer({ column, deleteColumn, updateColumn, tasks, createTask, deleteTask, updateTask }) {
  const [editMode, setEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
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
        className="bg-white/50 dark:bg-gray-800/50 min-h-[400px] max-h-[calc(100vh-180px)] rounded-xl flex flex-col opacity-50 border-2 border-dashed border-purple-400 dark:border-purple-600 shadow-lg"
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm min-h-[400px] max-h-[calc(100vh-180px)] rounded-xl flex flex-col shadow-xl border border-white/40 dark:border-gray-700"
    >
      {/* Title Area */}
      <div
        {...attributes}
        {...listeners}
        className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 text-md h-[60px] cursor-grab rounded-t-xl p-3 font-bold border-b-2 border-purple-100 dark:border-gray-600 flex items-center justify-between hover:from-purple-100 hover:via-indigo-100 hover:to-purple-100 dark:hover:from-gray-600 dark:hover:via-gray-700 dark:hover:to-gray-600 transition-colors text-gray-800 dark:text-gray-200"
      >
        <div className="flex gap-2 items-center">
          <div className="flex justify-center items-center bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 text-purple-700 dark:text-purple-300 px-2.5 py-1 text-xs rounded-full font-bold shadow-sm">
            {tasks.length}
          </div>
          {!editMode && (
            <div
              onClick={() => setEditMode(true)}
              className="cursor-text px-2 py-1 rounded-lg hover:bg-purple-100/50 dark:hover:bg-gray-600/50 transition-colors text-gray-800 dark:text-gray-200"
            >
              {column.title}
            </div>
          )}
          {editMode && (
            <input
              className="bg-white dark:bg-gray-700 border-2 border-purple-400 dark:border-purple-600 focus:border-purple-600 dark:focus:border-purple-400 rounded-lg outline-none px-2 py-1 shadow-sm text-gray-800 dark:text-gray-200"
              value={column.title}
              onChange={(e) => updateColumn(column.id, e.target.value)}
              autoFocusg
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
          onClick={() => setShowDeleteConfirm(true)}
          className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg p-2 transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Task List Area */}
      <div className="flex grow flex-col gap-3 p-3 overflow-x-hidden overflow-y-auto bg-gradient-to-b from-white/50 to-gray-50/30 dark:from-gray-900/50 dark:to-gray-800/30">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} deleteTask={deleteTask} updateTask={updateTask} />
          ))}
        </SortableContext>
        
        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 py-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 flex items-center justify-center mb-3 shadow-sm">
              <Plus size={32} className="text-purple-400 dark:text-purple-500" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No tasks yet</p>
            <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">Click below to add one</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <button
        className="flex gap-2 items-center justify-center border-t-2 border-purple-100 dark:border-gray-600 rounded-b-xl p-4 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-gray-700 active:bg-purple-100 dark:active:bg-gray-600 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all font-medium text-sm touch-manipulation min-h-[48px]"
        onClick={() => createTask(column.id)}
      >
        <Plus size={18} /> Add Task
      </button>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteColumn(column.id)}
        title={`Delete "${column.title}"?`}
        message={`This will permanently delete the column and all ${tasks.length} task(s) inside it.\n\nThis action cannot be undone.`}
        confirmText="Delete Column"
      />
    </div>
  );
}

export default ColumnContainer;