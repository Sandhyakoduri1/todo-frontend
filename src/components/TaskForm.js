import React, { useEffect, useState } from "react";

function TaskForm({ onTaskAdded, onTaskUpdated, editingTask, onCancelEdit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || "");
      setDescription(editingTask.description || "");
      setPriority(editingTask.priority || "MEDIUM");
      setDueDate(editingTask.dueDate || "");
    } else {
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setDueDate("");
    }
  }, [editingTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const taskData = {
      title,
      description,
      priority,
      dueDate: dueDate || null,
    };

    try {
      let response;

      if (editingTask) {
        response = await fetch(`http://localhost:8080/tasks/${editingTask.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        });

        if (!response.ok) {
          throw new Error("Failed to update task");
        }

        const updatedTask = await response.json();
        onTaskUpdated(updatedTask);
      } else {
        response = await fetch("http://localhost:8080/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        });

        if (!response.ok) {
          throw new Error("Failed to create task");
        }

        const savedTask = await response.json();
        onTaskAdded(savedTask);
      }

      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setDueDate("");
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Could not save task");
    }
  };

  return (
    <div className="task-form">
      <h2>{editingTask ? "Edit Task" : "Add Task"}</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Enter task description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

       <div className="form-actions">
  <button type="submit">
    {editingTask ? "Update Task" : "Add Task"}
  </button>

  {editingTask && (
    <button
      type="button"
      className="cancel-btn"
      onClick={onCancelEdit}
    >
      Cancel
    </button>
  )}
</div>
        
      </form>
    </div>
  );
}

export default TaskForm;