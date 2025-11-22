import { useState, useEffect, useRef } from "react";
import {
  Briefcase,
  User,
  GraduationCap,
  Sun,
  Moon,
  Plus,
  Trash2,
  Flag,
  Lightbulb,
  Pencil,
} from "lucide-react";

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const stored = localStorage.getItem("tasks");
    return stored ? JSON.parse(stored) : [];
  });

  const [taskText, setTaskText] = useState("");
  const [category, setCategory] = useState("Work");
  const [priority, setPriority] = useState("Medium");
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  const [draggingId, setDraggingId] = useState(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState("Work");
  const [editPriority, setEditPriority] = useState("Medium");

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const addTask = () => {
    if (!taskText.trim()) return;

    const newTask = {
      id: Date.now(),
      text: taskText.trim(),
      category,
      priority,
      completed: false,
      x: Math.random() * (window.innerWidth - 380) + 100,
      y: Math.random() * (window.innerHeight - 280) + 120,
    };

    setTasks((prev) => [...prev, newTask]);
    setTaskText("");
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (editingTaskId === id) setEditingTaskId(null);
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditText(task.text);
    setEditCategory(task.category);
    setEditPriority(task.priority);
  };

  const saveEdit = () => {
    if (!editText.trim()) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === editingTaskId
          ? {
              ...t,
              text: editText.trim(),
              category: editCategory,
              priority: editPriority,
            }
          : t
      )
    );
    setEditingTaskId(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditText("");
  };

  // === Smart Drag with Full Collision Detection (including Add Panel) ===
  const startDrag = (e, id) => {
    if (editingTaskId || e.button !== 0) return;
    e.stopPropagation();

    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();

    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    setDraggingId(id);
  };

  const onMouseMove = (e) => {
    if (!draggingId) return;
    const el = document.querySelector(`[data-task-id="${draggingId}"]`);
    if (!el) return;

    el.style.left = `${e.clientX - dragOffset.current.x}px`;
    el.style.top = `${e.clientY - dragOffset.current.y}px`;
  };
  const onMouseUp = () => {
    if (!draggingId) return;

    const el = document.querySelector(`[data-task-id="${draggingId}"]`);
    if (!el) {
      setDraggingId(null);
      return;
    }

    let x = el.getBoundingClientRect().left;
    let y = el.getBoundingClientRect().top;
    const w = el.offsetWidth;
    const h = el.offsetHeight;

    // Add panel protection
    const addPanel = document.getElementById("add-panel");
    const panelRect = addPanel?.getBoundingClientRect();

    const isOverlapping = (x1, y1) => {
      const rect1 = { left: x1, top: y1, right: x1 + w, bottom: y1 + h };

      // Check against add panel
      if (panelRect && 
          rect1.left < panelRect.right + 60 &&
          rect1.right > panelRect.left - 60 &&
          rect1.top < panelRect.bottom + 120 &&
          rect1.bottom > panelRect.top - 60) {
        return true;
      }

      // Check against other tasks
      return tasks.some(t => {
        if (t.id === draggingId) return false;
        const tx = t.x || 150;
        const ty = t.y || 200;
        const rect2 = { left: tx, top: ty, right: tx + w, bottom: ty + h + 30 };
        return (
          rect1.left < rect2.right + 30 &&
          rect1.right > rect2.left - 30 &&
          rect1.top < rect2.bottom + 30 &&
          rect1.bottom > rect2.top - 30
        );
      });
    };

    // Try to keep it where user dropped it
    if (!isOverlapping(x, y)) {
      // Perfect! No overlap
    } else {
      // Find nearest empty spot (spiral outward)
      const step = 35;
      let distance = 1;
      while (distance < 30) {
        for (let dx = -distance; dx <= distance; dx++) {
          for (let dy = -distance; dy <= distance; dy++) {
            if (Math.abs(dx) < distance && Math.abs(dy) < distance) continue;
            const testX = x + dx * step;
            const testY = y + dy * step;
            if (testX > 30 && testX + w < window.innerWidth - 30 &&
                testY > 30 && testY + h < window.innerHeight - 30 &&
                !isOverlapping(testX, testY)) {
              x = testX;
              y = testY;
              break;
            }
          }
          if (Math.abs(x - el.getBoundingClientRect().left) > 10) break;
        }
        if (Math.abs(x - el.getBoundingClientRect().left) > 10) break;
        distance++;
      }
    }

    // Final clamp to screen
    x = Math.max(30, Math.min(x, window.innerWidth - w - 30));
    y = Math.max(30, Math.min(y, window.innerHeight - h - 30));

    setTasks(prev => prev.map(t =>
      t.id === draggingId
        ? { ...t, x: Math.round(x), y: Math.round(y) }
        : t
    ));

    setDraggingId(null);
  };

  useEffect(() => {
    if (draggingId !== null) {
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      return () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
    }
  }, [draggingId]);

  const getPriorityColor = (p) =>
    p === "High"
      ? "bg-red-500"
      : p === "Medium"
      ? "bg-amber-500"
      : "bg-emerald-500";

  const getCategoryIcon = (c) =>
    c === "Work" ? Briefcase : c === "Personal" ? User : GraduationCap;

  return (
    <div
      className={`fixed inset-0 transition-all duration-500
        ${
          darkMode
            ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
            : "bg-gradient-to-br from-white via-blue-50 to-cyan-50 text-slate-900"
        }`}
    >
      {/* Floating Add Panel - Always on Top & Protected */}
      <div
        id="add-panel"
        className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-4 p-8 rounded-3xl shadow-2xl border backdrop-blur-xl
          ${
            darkMode
              ? "bg-slate-800/80 border-slate-700 text-white"
              : "bg-white/80 border-slate-200 text-slate-900"
          }`}
        style={{ pointerEvents: "auto" }}
      >
        <input
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="What needs to be done?"
          className={`px-6 py-4 rounded-2xl text-lg focus:ring-4 w-full
            ${
              darkMode
                ? "bg-slate-700 border-slate-600 text-white placeholder-slate-300 focus:ring-cyan-500/40"
                : "bg-white border-slate-600 text-slate-900 placeholder-gray-400 focus:ring-blue-400/40"
            }`}
        />
        <div className="flex gap-4 items-center">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`px-5 py-3 rounded-xl
              ${
                darkMode
                  ? "bg-slate-700 border-slate-600 text-white"
                  : "bg-white border-gray-300 text-slate-900"
              }`}
          >
            <option
              className={
                darkMode ? "bg-slate-800 text-white" : "bg-white text-slate-900"
              }
            >
              Work
            </option>
            <option
              className={
                darkMode ? "bg-slate-800 text-white" : "bg-white text-slate-900"
              }
            >
              Personal
            </option>
            <option
              className={
                darkMode ? "bg-slate-800 text-white" : "bg-white text-slate-900"
              }
            >
              School
            </option>
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className={`px-5 py-3 rounded-xl
              ${
                darkMode
                  ? "bg-slate-700 border-slate-600 text-white"
                  : "bg-white border-gray-300 text-slate-900"
              }`}
          >
            <option className="bg-slate-800">High</option>
            <option className="bg-slate-800">Medium</option>
            <option className="bg-slate-800">Low</option>
          </select>
          <button
            onClick={addTask}
            disabled={!taskText.trim()}
            className={`px-8 py-4 rounded-2xl font-bold shadow-xl flex items-center gap-3
              ${
                !taskText.trim()
                  ? "opacity-50 cursor-not-allowed"
                  : darkMode
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-cyan-500/50"
                  : "bg-gradient-to-r from-cyan-400 to-blue-600 text-white hover:shadow-blue-400/50"
              }`}
          >
            <Plus className="h-6 w-6" /> Add Task
          </button>
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-8 right-8 z-50 p-4 rounded-2xl border backdrop-blur-xl
          ${
            darkMode
              ? "bg-slate-800 border-slate-600 hover:bg-slate-700 text-white"
              : "bg-white border-gray-300 hover:bg-gray-100 text-slate-900"
          }`}
      >
        {darkMode ? (
          <Sun className="h-7 w-7 text-yellow-400" />
        ) : (
          <Moon className="h-7 w-7 text-slate-700" />
        )}
      </button>

      {/* Sticky Tasks */}
      {tasks.map((task) => {
        const Icon = getCategoryIcon(task.category);
        const isDragging = draggingId === task.id;

        return (
          <div
            key={task.id}
            data-task-id={task.id}
            onMouseDown={(e) => startDrag(e, task.id)}
            style={{
              position: "fixed",
              left: task.x ?? 150,
              top: task.y ?? 200,
              width: "360px",
              cursor: isDragging ? "grabbing" : "grab",
              zIndex: isDragging ? 999 : 10,
              transform: isDragging
                ? "rotate(8deg) scale(1.07)"
                : "rotate(0deg)",
              transition: isDragging
                ? "none"
                : "all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
            className={`p-4 rounded-3xl shadow-2xl border backdrop-blur-xl select-none transition 
              ${
                darkMode
                  ? "bg-slate-800 border-slate-700 text-white"
                  : "bg-white border-gray-200 text-slate-900"
              }
              ${task.completed ? "opacity-60" : ""}
              ${
                isDragging
                  ? "shadow-3xl ring-4 ring-cyan-400/50"
                  : "hover:shadow-3xl"
              }
            `}
          >
            {editingTaskId === task.id ? (
              <div className="space-y-4">
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                  className={`w-full px-4 py-3 rounded-xl border text-base
                    ${
                      darkMode
                        ? "bg-slate-700 border-slate-600 text-white placeholder-slate-300 focus:ring-cyan-500/30"
                        : "bg-white border-gray-300 text-slate-900 placeholder-gray-400 focus:ring-blue-400/30"
                    }`}
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={saveEdit}
                    className="px-5 py-2 rounded-xl text-white bg-cyan-600 font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-5 py-2 rounded-xl text-white bg-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5 min-h-20">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className={`mt-1 h-6 w-6 rounded border-2 cursor-pointer text-dark
                    ${
                      darkMode
                        ? "border-blue-600 text-blue-600"
                        : "border-blue-600 text-blue-600"
                    }
                  `}
                />
                <div className="flex-1">
                  <h3
                    className={`text-xl font-semibold ${
                      task.completed ? "line-through" : ""
                    }`}
                  >
                    {task.text}
                  </h3>
                  <div className="flex gap-3 mt-4">
                    <span
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                      ${
                        darkMode
                          ? "bg-slate-700 text-slate-300"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <Icon className="h-5 w-5" /> {task.category}
                    </span>
                    <span
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      <Flag className="h-5 w-5" /> {task.priority}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEditing(task)}
                    className="p-3 hover:bg-white/20 rounded-xl transition"
                  >
                    <Pencil className="h-5 w-5 text-blue-400" />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-3 hover:bg-white/20 rounded-xl transition"
                  >
                    <Trash2 className="h-5 w-5 text-red-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Tip */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <p
          className={`flex items-center gap-3 px-8 py-4 rounded-full backdrop-blur-xl text-sm font-medium border
          ${
            darkMode
              ? "bg-slate-800 border-slate-700 text-slate-300"
              : "bg-white border-gray-200 text-slate-700"
          }`}
        >
          <Lightbulb className="h-6 w-6 text-yellow-400" />
          Drag anywhere a task and Drop it anywhere • 
        </p>
      </div>
    </div>
  );
}
