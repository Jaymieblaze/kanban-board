import { useState } from "react";
import ColumnContainer from "./components/ColumnContainer";

function App() {
  const [columns, setColumns] = useState([
    { id: "todo", title: "Todo" },
    { id: "doing", title: "Work in Progress" },
    { id: "done", title: "Done" },
  ]);

  const [tasks, setTasks] = useState([
    { id: "1", columnId: "todo", content: "Analyze Competitors" },
    { id: "2", columnId: "doing", content: "Design System" },
    { id: "3", columnId: "done", content: "Setup React Repo" },
  ]);

  function createTask(columnId) {
    const newTask = {
      id: Math.floor(Math.random() * 10001).toString(),
      columnId,
      content: `Task ${tasks.length + 1}`,
    };
    setTasks([...tasks, newTask]);
  }

  function deleteTask(id) {
    const newTasks = tasks.filter((task) => task.id !== id);
    setTasks(newTasks);
  }

  function deleteColumn(id) {
    const filteredColumns = columns.filter((col) => col.id !== id);
    setColumns(filteredColumns);
  }

  return (
    <div className="m-auto flex min-h-screen w-full items-center justify-center overflow-x-auto overflow-y-hidden px-[40px]">
      <div className="m-auto flex gap-4">
        {columns.map((col) => (
          <ColumnContainer
            key={col.id}
            column={col}
            deleteColumn={deleteColumn}
            tasks={tasks.filter((task) => task.columnId === col.id)}
            createTask={createTask}
            deleteTask={deleteTask}
          />
        ))}
      </div>
    </div>
  );
}

export default App;