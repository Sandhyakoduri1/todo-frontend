import React from "react";
function TaskList({
  tasks = [],
  onEdit,
  onComplete,
  onPending,
  onDelete,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection
}) {
  const getStatusClass = (status) => {
    if (status === "COMPLETED") return "badge badge-status-completed";
    return "badge badge-status-pending";
  };

  const getPriorityClass = (priority) => {
    if (priority === "HIGH") return "badge badge-priority-high";
    if (priority === "MEDIUM") return "badge badge-priority-medium";
    if (priority === "LOW") return "badge badge-priority-low";
    return "badge";
  };

  return (
    <div className="task-list">
      <div className="task-header">
  <h2>All Tasks</h2>

  <div className="sort-controls">
    <select
      value={sortField}
      onChange={(e) => setSortField(e.target.value)}
    >
      <option value="title">Title</option>
      <option value="dueDate">Due Date</option>
      <option value="priority">Priority</option>
    </select>

    <select
      value={sortDirection}
      onChange={(e) => setSortDirection(e.target.value)}
    >
      <option value="asc">Asc</option>
      <option value="desc">Desc</option>
    </select>
  </div>
</div>

      {tasks.length === 0 ? (
        <p>No matching tasks found</p>
      ) : (
        tasks.map((task) => (
          <div className="task-card" key={task.id}>
            <div className="task-header-row">
              <h3>{task.title}</h3>
            </div>

            <p>{task.description}</p>

            <p>
              <strong>Status:</strong>{" "}
              <span className={getStatusClass(task.status)}>
                {task.status}
              </span>
            </p>

            <p>
              <strong>Priority:</strong>{" "}
              <span className={getPriorityClass(task.priority)}>
                {task.priority || "N/A"}
              </span>
            </p>

            <p>
              <strong>Due Date:</strong> {task.dueDate || "N/A"}
            </p>

            <div className="button-group">
              <button onClick={() => onEdit(task)}>Edit</button>
              <button onClick={() => onComplete(task.id)}>Complete</button>
              <button onClick={() => onPending(task.id)}>Pending</button>
              <button onClick={() => onDelete(task)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default TaskList;