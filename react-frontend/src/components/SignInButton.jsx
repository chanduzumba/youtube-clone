import { FaRegUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SignInButton = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/login")}
      className="signin-btn flex items-center text-blue-500 gap-2 rounded-2xl border border-[#e5e5e5] px-3 py-1.5 text-sm font-medium transition-colors duration-200"
    >
      <FaRegUserCircle className="text-xl" />
      Sign in
    </button>
  );
};

export default SignInButton;