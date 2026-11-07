"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "task-manager-tasks";

export default function Home() {
  // These states control the task list, form and selected filter.
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved tasks when the page opens.
  useEffect(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEY);

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }

    setIsLoaded(true);
  }, []);

  // Save tasks whenever the list changes.
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  // Add a new task to the list.
  function handleAddTask(event) {
    event.preventDefault();

    const cleanTitle = taskTitle.trim();

    if (cleanTitle === "") {
      return;
    }

    const newTask = {
      id: Date.now(),
      title: cleanTitle,
      completed: false,
    };

    setTasks([...tasks, newTask]);
    setTaskTitle("");
  }

  // Change a task between completed and pending.
  function handleToggleTask(taskId) {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, completed: !task.completed };
      }

      return task;
    });

    setTasks(updatedTasks);
  }

  // Start editing a task and put its current title in the input.
  function handleStartEdit(task) {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
  }

  // Save the updated task title.
  function handleSaveEdit(taskId) {
    const cleanTitle = editTitle.trim();

    if (cleanTitle === "") {
      return;
    }

    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, title: cleanTitle };
      }

      return task;
    });

    setTasks(updatedTasks);
    setEditingTaskId(null);
    setEditTitle("");
  }

  // Stop editing without saving changes.
  function handleCancelEdit() {
    setEditingTaskId(null);
    setEditTitle("");
  }

  // Remove one task from the list.
  function handleDeleteTask(taskId) {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
  }

  // Remove every completed task.
  function handleClearCompleted() {
    const pendingTasks = tasks.filter((task) => !task.completed);
    setTasks(pendingTasks);
  }

  // Apply the selected filter and search text.
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(search.toLowerCase());

    if (filter === "pending") {
      return !task.completed && matchesSearch;
    }

    if (filter === "completed") {
      return task.completed && matchesSearch;
    }

    return matchesSearch;
  });

  const completedCount = tasks.filter((task) => task.completed).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <main className="page">
      <section className="task-card">
        <header className="header">
          <div>
            <p className="eyebrow">MY WORKSPACE</p>
            <h1>Task Manager</h1>
            <p className="subtitle">Keep your day organized, one task at a time.</p>
          </div>
          <div className="task-total">
            <span>{tasks.length}</span>
            <small>total tasks</small>
          </div>
        </header>

        <form className="task-form" onSubmit={handleAddTask}>
          <input
            type="text"
            value={taskTitle}
            onChange={(event) => setTaskTitle(event.target.value)}
            placeholder="What do you need to do?"
            aria-label="New task"
            maxLength={100}
          />
          <button type="submit">Add task</button>
        </form>

        <section className="summary" aria-label="Task summary">
          <div className="summary-item">
            <span className="summary-number">{pendingCount}</span>
            <span className="summary-label">Pending</span>
          </div>
          <div className="summary-item">
            <span className="summary-number">{completedCount}</span>
            <span className="summary-label">Completed</span>
          </div>
        </section>

        <div className="tools">
          <input
            className="search-input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks..."
            aria-label="Search tasks"
          />

          <div className="filters" aria-label="Filter tasks">
            <button
              type="button"
              className={filter === "all" ? "filter-button active" : "filter-button"}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={filter === "pending" ? "filter-button active" : "filter-button"}
              onClick={() => setFilter("pending")}
            >
              Pending
            </button>
            <button
              type="button"
              className={filter === "completed" ? "filter-button active" : "filter-button"}
              onClick={() => setFilter("completed")}
            >
              Completed
            </button>
          </div>
        </div>

        <section className="task-list" aria-label="Task list">
          {!isLoaded ? (
            <p className="empty-message">Loading tasks...</p>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">✓</span>
              <p>No tasks found.</p>
              <small>Add a task or change your search and filter.</small>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <article className="task-item" key={task.id}>
                {editingTaskId === task.id ? (
                  <div className="edit-area">
                    <input
                      className="edit-input"
                      type="text"
                      value={editTitle}
                      onChange={(event) => setEditTitle(event.target.value)}
                      aria-label="Edit task title"
                      maxLength={100}
                    />
                    <button
                      type="button"
                      className="save-button"
                      onClick={() => handleSaveEdit(task.id)}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <label className="task-label">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task.id)}
                      />
                      <span className={task.completed ? "task-title completed" : "task-title"}>
                        {task.title}
                      </span>
                    </label>

                    <div className="task-actions">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => handleStartEdit(task)}
                        disabled={task.completed}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDeleteTask(task.id)}
                        aria-label={`Delete ${task.title}`}
                        title="Delete task"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))
          )}
        </section>

        <footer className="footer">
          <span>{pendingCount} task(s) left to do</span>
          <button
            type="button"
            className="clear-button"
            onClick={handleClearCompleted}
            disabled={completedCount === 0}
          >
            Clear completed
          </button>
        </footer>
      </section>

      <p className="page-note">Your tasks are saved in this browser.</p>
    </main>
  );
}
