/**
 * Application Entry Point
 * -------------------------
 * Renders the root React component wrapped with:
 *   - StrictMode: Highlights potential problems in development
 *   - Provider:   Makes the Redux store available to all components
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./app/store";
import "./index.css";
import { App } from "./App.jsx";

/**
 * Render the application
 * The <Provider> component wraps the entire app, giving every
 * component access to the Redux store via useSelector/useDispatch hooks.
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
