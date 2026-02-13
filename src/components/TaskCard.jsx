import { useState } from "react";
import { Trash2, Calendar, Tag, X, AlertCircle } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const priorityColors = {
  low: { bg: "bg-green-100", border: "border-green-400", text: "text-green-700" },
  medium: { bg: "bg-blue-100", border: "border-blue-400", text: "text-blue-700" },
  high: { bg: "bg-orange-100", border: "border-orange-400", text: "text-orange-700" },
  urgent: { bg: "bg-red-100", border: "border-red-400", text: "text-red-700" },
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
        className={`opacity-30 p-3 min-h-[120px] flex flex-col text-left rounded-lg border-2 border-rose-500 cursor-grab relative ${colors.bg}`}
      />
    );
  }

  // VIEW MODE: EDITING (Modal-style)
  if (editMode) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleEditMode}
        />
        
        {/* Modal */}
        <div
          ref={setNodeRef}
          style={{ ...style, position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 50 }}
          className="bg-white p-6 w-[500px] max-w-[90vw] rounded-xl shadow-2xl max-h-[80vh] overflow-y-auto"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-gray-800">Edit Task</h3>
            <button
              onClick={toggleEditMode}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-rose-500 focus:outline-none"
              value={task.content}
              onChange={(e) => updateTask(task.id, { content: e.target.value })}
              placeholder="Task title"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-rose-500 focus:outline-none resize-none"
              rows="3"
              value={task.description || ""}
              onChange={(e) => updateTask(task.id, { description: e.target.value })}
              placeholder="Add a description..."
            />
          </div>

          {/* Priority */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <div className="flex gap-2">
              {Object.keys(priorityColors).map((p) => (
                <button
                  key={p}
                  onClick={() => updateTask(task.id, { priority: p })}
                  className={`px-3 py-1 rounded-lg border-2 capitalize ${
                    priority === p
                      ? `${priorityColors[p].bg} ${priorityColors[p].border} ${priorityColors[p].text} font-medium`
                      : "bg-gray-100 border-gray-300 text-gray-600"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 focus:border-rose-500 focus:outline-none"
              value={task.dueDate || ""}
              onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
            />
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {task.tags && task.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-600"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-1 text-sm focus:border-rose-500 focus:outline-none"
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
                className="px-3 py-1 bg-rose-500 text-white rounded-lg hover:bg-rose-600 text-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <button
              onClick={() => {
                deleteTask(task.id);
                toggleEditMode();
              }}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
            >
              <Trash2 size={16} />
              Delete Task
            </button>
            <button
              onClick={toggleEditMode}
              className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
            >
              Done
            </button>
          </div>
        </div>
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
      className={`p-3 min-h-[120px] flex flex-col text-left rounded-lg hover:ring-2 hover:ring-rose-500 cursor-grab relative border-l-4 ${colors.border} bg-white shadow-sm`}
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