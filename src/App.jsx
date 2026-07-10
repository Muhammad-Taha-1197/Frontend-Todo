/**
 * App Component — Main Todo Application
 * ----------------------------------------
 * This is the root component that renders the entire Todo UI.
 * It connects to the Redux store to manage todo state and
 * dispatches async thunks for all CRUD operations.
 *
 * Features:
 *   - Add new todos with a form
 *   - Toggle todo completion status (checkbox)
 *   - Edit todo titles inline
 *   - Delete todos
 *   - Filter todos (All / Active / Completed)
 *   - Stats display (total & completed counts)
 *   - Loading & error states
 */

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  clearError,
} from "./features/todos/todoSlice";
import { FiEdit2, FiTrash2, FiCheck, FiX, FiPlus, FiAlertCircle } from "react-icons/fi";

export const App = () => {
  // ============================================================
  // Redux State & Dispatch
  // ============================================================

  /** Access the Redux dispatch function to send actions */
  const dispatch = useDispatch();

  /** Select todo state from the Redux store */
  const { items: todos, loading, error } = useSelector((state) => state.todos);

  // ============================================================
  // Local Component State
  // ============================================================

  /** Input value for the "add todo" form */
  const [newTitle, setNewTitle] = useState("");

  /** Currently active filter: "all", "active", or "completed" */
  const [filter, setFilter] = useState("all");

  /** ID of the todo being edited (null when not editing) */
  const [editingId, setEditingId] = useState(null);

  /** Current text in the edit input field */
  const [editTitle, setEditTitle] = useState("");

  // ============================================================
  // Effects
  // ============================================================

  /**
   * Fetch all todos from the API when the component mounts.
   * This runs once on initial render.
   */
  useEffect(() => {
    dispatch(fetchTodos());
  }, [dispatch]);

  // ============================================================
  // Computed Values
  // ============================================================

  /**
   * Filter the todos array based on the active filter tab.
   * - "all":       Show every todo
   * - "active":    Show only incomplete todos
   * - "completed": Show only completed todos
   */
  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true; // "all" — show everything
  });

  /** Count of completed todos for the stats display */
  const completedCount = todos.filter((t) => t.completed).length;

  // ============================================================
  // Event Handlers
  // ============================================================

  /**
   * Handle adding a new todo.
   * Validates input is not empty, dispatches addTodo thunk,
   * and clears the input field on success.
   */
  const handleAddTodo = async (e) => {
    e.preventDefault(); // Prevent page reload on form submit

    // Don't submit if the input is empty or only whitespace
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    // Dispatch the async thunk to create the todo
    const result = await dispatch(addTodo(trimmed));

    // Clear the input only if the creation was successful
    if (!result.error) {
      setNewTitle("");
    }
  };

  /**
   * Handle toggling a todo's completed status.
   * Dispatches updateTodo with the opposite boolean value.
   */
  const handleToggleComplete = (todo) => {
    dispatch(
      updateTodo({
        id: todo._id,
        completed: !todo.completed, // Flip the completed flag
      })
    );
  };

  /**
   * Enter edit mode for a specific todo.
   * Sets the editing ID and pre-fills the edit input with the current title.
   */
  const handleStartEdit = (todo) => {
    setEditingId(todo._id);
    setEditTitle(todo.title);
  };

  /**
   * Cancel editing and exit edit mode.
   */
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  /**
   * Save the edited title.
   * Validates the new title, dispatches updateTodo, and exits edit mode.
   */
  const handleSaveEdit = async (id) => {
    const trimmed = editTitle.trim();
    if (!trimmed) return; // Don't save empty titles

    const result = await dispatch(updateTodo({ id, title: trimmed }));

    // Exit edit mode only if the update succeeded
    if (!result.error) {
      setEditingId(null);
      setEditTitle("");
    }
  };

  /**
   * Handle deleting a todo.
   * Dispatches the deleteTodo thunk with the todo's ID.
   */
  const handleDeleteTodo = (id) => {
    dispatch(deleteTodo(id));
  };

  /**
   * Format a date string into a human-readable format.
   * Example: "Jul 10, 2026 at 4:30 PM"
   */
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="app-container">
      {/* ============================
          Header Section
          ============================ */}
      <header className="app-header">
        <h1 className="app-title">TaskFlow</h1>
        <p className="app-subtitle">Organize your day, one task at a time</p>

        {/* Stats: Total and Completed counts */}
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-number">{todos.length}</span>
            <span>Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-number completed">{completedCount}</span>
            <span>Completed</span>
          </div>
        </div>
      </header>

      {/* ============================
          Error Banner
          Shows when an API error occurs
          ============================ */}
      {error && (
        <div className="error-banner" role="alert">
          <FiAlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => dispatch(clearError())} aria-label="Dismiss error">
            <FiX />
          </button>
        </div>
      )}

      {/* ============================
          Add Todo Form
          ============================ */}
      <form className="add-form" onSubmit={handleAddTodo} id="add-todo-form">
        <input
          id="add-todo-input"
          type="text"
          className="add-input"
          placeholder="What needs to be done?"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          maxLength={200}
          autoComplete="off"
        />
        <button
          id="add-todo-btn"
          type="submit"
          className="add-btn"
          disabled={!newTitle.trim()}
        >
          <FiPlus style={{ marginRight: 6, verticalAlign: "middle" }} />
          Add Task
        </button>
      </form>

      {/* ============================
          Filter Tabs
          ============================ */}
      <div className="filter-tabs" role="tablist">
        {["all", "active", "completed"].map((tab) => (
          <button
            key={tab}
            id={`filter-${tab}`}
            className={`filter-tab ${filter === tab ? "active" : ""}`}
            onClick={() => setFilter(tab)}
            role="tab"
            aria-selected={filter === tab}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {/* Show count badge */}
            {tab === "all" && ` (${todos.length})`}
            {tab === "active" && ` (${todos.length - completedCount})`}
            {tab === "completed" && ` (${completedCount})`}
          </button>
        ))}
      </div>

      {/* ============================
          Todo List
          ============================ */}
      {loading ? (
        /* Loading State */
        <div className="loading-state">
          <div className="spinner" />
          <span className="loading-text">Loading your tasks...</span>
        </div>
      ) : filteredTodos.length === 0 ? (
        /* Empty State */
        <div className="empty-state">
          <div className="empty-icon">
            {filter === "completed" ? "🎉" : filter === "active" ? "✅" : "📝"}
          </div>
          <h3 className="empty-title">
            {filter === "completed"
              ? "No completed tasks yet"
              : filter === "active"
              ? "All tasks are done!"
              : "No tasks yet"}
          </h3>
          <p className="empty-text">
            {filter === "all"
              ? "Add your first task above to get started"
              : filter === "active"
              ? "Great job! Everything is done"
              : "Complete a task to see it here"}
          </p>
        </div>
      ) : (
        /* Todo Items */
        <div className="todo-list">
          {filteredTodos.map((todo, index) => (
            <div
              key={todo._id}
              className="todo-item todo-enter"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Checkbox — toggles completed status */}
              <div
                className={`todo-checkbox ${todo.completed ? "checked" : ""}`}
                onClick={() => handleToggleComplete(todo)}
                role="checkbox"
                aria-checked={todo.completed}
                aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
              >
                {todo.completed && <FiCheck size={14} />}
              </div>

              {/* Conditional render: Edit mode or Display mode */}
              {editingId === todo._id ? (
                /* ---- Edit Mode ---- */
                <form
                  className="edit-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveEdit(todo._id);
                  }}
                >
                  <input
                    className="edit-input"
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    maxLength={200}
                    autoFocus
                  />
                  <button type="submit" className="edit-btn save" aria-label="Save edit">
                    Save
                  </button>
                  <button
                    type="button"
                    className="edit-btn cancel"
                    onClick={handleCancelEdit}
                    aria-label="Cancel edit"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                /* ---- Display Mode ---- */
                <>
                  <div className="todo-content">
                    <p className={`todo-title ${todo.completed ? "completed" : ""}`}>
                      {todo.title}
                    </p>
                    <p className="todo-date">{formatDate(todo.createdAt)}</p>
                  </div>

                  {/* Action buttons: Edit & Delete */}
                  <div className="todo-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => handleStartEdit(todo)}
                      aria-label={`Edit "${todo.title}"`}
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteTodo(todo._id)}
                      aria-label={`Delete "${todo.title}"`}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
