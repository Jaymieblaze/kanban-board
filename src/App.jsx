import { useState, useEffect } from "react";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import ColumnContainer from "./components/ColumnContainer";
import TaskCard from "./components/TaskCard";
import { PlusIcon } from "lucide-react";

const defaultCols = [
  { id: "todo", title: "Todo" },
  { id: "doing", title: "In Progress" },
  { id: "done", title: "Done" },
];

const defaultTasks = [
  { id: "1", columnId: "todo", content: "Analyze Competitors" },
  { id: "2", columnId: "doing", content: "Design System" },
  { id: "3", columnId: "done", content: "Setup React Repo" },
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
      id: Math.floor(Math.random() * 10001).toString(),
      columnId,
      content: `Task ${tasks.length + 1}`,
    };
    setTasks([...tasks, newTask]);
  }

  function createNewColumn() {
    const columnToAdd = {
      id: Math.floor(Math.random() * 10001).toString(),
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
  function updateTask(id, content) {
    const newTasks = tasks.map((task) => {
      if (task.id !== id) return task;
      return { ...task, content };
    });
    setTasks(newTasks);
  }

  return (
    <div className="m-auto flex min-h-screen w-full items-center justify-center overflow-x-auto overflow-y-hidden px-[40px]">
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="m-auto flex gap-4">
          <div className="flex gap-4">
            <SortableContext items={columns.map((col) => col.id)}>
            {columns.map((col) => (
              <ColumnContainer
                key={col.id}
                column={col}
                deleteColumn={deleteColumn}
                tasks={tasks.filter((task) => task.columnId === col.id)}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            ))}
          </SortableContext>
          </div>
          
          {/* NEW: Add Column Button */}
          <button
            onClick={createNewColumn}
            className="
              h-[60px] 
              w-[350px] 
              min-w-[350px] 
              cursor-pointer 
              rounded-lg 
              bg-mainBackgroundColor 
              border-2 
              border-columnBackgroundColor 
              p-4 
              ring-rose-500 
              hover:ring-2 
              flex 
              gap-2 
              items-center // Centering text
              bg-gray-100 // Visual style
              border-gray-400 // Visual style
            "
          >
            <PlusIcon /> 
            Add Column
          </button>
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
  );
}

export default App;