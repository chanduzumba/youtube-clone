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
  <Provider store={store}>
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </ThemeProvider>
  </Provider>
);
