import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    // Layout wrapper for authentication-related pages
    <div>
      {/* Renders the matched authentication route (e.g. Login, Register) */}
      <Outlet />
    </div>
  );
};

export default AuthLayout;