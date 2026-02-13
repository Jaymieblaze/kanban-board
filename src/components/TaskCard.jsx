import { useState } from "react";
import { createPortal } from "react-dom";
import { Trash2, Calendar, Tag, X, AlertCircle } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const priorityColors = {
  low: { bg: "bg-emerald-50", border: "border-emerald-400", text: "text-emerald-700" },
  medium: { bg: "bg-blue-50", border: "border-blue-400", text: "text-blue-700" },
  high: { bg: "bg-amber-50", border: "border-amber-400", text: "text-amber-700" },
  urgent: { bg: "bg-rose-50", border: "border-rose-500", text: "text-rose-700" },
};

function TaskCard({ task, deleteTask, updateTask }) {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newTag, setNewTag] = useState("");

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
    disabled: editMode, // IMPORTANT: Disable drag when editing so we can select text!
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setMouseIsOver(false);
  };

  const addTag = () => {
    if (newTag.trim() && !task.tags.includes(newTag.trim())) {
      updateTask(task.id, { tags: [...task.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    updateTask(task.id, { tags: task.tags.filter((tag) => tag !== tagToRemove) });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const priority = task.priority || "medium";
  const colors = priorityColors[priority];

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`opacity-40 p-3 min-h-[120px] flex flex-col text-left rounded-lg border-2 border-dashed border-purple-400 cursor-grab relative ${colors.bg} shadow-lg`}
      />
    );
  }

  // VIEW MODE: EDITING (Modal-style)
  if (editMode) {
    return (
      <>
        {/* Hidden placeholder to maintain layout */}
        <div 
          ref={setNodeRef} 
          style={style}
          className={`p-3 min-h-[120px] flex flex-col text-left rounded-lg border-l-4 ${colors.border} bg-white shadow-sm opacity-50`}
        />
        
        {/* Modal portal */}
        {createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
              onClick={toggleEditMode}
            />
            
            {/* Modal */}
            <div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] bg-white p-6 w-[500px] max-w-[90vw] rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto border border-purple-100"
            >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Edit Task</h3>
            <button
              onClick={toggleEditMode}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <input
              type="text"
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all"
              value={task.content}
              onChange={(e) => updateTask(task.id, { content: e.target.value })}
              placeholder="Task title"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 focus:outline-none resize-none transition-all"
              rows="3"
              value={task.description || ""}
              onChange={(e) => updateTask(task.id, { description: e.target.value })}
              placeholder="Add a description..."
            />
          </div>

          {/* Priority */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
            <div className="flex gap-2">
              {Object.keys(priorityColors).map((p) => (
                <button
                  key={p}
                  onClick={() => updateTask(task.id, { priority: p })}
                  className={`px-4 py-2 rounded-lg border-2 capitalize font-medium transition-all ${
                    priority === p
                      ? `${priorityColors[p].bg} ${priorityColors[p].border} ${priorityColors[p].text} shadow-md scale-105`
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
            <input
              type="date"
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all"
              value={task.dueDate || ""}
              onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
            />
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {task.tags && task.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-purple-400 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tag..."
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 text-sm font-medium shadow-md hover:shadow-lg transition-all"
              >
                Add
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <button
              onClick={() => {
                deleteTask(task.id);
                toggleEditMode();
              }}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg font-medium transition-all"
            >
              <Trash2 size={16} />
              Delete Task
            </button>
            <button
              onClick={toggleEditMode}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 font-medium shadow-md hover:shadow-lg transition-all"
            >
              Done
            </button>
          </div>
        </div>
          </>,
          document.body
        )}
      </>
    );
  }

  // VIEW MODE: STATIC (Draggable)
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={toggleEditMode}
      className={`p-3 min-h-[120px] flex flex-col text-left rounded-lg hover:ring-2 hover:ring-purple-400 cursor-grab relative border-l-4 ${colors.border} bg-white shadow-sm hover:shadow-md transition-all`}
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
    >
      {/* Priority Badge */}
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} font-medium capitalize`}>
          {priority}
        </span>
        
        {/* Delete button */}
        {mouseIsOver && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(task.id);
            }}
            className="text-gray-400 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Task Title */}
      <h4 className="font-medium text-gray-800 mb-2 line-clamp-2">
        {task.content}
      </h4>

      {/* Description Preview */}
      {task.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs"
            >
              <Tag size={10} />
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{task.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Due Date */}
      {task.dueDate && (
        <div className={`flex items-center gap-1 text-xs mt-auto ${
          isOverdue(task.dueDate) ? "text-red-600 font-medium" : "text-gray-500"
        }`}>
          {isOverdue(task.dueDate) ? <AlertCircle size={12} /> : <Calendar size={12} />}
          {formatDate(task.dueDate)}
          {isOverdue(task.dueDate) && " (Overdue)"}
        </div>
      )}
    </div>
  );
}

export default TaskCard;