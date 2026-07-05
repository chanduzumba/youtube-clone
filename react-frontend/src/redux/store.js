import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "./sidebarSlice";

// Create the Redux store for app state
export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
  },
});
