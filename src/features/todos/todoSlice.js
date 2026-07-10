/**
 * Todo Slice (Redux Toolkit)
 * ----------------------------
 * This slice manages all todo-related state in the Redux store.
 * It uses createAsyncThunk for handling async API calls to the backend,
 * and createSlice for defining reducers and actions.
 *
 * State Shape:
 *   {
 *     items:   Todo[],    // Array of todo objects from the API
 *     loading: boolean,   // True while any async operation is in progress
 *     error:   string|null // Error message if the last operation failed
 *   }
 *
 * Async Thunks (API calls):
 *   - fetchTodos:  GET    /api/todos       → Load all todos
 *   - addTodo:     POST   /api/todos       → Create a new todo
 *   - updateTodo:  PUT    /api/todos/:id   → Update title/completed
 *   - deleteTodo:  DELETE /api/todos/:id   → Remove a todo
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ============================================================
// API Base URL — points to our Express backend
// ============================================================
const API_URL = import.meta.env.VITE_API_URL || "https://api-backend-07.netlify.app/api/todos";

// ============================================================
// Async Thunks — Handle API communication
// ============================================================

/**
 * fetchTodos
 * Fetches all todos from the backend API.
 * Dispatches pending/fulfilled/rejected actions automatically.
 */
export const fetchTodos = createAsyncThunk(
  "todos/fetchTodos", // Action type prefix
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data.data; // Extract the todos array from API response
    } catch (error) {
      // Return a meaningful error message to the rejected action
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch todos"
      );
    }
  }
);

/**
 * addTodo
 * Creates a new todo by sending the title to the backend.
 * @param {string} title - The title text for the new todo
 */
export const addTodo = createAsyncThunk(
  "todos/addTodo",
  async (title, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, { title });
      return response.data.data; // Return the newly created todo object
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add todo"
      );
    }
  }
);

/**
 * updateTodo
 * Updates an existing todo's title and/or completed status.
 * @param {Object} param - { id, title?, completed? }
 */
export const updateTodo = createAsyncThunk(
  "todos/updateTodo",
  async ({ id, ...updateData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, updateData);
      return response.data.data; // Return the updated todo object
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update todo"
      );
    }
  }
);

/**
 * deleteTodo
 * Permanently removes a todo from the database.
 * @param {string} id - The MongoDB _id of the todo to delete
 */
export const deleteTodo = createAsyncThunk(
  "todos/deleteTodo",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id; // Return the deleted ID so we can remove it from state
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete todo"
      );
    }
  }
);

// ============================================================
// Slice Definition — State, Reducers, Extra Reducers
// ============================================================

/**
 * Initial state for the todos slice
 */
const initialState = {
  items: [],      // Array of todo objects
  loading: false, // Loading indicator for async operations
  error: null,    // Error message string or null
};

const todoSlice = createSlice({
  name: "todos", // Slice name — used as prefix for action types

  initialState,

  /**
   * Regular (synchronous) reducers
   * These handle local state updates that don't require API calls.
   */
  reducers: {
    /**
     * clearError
     * Resets the error state back to null.
     * Useful after displaying an error message to the user.
     */
    clearError: (state) => {
      state.error = null;
    },
  },

  /**
   * Extra Reducers
   * Handle the pending/fulfilled/rejected states of our async thunks.
   * Redux Toolkit uses Immer under the hood, so we can write "mutating"
   * code that actually produces immutable updates.
   */
  extraReducers: (builder) => {
    // ==========================
    // FETCH TODOS
    // ==========================
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;  // Show loading spinner
        state.error = null;    // Clear any previous errors
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;         // Hide loading spinner
        state.items = action.payload;  // Replace items with fetched data
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;         // Hide loading spinner
        state.error = action.payload;  // Store the error message
      })

      // ==========================
      // ADD TODO
      // ==========================
      .addCase(addTodo.pending, (state) => {
        state.error = null; // Clear errors when starting a new operation
      })
      .addCase(addTodo.fulfilled, (state, action) => {
        // Add the new todo to the BEGINNING of the array (newest first)
        state.items.unshift(action.payload);
      })
      .addCase(addTodo.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ==========================
      // UPDATE TODO
      // ==========================
      .addCase(updateTodo.pending, (state) => {
        state.error = null;
      })
      .addCase(updateTodo.fulfilled, (state, action) => {
        // Find the todo in the array and replace it with the updated version
        const index = state.items.findIndex(
          (todo) => todo._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateTodo.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ==========================
      // DELETE TODO
      // ==========================
      .addCase(deleteTodo.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteTodo.fulfilled, (state, action) => {
        // Remove the deleted todo from the array by filtering it out
        state.items = state.items.filter(
          (todo) => todo._id !== action.payload
        );
      })
      .addCase(deleteTodo.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

// Export the synchronous action creators
export const { clearError } = todoSlice.actions;

// Export the reducer to be used in the store
export default todoSlice.reducer;
