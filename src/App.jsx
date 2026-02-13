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
    <div className="min-h-screen w-full flex flex-col">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-white/20 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-3">
          {/* Single Row: Title, Search, and Stats */}
          <div className="flex items-center gap-4">
            {/* Title */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 p-2 rounded-xl shadow-lg">
                <LayoutDashboard className="text-white" size={24} />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap">Kanban Board</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 relative min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 py-2 pl-10 pr-10 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all bg-white shadow-sm text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Statistics */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 shadow-sm">
                <LayoutDashboard size={16} className="text-indigo-600" />
                <span className="text-sm font-bold text-indigo-700">{stats.total}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50 shadow-sm">
                <CheckCircle2 size={16} className="text-green-600" />
                <span className="text-sm font-bold text-green-700">{stats.completed}</span>
              </div>
              {stats.overdue > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-200/50 shadow-sm">
                  <AlertCircle size={16} className="text-red-600" />
                  <span className="text-sm font-bold text-red-700">{stats.overdue}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Search Results Counter */}
          {searchQuery && (
            <p className="mt-2 text-xs text-purple-600 font-medium pl-14">
              Found {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
        >
          {/* Scrollable container for columns */}
          <div className="overflow-x-auto overflow-y-visible pb-4">
            <div className="inline-flex gap-4 px-4" style={{ minWidth: '100%' }}>
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
            
            {/* Add Column Button */}
            <button
              onClick={createNewColumn}
              className="w-[350px] min-w-[350px] h-[500px] rounded-xl border-2 border-dashed border-purple-200 hover:border-purple-400 bg-white/60 backdrop-blur-sm hover:bg-white/90 transition-all flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-purple-600 group shadow-lg hover:shadow-xl"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 group-hover:from-purple-200 group-hover:to-indigo-200 flex items-center justify-center transition-all shadow-md">
                <PlusIcon size={28} className="text-purple-600 group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-semibold text-base">Add Column</span>
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