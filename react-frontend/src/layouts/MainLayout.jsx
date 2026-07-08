import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Header from "../components/Header.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { toggleSidebar } from "../redux/sidebarSlice";

const MainLayout = () => {
  // Keep the app shell light so icons and text stay clearly visible
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  return (
    <div className="min-h-screen bg-white text-zinc-900">
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