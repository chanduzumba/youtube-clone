import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <>
      {/* Navbar */}

      {/* Sidebar */}

      <main>
        <Outlet />
      </main>
    </>
  );
};

export default MainLayout;