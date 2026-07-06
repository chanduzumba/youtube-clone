import React from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SignInButton = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/auth")}
      className="signin-btn  text-blue-500 border rounded-2xl  px-3 py-1.5 flex items-center gap-2 font-medium transition-colors duration-200 cursor-pointer"
    >
      <FaRegUserCircle className="text-xl" />
      Sign in
    </button>
  );
};

export default SignInButton;