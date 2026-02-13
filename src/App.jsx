import { useState, useEffect, useMemo } from "react";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import ColumnContainer from "./components/ColumnContainer";
import TaskCard from "./components/TaskCard";
import { PlusIcon, Search, X, LayoutDashboard, CheckCircle2, Clock, AlertCircle, ChevronLeft, ChevronRight, Menu, Moon, Sun, Filter } from "lucide-react";

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
  const [currentPage, setCurrentPage] = useState(0);
  const [showMobileStats, setShowMobileStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priorities: [],
    tags: [],
    showOverdue: false
  });
  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem("kanban-dark-mode");
    return savedDarkMode ? JSON.parse(savedDarkMode) : false;
  });
  
  const COLUMNS_PER_PAGE = 4;

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem("kanban-dark-mode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Filter tasks based on search query and filters
  const filteredTasks = useMemo(() => {
    let result = tasks;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((task) => {
        const matchesContent = task.content.toLowerCase().includes(query);
        const matchesDescription = task.description?.toLowerCase().includes(query);
        const matchesTags = task.tags?.some(tag => tag.toLowerCase().includes(query));
        return matchesContent || matchesDescription || matchesTags;
      });
    }
    
    // Apply priority filter
    if (filters.priorities.length > 0) {
      result = result.filter((task) => filters.priorities.includes(task.priority));
    }
    
    // Apply tag filter
    if (filters.tags.length > 0) {
      result = result.filter((task) => 
        task.tags?.some(tag => filters.tags.includes(tag))
      );
    }
    
    // Apply overdue filter
    if (filters.showOverdue) {
      result = result.filter((task) => {
        if (!task.dueDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(task.dueDate);
        due.setHours(0, 0, 0, 0);
        return due < today;
      });
    }
    
    return result;
  }, [tasks, searchQuery, filters]);

  // Get all unique tags from all tasks
  const allTags = useMemo(() => {
    const tagsSet = new Set();
    tasks.forEach(task => {
      task.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [tasks]);

  // Filter helper functions
  const togglePriorityFilter = (priority) => {
    setFilters(prev => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter(p => p !== priority)
        : [...prev.priorities, priority]
    }));
  };

  const toggleTagFilter = (tag) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const toggleOverdueFilter = () => {
    setFilters(prev => ({
      ...prev,
      showOverdue: !prev.showOverdue
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      priorities: [],
      tags: [],
      showOverdue: false
    });
  };

  const hasActiveFilters = filters.priorities.length > 0 || filters.tags.length > 0 || filters.showOverdue;

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
  
  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil((columns.length + 1) / COLUMNS_PER_PAGE)); // +1 for Add Column button
  const startIdx = currentPage * COLUMNS_PER_PAGE;
  const endIdx = startIdx + COLUMNS_PER_PAGE;
  const visibleColumns = columns.slice(startIdx, Math.min(endIdx - 1, columns.length)); // Reserve last slot for Add button
  const showAddButton = endIdx > columns.length; // Show Add button if there's room on this page
  
  // Reset to last page if current page becomes invalid
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-purple-100 via-indigo-100 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg border-b border-purple-100 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2">
          {/* Single Row: Title, Search, and Stats */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Title */}
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-lg">
                <LayoutDashboard className="text-white" size={18} />
              </div>
              <h1 className="text-sm sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent whitespace-nowrap">Kanban Board</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 py-1.5 sm:py-2 pl-8 sm:pl-10 pr-8 sm:pr-10 focus:border-purple-400 dark:focus:border-purple-500 focus:ring-2 sm:focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900 focus:outline-none transition-all bg-white shadow-sm text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1 transition-all"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Statistics - Hidden on mobile/tablet, shown on desktop */}
            <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
              <div className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border border-blue-200/50 dark:border-blue-800 shadow-sm">
                <LayoutDashboard size={14} className="text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{stats.total}</span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-200/50 dark:border-green-800 shadow-sm">
                <CheckCircle2 size={14} className="text-green-600 dark:text-green-400" />
                <span className="text-xs font-bold text-green-700 dark:text-green-300">{stats.completed}</span>
              </div>
              {stats.overdue > 0 && (
                <div className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 rounded-lg border border-red-200/50 dark:border-red-800 shadow-sm">
                  <AlertCircle size={14} className="text-red-600 dark:text-red-400" />
                  <span className="text-xs font-bold text-red-700 dark:text-red-300">{stats.overdue}</span>
                </div>
              )}
            </div>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDarkMode(prev => !prev);
              }}
              className="p-2 hover:bg-purple-50 dark:hover:bg-gray-800 active:bg-purple-100 dark:active:bg-gray-700 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
              aria-label="Toggle dark mode"
              type="button"
            >
              {darkMode ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-purple-600" />
              )}
            </button>
            
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative p-2 hover:bg-purple-50 dark:hover:bg-gray-800 active:bg-purple-100 dark:active:bg-gray-700 rounded-lg transition-colors flex-shrink-0 ${hasActiveFilters ? 'bg-purple-100 dark:bg-purple-900' : ''}`}
              aria-label="Toggle filters"
              type="button"
            >
              <Filter size={20} className={hasActiveFilters ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'} />
              {hasActiveFilters && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-purple-600 rounded-full"></span>
              )}
            </button>
            
            {/* Mobile Stats Menu Button */}
            <button
              onClick={() => setShowMobileStats(!showMobileStats)}
              className="lg:hidden p-2 hover:bg-purple-50 dark:hover:bg-gray-800 active:bg-purple-100 dark:active:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              aria-label="Toggle statistics"
            >
              <Menu size={20} className="text-purple-600 dark:text-purple-400" />
            </button>
          </div>
          
          {/* Search/Filter results count */}
          {(searchQuery || hasActiveFilters) && (
            <p className="mt-1 sm:mt-1.5 text-xs text-purple-600 dark:text-purple-400 font-medium pl-2 sm:pl-9">
              {filteredTasks.length} result{filteredTasks.length !== 1 ? "s" : ""}
              {hasActiveFilters && " (filtered)"}
            </p>
          )}
          
          {/* Mobile Stats Panel */}
          {showMobileStats && (
            <div className="lg:hidden mt-3 pb-2 px-2 animate-in slide-in-from-top-2 duration-200">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-3 shadow-lg border border-purple-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-purple-900 dark:text-purple-300">Statistics</h3>
                  <button
                    onClick={() => setShowMobileStats(false)}
                    className="p-1 hover:bg-white/50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Close statistics"
                  >
                    <X size={14} className="text-purple-600 dark:text-purple-400" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/80 dark:bg-gray-700/80 rounded-lg shadow-sm">
                    <Clock size={16} className="text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                      <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{stats.total}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/80 dark:bg-gray-700/80 rounded-lg shadow-sm">
                    <CheckCircle2 size={16} className="text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Done</p>
                      <p className="text-lg font-bold text-green-700 dark:text-green-300">{stats.completed}</p>
                    </div>
                  </div>
                  {stats.overdue > 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/80 dark:bg-gray-700/80 rounded-lg shadow-sm col-span-2">
                      <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Overdue</p>
                        <p className="text-lg font-bold text-red-700 dark:text-red-300">{stats.overdue}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-3 pb-2 px-2 animate-in slide-in-from-top-2 duration-200">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 shadow-lg border border-purple-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-purple-900 dark:text-purple-300">Filters</h3>
                  <div className="flex gap-2">
                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                      >
                        Clear All
                      </button>
                    )}
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-1 hover:bg-white/50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      aria-label="Close filters"
                    >
                      <X size={14} className="text-purple-600 dark:text-purple-400" />
                    </button>
                  </div>
                </div>

                {/* Priority Filter */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Priority</label>
                  <div className="flex flex-wrap gap-2">
                    {['low', 'medium', 'high', 'urgent'].map(priority => (
                      <button
                        key={priority}
                        onClick={() => togglePriorityFilter(priority)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                          filters.priorities.includes(priority)
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md'
                            : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        {priority}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags Filter */}
                {allTags.length > 0 && (
                  <div className="mb-4">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleTagFilter(tag)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            filters.tags.includes(tag)
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md'
                              : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-gray-600'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Overdue Toggle */}
                <div>
                  <button
                    onClick={toggleOverdueFilter}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all ${
                      filters.showOverdue
                        ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md'
                        : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <AlertCircle size={16} />
                      Show Overdue Only
                    </span>
                    <div className={`w-10 h-5 rounded-full transition-colors ${
                      filters.showOverdue ? 'bg-white/30' : 'bg-gray-300 dark:bg-gray-600'
                    } relative`}>
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        filters.showOverdue ? 'translate-x-5' : ''
                      }`}></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 py-4 sm:py-8 pb-8 sm:pb-12">
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
        >
          {/* Column pagination container */}
          <div className="px-4 sm:px-6 max-w-[1800px] mx-auto">
            <div className="relative">
              {/* Navigation arrows and page indicator - Hidden on mobile */}
              <div className="hidden md:flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-800 transition-all border border-purple-200 dark:border-gray-700 disabled:hover:bg-white/80 dark:disabled:hover:bg-gray-800/80"
                >
                  <ChevronLeft size={20} className="text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Previous</span>
                </button>
                
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border border-purple-200/50 dark:border-purple-800 shadow-sm">
                  <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">({columns.length} columns)</span>
                </div>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-800 transition-all border border-purple-200 dark:border-gray-700 disabled:hover:bg-white/80 dark:disabled:hover:bg-gray-800/80"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Next</span>
                  <ChevronRight size={20} className="text-purple-600 dark:text-purple-400" />
                </button>
              </div>
              
              {/* Columns grid - responsive layout */}
              {/* Mobile: horizontal scroll with fixed width columns */}
              {/* Desktop: grid layout with pagination */}
              <div className="md:hidden overflow-x-auto overflow-y-visible pb-4 -mx-4 px-4">
                <div className="inline-flex gap-3" style={{ minWidth: '100%' }}>
                  <SortableContext items={columns.map((col) => col.id)}>
                    {columns.map((col) => (
                      <div key={col.id} className="w-[85vw] sm:w-[400px] flex-shrink-0">
                        <ColumnContainer
                          column={col}
                          deleteColumn={deleteColumn}
                          updateColumn={updateColumn}
                          tasks={filteredTasks.filter((task) => task.columnId === col.id)}
                          createTask={createTask}
                          deleteTask={deleteTask}
                          updateTask={updateTask}
                        />
                      </div>
                    ))}
                  </SortableContext>
                  
                  {/* Add Column Button - Mobile */}
                  <button
                    onClick={createNewColumn}
                    className="w-[85vw] sm:w-[400px] flex-shrink-0 min-h-[400px] max-h-[calc(100vh-120px)] md:max-h-[calc(100vh-180px)] rounded-xl border-2 border-dashed border-purple-200 hover:border-purple-400 active:border-purple-500 bg-white/60 backdrop-blur-sm hover:bg-white/90 active:bg-white transition-all flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-purple-600 active:text-purple-700 group shadow-lg"
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 group-hover:from-purple-200 group-hover:to-indigo-200 flex items-center justify-center transition-all shadow-md">
                      <PlusIcon size={28} className="text-purple-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="font-semibold text-base">Add Column</span>
                  </button>
                </div>
              </div>
              
              {/* Desktop: paginated grid */}
              <div className="hidden md:block">
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${showAddButton ? visibleColumns.length + 1 : visibleColumns.length}, 1fr)` }}>
                <SortableContext items={visibleColumns.map((col) => col.id)}>
                  {visibleColumns.map((col) => (
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
                
                {/* Add Column Button - only show on current page if there's room */}
                {showAddButton && (
                  <button
                    onClick={() => {
                      createNewColumn();
                      // Navigate to last page after adding if needed
                      setTimeout(() => {
                        const newTotalPages = Math.ceil((columns.length + 2) / COLUMNS_PER_PAGE);
                        if (newTotalPages > totalPages) {
                          setCurrentPage(newTotalPages - 1);
                        }
                      }, 0);
                    }}
                    className="min-h-[400px] max-h-[calc(100vh-120px)] md:max-h-[calc(100vh-180px)] rounded-xl border-2 border-dashed border-purple-200 hover:border-purple-400 bg-white/60 backdrop-blur-sm hover:bg-white/90 transition-all flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-purple-600 group shadow-lg hover:shadow-xl"
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 group-hover:from-purple-200 group-hover:to-indigo-200 flex items-center justify-center transition-all shadow-md">
                      <PlusIcon size={28} className="text-purple-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="font-semibold text-base">Add Column</span>
                  </button>
                )}
              </div>
              </div>
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