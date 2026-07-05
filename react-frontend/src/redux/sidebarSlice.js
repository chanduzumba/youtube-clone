import { createSlice } from "@reduxjs/toolkit";

// Simple slice to control the sidebar open state
const sidebarSlice = createSlice({
  name: "sidebar",
  initialState: {
    isOpen: true,
  },
  reducers: {
    // Toggles the sidebar between open and collapsed states
    toggleSidebar: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { toggleSidebar } = sidebarSlice.actions;
export default sidebarSlice.reducer;
