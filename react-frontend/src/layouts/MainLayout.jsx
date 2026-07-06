import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Header from "../components/Header.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { toggleSidebar } from "../redux/sidebarSlice";

const MainLayout = () => {
  // Use the shared theme state for layout colors
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  // Use the sidebar open state from Redux to adjust the main content padding
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  return (
    <div className={`min-h-screen ${isDark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}>
      <Header />
      <Sidebar />

      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      <main className={`pt-14 pl-0 transition-all duration-150 ${isOpen ? "md:pl-[240px]" : "md:pl-[72px]"}`}>
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;