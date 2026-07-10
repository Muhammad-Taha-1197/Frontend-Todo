/**
 * Redux Store Configuration
 * ---------------------------
 * Central Redux store for the entire application.
 * Uses Redux Toolkit's configureStore for simplified setup.
 *
 * The store holds all application state and provides it to
 * React components via the <Provider> wrapper in main.jsx.
 */

import { configureStore } from "@reduxjs/toolkit";
import todoReducer from "../features/todos/todoSlice";

/**
 * Configure and export the Redux store
 *
 * reducer: An object mapping slice names to their reducers.
 *          Each key becomes a top-level key in the state tree.
 *          - state.todos → managed by todoReducer
 */
const store = configureStore({
  reducer: {
    todos: todoReducer, // All todo-related state lives under state.todos
  },
});

export default store;
