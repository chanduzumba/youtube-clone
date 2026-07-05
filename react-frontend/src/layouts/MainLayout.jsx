import { Outlet } from "react-router-dom";
import Header from "../components/Header.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const MainLayout = () => {
  // Use the shared theme state for layout colors
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen ${isDark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}>
      <Header />
      <Sidebar />

      <main className="pt-14 pl-0 md:pl-[72px]">
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;