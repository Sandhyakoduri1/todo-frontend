import React, { useEffect, useMemo, useState } from "react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import "./App.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [editingTask, setEditingTask] = useState(null);

  const [sortField, setSortField] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const [showOverdueBanner, setShowOverdueBanner] = useState(true);

  const tasksPerPage = 5;

  const fetchTasks = async () => {
    try {
      const response = await fetch("http://localhost:8080/tasks");
      const data = await response.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskAdded = (newTask) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
    toast.success("Task added successfully");
  };

 const handleTaskUpdated = (updatedTask) => {
  setTasks((prevTasks) =>
    prevTasks.map((task) =>
      task.id === updatedTask.id ? updatedTask : task
    )
  );
  setEditingTask(null);
  toast.info("Task updated");
};

  const handleEdit = (task) => {
    setEditingTask(task);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  const handleComplete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/tasks/${id}/complete`, {
        method: "PUT",
      });
      const updatedTask = await response.json();

      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === id ? updatedTask : task))
      );
    } catch (error) {
      console.error("Error marking task complete:", error);
    }
    toast.success("Task marked as completed");
  };

  const handlePending = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/tasks/${id}/pending`, {
        method: "PUT",
      });
      const updatedTask = await response.json();

      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === id ? updatedTask : task))
      );
    } catch (error) {
      console.error("Error marking task pending:", error);
    }
    toast.warn("Task marked as pending");
  };

 const handleDelete = async (task) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${task.title}"?`
  );

  if (!confirmed) {
    return;
  }

  try {
    await fetch(`http://localhost:8080/tasks/${task.id}`, {
      method: "DELETE",
    });

    setTasks((prevTasks) => prevTasks.filter((t) => t.id !== task.id));

    if (editingTask && editingTask.id === task.id) {
      setEditingTask(null);
    }
  } catch (error) {
    console.error("Error deleting task:", error);
  }
  toast.error("Task deleted");
};

  const dashboardStats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((task) => task.status === "PENDING").length;
    const completed = tasks.filter((task) => task.status === "COMPLETED").length;
    const highPriority = tasks.filter((task) => task.priority === "HIGH").length;

    return { total, pending, completed, highPriority };
  }, [tasks]);

  const overdueTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks.filter((task) => {
      if (!task.dueDate || task.status === "COMPLETED") return false;

      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      return dueDate < today;
    });
  }, [tasks]);

  useEffect(() => {
    if (overdueTasks.length > 0) {
      setShowOverdueBanner(true);
    }
  }, [overdueTasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ? true : task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ? true : task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchText, statusFilter, priorityFilter]);

  const sortedTasks = useMemo(() => {
    const priorityOrder = { LOW: 1, MEDIUM: 2, HIGH: 3 };

    const sorted = [...filteredTasks].sort((a, b) => {
      let valueA;
      let valueB;

      if (sortField === "title") {
        valueA = (a.title || "").toLowerCase();
        valueB = (b.title || "").toLowerCase();
      } else if (sortField === "dueDate") {
        valueA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        valueB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      } else if (sortField === "priority") {
        valueA = priorityOrder[a.priority] || 0;
        valueB = priorityOrder[b.priority] || 0;
      } else {
        valueA = "";
        valueB = "";
      }

      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredTasks, sortField, sortDirection]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, statusFilter, priorityFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedTasks.length / tasksPerPage);

  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;
    return sortedTasks.slice(startIndex, endIndex);
  }, [sortedTasks, currentPage]);

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1));
  };

  return (
    <div className="app-container">
      <h1>To-Do App</h1>

      <ToastContainer />

      {showOverdueBanner && overdueTasks.length > 0 && (
        <div className="top-alert">
          <div className="top-alert-header">
            <strong>
              Reminder: You have {overdueTasks.length} overdue task
              {overdueTasks.length > 1 ? "s" : ""}.
            </strong>
            <button
              className="close-alert-btn"
              onClick={() => setShowOverdueBanner(false)}
            >
              ×
            </button>
          </div>

          <div className="top-alert-text">
            {overdueTasks.map((task) => task.title).join(", ")}
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Total Tasks</h3>
          <p>{dashboardStats.total}</p>
        </div>

        <div className="dashboard-card">
          <h3>Pending Tasks</h3>
          <p>{dashboardStats.pending}</p>
        </div>

        <div className="dashboard-card">
          <h3>Completed Tasks</h3>
          <p>{dashboardStats.completed}</p>
        </div>

        <div className="dashboard-card">
          <h3>High Priority</h3>
          <p>{dashboardStats.highPriority}</p>
        </div>
      </div>

      <div className="top-section">
  <div className="task-form-wrapper">
    <TaskForm
      onTaskAdded={handleTaskAdded}
      onTaskUpdated={handleTaskUpdated}
      editingTask={editingTask}
      onCancelEdit={handleCancelEdit}
    />
  </div>

  <div className="filters-box compact-filters">
    <h2>Filter</h2>

    <input
      type="text"
      placeholder="Search tasks"
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
    />

    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
    >
      <option value="ALL">All Status</option>
      <option value="PENDING">Pending</option>
      <option value="COMPLETED">Completed</option>
    </select>

    <select
      value={priorityFilter}
      onChange={(e) => setPriorityFilter(e.target.value)}
    >
      <option value="ALL">All Priority</option>
      <option value="LOW">Low</option>
      <option value="MEDIUM">Medium</option>
      <option value="HIGH">High</option>
    </select>
  </div>
</div>

     <TaskList
  tasks={paginatedTasks}
  onEdit={handleEdit}
  onComplete={handleComplete}
  onPending={handlePending}
  onDelete={handleDelete}
  sortField={sortField}
  setSortField={setSortField}
  sortDirection={sortDirection}
  setSortDirection={setSortDirection}
/>

      <div className="pagination-box">
        <button onClick={goToPreviousPage} disabled={currentPage === 1}>
          Previous
        </button>

        <span>
          Page {totalPages === 0 ? 0 : currentPage} of {totalPages}
        </span>

        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default App;