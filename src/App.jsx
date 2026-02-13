import { useState, useEffect, useMemo } from "react";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import ColumnContainer from "./components/ColumnContainer";
import TaskCard from "./components/TaskCard";
import { PlusIcon, Search, X, LayoutDashboard, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const defaultCols = [
  { id: "todo", title: "Todo" },
  { id: "doing", title: "In Progress" },
  { id: "done", title: "Done" },
];

const defaultTasks = [
  { 
    id: "1", 
    columnId: "todo", 
    content: "Analyze Competitors",
    description: "Research top 3 competitors and their features",
    priority: "high",
    dueDate: "2026-02-20",
    tags: ["research", "strategy"]
  },
  { 
    id: "2", 
    columnId: "doing", 
    content: "Design System",
    description: "Create component library and design tokens",
    priority: "medium",
    dueDate: "2026-02-25",
    tags: ["design", "ui"]
  },
  { 
    id: "3", 
    columnId: "done", 
    content: "Setup React Repo",
    description: "",
    priority: "low",
    dueDate: "",
    tags: ["development"]
  },
];

function App() {
  const [columns, setColumns] = useState(() => {
    const savedColumns = localStorage.getItem("kanban-columns");
    return savedColumns ? JSON.parse(savedColumns) : defaultCols;
  });

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("kanban-tasks");
    return savedTasks ? JSON.parse(savedTasks) : defaultTasks;
  });

  const [activeTask, setActiveTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter tasks based on search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const query = searchQuery.toLowerCase();
    return tasks.filter((task) => {
      const matchesContent = task.content.toLowerCase().includes(query);
      const matchesDescription = task.description?.toLowerCase().includes(query);
      const matchesTags = task.tags?.some(tag => tag.toLowerCase().includes(query));
      return matchesContent || matchesDescription || matchesTags;
    });
  }, [tasks, searchQuery]);

  // Save columns to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("kanban-columns", JSON.stringify(columns));
  }, [columns]);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("kanban-tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Sensors: Detect mouse/touch interactions (distance: 3px prevents accidental drags)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, 
      },
    })
  );

  function createTask(columnId) {
    const newTask = {
      id: crypto.randomUUID(),
      columnId,
      content: `Task ${tasks.length + 1}`,
      description: "",
      priority: "medium",
      dueDate: "",
      tags: [],
    };
    setTasks([...tasks, newTask]);
  }

  function createNewColumn() {
    const columnToAdd = {
      id: crypto.randomUUID(),
      title: `Column ${columns.length + 1}`,
    };
    setColumns([...columns, columnToAdd]);
  }

  function deleteTask(id) {
    const newTasks = tasks.filter((task) => task.id !== id);
    setTasks(newTasks);
  }

  function deleteColumn(id) {
    const filteredColumns = columns.filter((col) => col.id !== id);
    setColumns(filteredColumns);
  }

  // --- DRAG AND DROP LOGIC STARTS HERE ---

  function onDragStart(event) {
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
    }
  }

  function onDragEnd(event) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    setTasks((tasks) => {
      const activeIndex = tasks.findIndex((t) => t.id === activeId);
      const overIndex = tasks.findIndex((t) => t.id === overId);

      // If we are just reordering in the same column, arrayMove handles it
      if (tasks[activeIndex].columnId === tasks[overIndex].columnId) {
        return arrayMove(tasks, activeIndex, overIndex);
      }
      // If moving between columns, onDragOver handles the heavy lifting
      return tasks;
    });
  }

  function onDragOver(event) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    if (!isActiveTask) return;

    // Scenario 1: Dropping a Task over another Task
    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
          // Create a new array with the updated task instead of mutating
          const tasksCopy = [...tasks];
          tasksCopy[activeIndex] = {
            ...tasksCopy[activeIndex],
            columnId: tasksCopy[overIndex].columnId,
          };
          return arrayMove(tasksCopy, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    // Scenario 2: Dropping a Task over a Column (The Empty Column Fix)
    const isOverColumn = over.data.current?.type === "Column";
    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        // Create a new task object with updated columnId instead of mutating
        const tasksCopy = [...tasks];
        tasksCopy[activeIndex] = {
          ...tasksCopy[activeIndex],
          columnId: overId,
        };
        return tasksCopy;
      });
    }
  }

  // Update the content of a task
  function updateTask(id, updates) {
    const newTasks = tasks.map((task) => {
      if (task.id !== id) return task;
      return { ...task, ...updates };
    });
    setTasks(newTasks);
  }

  // Update the title of a column
  function updateColumn(id, title) {
    const newColumns = columns.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    });
    setColumns(newColumns);
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const byPriority = {
      urgent: tasks.filter(t => t.priority === 'urgent').length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    };
    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length;
    const completed = tasks.filter(t => t.columnId === 'done').length;
    return { total, byPriority, overdue, completed };
  }, [tasks]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Top Row: Title and Stats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-2 rounded-lg shadow-md">
                <LayoutDashboard className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Kanban Board</h1>
                <p className="text-sm text-gray-500">Organize your workflow</p>
              </div>
            </div>

            {/* Statistics */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <LayoutDashboard size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{stats.total}</span>
                <span className="text-xs text-gray-500">Total</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                <CheckCircle2 size={16} className="text-green-600" />
                <span className="text-sm font-medium text-green-700">{stats.completed}</span>
                <span className="text-xs text-gray-500">Done</span>
              </div>
              {stats.overdue > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
                  <AlertCircle size={16} className="text-red-600" />
                  <span className="text-sm font-medium text-red-700">{stats.overdue}</span>
                  <span className="text-xs text-gray-500">Overdue</span>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search tasks by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-600">
              Found {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 py-8">
        <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-4">
              <SortableContext items={columns.map((col) => col.id)}>
              {columns.map((col) => (
                <ColumnContainer
                  key={col.id}
                  column={col}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  tasks={filteredTasks.filter((task) => task.columnId === col.id)}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                />
              ))}
            </SortableContext>
            
            {/* NEW: Add Column Button */}
            <button
              onClick={createNewColumn}
              className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-gray-100 border-2 border-gray-400 p-4 ring-rose-500 hover:ring-2 flex gap-2 items-center"
            >
              <PlusIcon /> 
              Add Column
            </button>
            </div>
          </div>

          {/* Drag Overlay: The visual card that follows your mouse */}
          {createPortal(
            <DragOverlay>
              {activeTask && (
                <TaskCard
                  task={activeTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                />
              )}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </div>
    </div>
  );
}

export default App;