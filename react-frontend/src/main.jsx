import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import router from "./routes/router.jsx";
import { store } from "./redux/store.js";

// Mount the app with Redux and theme support
createRoot(document.getElementById("root")).render(
  // Wraps the entire application with Redux store and Theme context
  <Provider store={store}>
    <ThemeProvider>
      {/* Router provider */}
      <RouterProvider router={router} />
      {/* Toaster messages */}
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </ThemeProvider>
  </Provider>
);
