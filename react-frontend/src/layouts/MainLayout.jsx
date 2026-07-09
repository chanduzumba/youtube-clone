import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Header from "../components/Header.jsx";
import Sidebar from "../components/Sidebar.jsx";
// import { useTheme } from "../context/ThemeContext.jsx";
import { toggleSidebar } from "../redux/sidebarSlice";

const MainLayout = () => {
  // Access Redux state and actions for sidebar visibility
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  return (
    // Main application layout shared across all pages
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Persistent header and sidebar */}
      <Header />
      <Sidebar />

      {/* Mobile overlay shown when the sidebar is open */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      {/* Main content area adjusts its left padding based on sidebar state */}
      <main
        className={`pt-14 pl-0 transition-all duration-150 ${
          isOpen ? "md:pl-[240px]" : "md:pl-[72px]"
        }`}
      >
        {/* Renders the matched child route */}
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;