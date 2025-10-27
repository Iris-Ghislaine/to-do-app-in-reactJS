import { useState, useEffect } from "react";
import {
  Briefcase,
  User,
  GraduationCap,
  PieChart,
  Sun,
  Moon,
  Plus,
  Search,
  CheckCheck,
  ClipboardList,
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
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [showStats, setShowStats] = useState(false);
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
    setTasks([
      ...tasks,
      {
        id: Date.now(),
        text: taskText.trim(),
        category,
        priority,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ]);
    setTaskText("");
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
    if (editingTaskId === id) setEditingTaskId(null);
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const clearCompleted = () => {
    setTasks(tasks.filter((task) => !task.completed));
    setEditingTaskId(null);
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditText(task.text);
    setEditCategory(task.category);
    setEditPriority(task.priority);
  };

  const saveEdit = (id) => {
    if (!editText.trim()) return;
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, text: editText.trim(), category: editCategory, priority: editPriority }
          : task
      )
    );
    setEditingTaskId(null);
    setEditText("");
    setEditCategory("Work");
    setEditPriority("Medium");
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditText("");
    setEditCategory("Work");
    setEditPriority("Medium");
  };

  const handleDragStart = (e, index) => {
    if (editingTaskId) return; // Prevent dragging while editing
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
    setDraggedIndex(null);
  };

  const handleDragOver = (e) => {
    if (editingTaskId) return; // Prevent drag over while editing
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex || editingTaskId) return;

    const updatedTasks = [...tasks];
    const [draggedTask] = updatedTasks.splice(draggedIndex, 1);
    updatedTasks.splice(dropIndex, 0, draggedTask);
    setTasks(updatedTasks);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  const handleEditKeyPress = (e, id) => {
    if (e.key === "Enter") {
      saveEdit(id);
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === "High") return "bg-red-500 text-white";
    if (priority === "Medium") return "bg-amber-500 text-white";
    return "bg-emerald-500 text-white";
  };

  const getCategoryIcon = (category) => {
    if (category === "Work") return Briefcase;
    if (category === "Personal") return User;
    return GraduationCap;
  };

  const filteredTasks = tasks.filter((task) => {
    const matchSearch = task.text.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      filterCategory === "All" || task.category === filterCategory;
    const matchPriority =
      filterPriority === "All" || task.priority === filterPriority;
    return matchSearch && matchCategory && matchPriority;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.filter((t) => !t.completed).length,
    high: tasks.filter((t) => t.priority === "High" && !t.completed).length,
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-blue-50 via-white to-cyan-50"
      }`}
    >
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1
              className={`text-4xl sm:text-5xl font-bold mb-2 ${
                darkMode
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
              }`}
            >
              ToDo List App
            </h1>
            <p
              className={`text-sm ${
                darkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Organize, prioritize, and accomplish your goals
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowStats(!showStats)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                darkMode
                  ? "bg-slate-700 hover:bg-slate-600 text-white"
                  : "bg-white hover:bg-slate-50 text-slate-700 shadow-md"
              }`}
            >
              <PieChart className="inline-block mr-2 h-5 w-5" />
              Stats
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-lg font-medium transition-all ${
                darkMode
                  ? "bg-slate-700 hover:bg-slate-600 text-yellow-400"
                  : "bg-white hover:bg-slate-50 text-slate-700 shadow-md"
              }`}
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {showStats && (
          <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              className={`p-4 rounded-xl ${
                darkMode ? "bg-slate-800" : "bg-white shadow-md"
              }`}
            >
              <div className="text-2xl font-bold text-blue-500">
                {stats.total}
              </div>
              <div
                className={`text-sm ${
                  darkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Total Tasks
              </div>
            </div>
            <div
              className={`p-4 rounded-xl ${
                darkMode ? "bg-slate-800" : "bg-white shadow-md"
              }`}
            >
              <div className="text-2xl font-bold text-emerald-500">
                {stats.completed}
              </div>
              <div
                className={`text-sm ${
                  darkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Completed
              </div>
            </div>
            <div
              className={`p-4 rounded-xl ${
                darkMode ? "bg-slate-800" : "bg-white shadow-md"
              }`}
            >
              <div className="text-2xl font-bold text-amber-500">
                {stats.pending}
              </div>
              <div
                className={`text-sm ${
                  darkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Pending
              </div>
            </div>
            <div
              className={`p-4 rounded-xl ${
                darkMode ? "bg-slate-800" : "bg-white shadow-md"
              }`}
            >
              <div className="text-2xl font-bold text-red-500">
                {stats.high}
              </div>
              <div
                className={`text-sm ${
                  darkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                High Priority
              </div>
            </div>
          </div>
        )}

        <div
          className={`p-6 rounded-2xl mb-6 shadow-xl ${
            darkMode ? "bg-slate-800" : "bg-white"
          }`}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                onKeyPress={handleKeyPress}
                type="text"
                placeholder="What needs to be done?"
                className={`flex-1 px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  darkMode
                    ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500"
                }`}
              />
              <button
                onClick={addTask}
                disabled={!taskText.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="inline-block mr-2 h-5 w-5" />
                Add Task
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              >
                <option>Work</option>
                <option>Personal</option>
                <option>School</option>
              </select>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={`px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>
        </div>

        <div
          className={`p-6 rounded-2xl mb-6 shadow-xl ${
            darkMode ? "bg-slate-800" : "bg-white"
          }`}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? "text-slate-400" : "text-slate-400"
                } h-5 w-5`}
              />
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500"
                }`}
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? "bg-slate-700 border-slate-600 text-white"
                  : "bg-slate-50 border-slate-200 text-slate-900"
              }`}
            >
              <option value="All">All Categories</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="School">School</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className={`px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? "bg-slate-700 border-slate-600 text-white"
                  : "bg-slate-50 border-slate-200 text-slate-900"
              }`}
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          {stats.completed > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearCompleted}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  darkMode
                    ? "bg-slate-700 hover:bg-slate-600 text-slate-300"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <CheckCheck className="inline-block mr-2 h-5 w-5" />
                Clear Completed
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div
              className={`p-12 rounded-2xl text-center ${
                darkMode ? "bg-slate-800" : "bg-white shadow-md"
              }`}
            >
              <ClipboardList
                className={`inline-block text-6xl mb-4 ${
                  darkMode ? "text-slate-600" : "text-slate-300"
                }`}
              />
              <p
                className={`text-xl ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {search || filterCategory !== "All" || filterPriority !== "All"
                  ? "No tasks match your filters"
                  : "No tasks yet. Add one to get started!"}
              </p>
            </div>
          ) : (
            filteredTasks.map((task, index) => {
              const CategoryIcon = getCategoryIcon(task.category);
              return (
                <div
                  key={task.id}
                  draggable={editingTaskId !== task.id}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`p-5 rounded-xl shadow-lg transition-all duration-200 cursor-move hover:shadow-xl ${
                    darkMode ? "bg-slate-800" : "bg-white"
                  } ${task.completed ? "opacity-60" : ""} ${
                    draggedIndex === index ? "scale-105" : ""
                  }`}
                >
                  {editingTaskId === task.id ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyPress={(e) => handleEditKeyPress(e, task.id)}
                          type="text"
                          placeholder="Edit task..."
                          className={`flex-1 px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                            darkMode
                              ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                              : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500"
                          }`}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(task.id)}
                            disabled={!editText.trim()}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              darkMode
                                ? "bg-slate-700 hover:bg-slate-600 text-slate-300"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            }`}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className={`px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode
                              ? "bg-slate-700 border-slate-600 text-white"
                              : "bg-slate-50 border-slate-200 text-slate-900"
                          }`}
                        >
                          <option>Work</option>
                          <option>Personal</option>
                          <option>School</option>
                        </select>
                        <select
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value)}
                          className={`px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode
                              ? "bg-slate-700 border-slate-600 text-white"
                              : "bg-slate-50 border-slate-200 text-slate-900"
                          }`}
                        >
                          <option>High</option>
                          <option>Medium</option>
                          <option>Low</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="mt-1 h-5 w-5 rounded border-2 text-blue-500 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-lg font-medium mb-2 break-words ${
                            task.completed ? "line-through" : ""
                          } ${darkMode ? "text-white" : "text-slate-900"}`}
                        >
                          {task.text}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              darkMode
                                ? "bg-slate-700 text-slate-300"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            <CategoryIcon className="inline-block mr-2 h-4 w-4" />
                            {task.category}
                          </span>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            <Flag className="inline-block mr-2 h-4 w-4" />
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditing(task)}
                          className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div
          className={`mt-8 text-center text-sm ${
            darkMode ? "text-slate-500" : "text-slate-400"
          }`}
        >
          <p>
            <Lightbulb className="inline-block mr-2 h-5 w-5" />
            Tip: Drag and drop tasks to reorder them
          </p>
        </div>
      </div>
    </div>
  );
}