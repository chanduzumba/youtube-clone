import { useState } from "react";
import {
  HiBars3,
  HiMagnifyingGlass,
  HiMicrophone,
  HiVideoCamera,
  HiBell,
  HiUserCircle,
} from "react-icons/hi2";
import { FaRegUserCircle  } from "react-icons/fa";
import { HiEllipsisVertical } from 'react-icons/hi2';
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toggleSidebar } from "../redux/sidebarSlice";
import { Link } from "react-router-dom";
import SignInButton from "./SignInButton";

const YouTubeLogo = () => (
  // Renders the YouTube brand logo shown in the top header
  <div className="flex items-center justify-items-start select-none">
    <svg viewBox="0 0 30 20" className="mr-0 h-5" aria-hidden="true">
      <path
        d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 0 14.285 0 14.285 0C14.285 0 5.35042 0 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C0 5.35042 0 10 0 10C0 10 0 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z"
        fill="#FF0000"
      />
      <path
        d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z"
        fill="white"
      />
    </svg>
    <span className="text-[1.35rem] ml-0 font-medium tracking-tight text-[#0f0f0f]">
      YouTube
      <span className="align-top text-[0.55rem] font-normal ml-0.5">IN</span>
    </span>
  </div>
);

export default function Header() {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();

  // Handles the search form submission without reloading the page
  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    // Top header with menu, search, and action buttons for the app shell
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between bg-white px-4">
      <div className="flex min-w-[170px] items-center gap-4">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="rounded-full p-2 transition hover:bg-black/5"
          aria-label="Menu"
        >
          <HiBars3 className="h-6 w-6 text-[#0f0f0f]" />
        </button>
        <a href="/">
          <YouTubeLogo />
        </a>
      </div>

      <div className="mx-4 hidden max-w-[720px] flex-1 justify-center sm:flex">
        <form onSubmit={handleSearch} className="flex w-full">
          <div className="flex h-10 flex-1 items-center rounded-l-full border border-[#ccc] pl-4 pr-2 focus-within:border-[#1c62b9] focus-within:shadow-[inset_0_0_0_1px_#1c62b9]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search"
              className="w-full text-[16px] outline-none placeholder:text-[#606060]"
            />
          </div>
          <button
            type="submit"
            className="flex h-10 w-16 items-center justify-center rounded-r-full border border-l-0 border-[#ccc] bg-[#f8f8f8] hover:bg-[#f0f0f0]"
            aria-label="Search"
          >
            <HiMagnifyingGlass className="h-5 w-5 text-[#0f0f0f]" />
          </button>
        </form>
        <button
          className="ml-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f8f8] hover:bg-[#f0f0f0]"
          aria-label="Search with voice"
        >
          <HiMicrophone className="h-5 w-5" />
        </button>
      </div>

      {/* <div className="flex min-w-42.5 items-center justify-end gap-2">
        <button
          className="rounded-full p-2 hover:bg-black/5"
          aria-label="Create"
        >
          <HiVideoCamera className="h-6 w-6 text-[#0f0f0f]" />
        </button>
        <button
          className="rounded-full p-2 hover:bg-black/5"
          aria-label="Notifications"
        >
          <HiBell className="h-6 w-6 text-[#0f0f0f]" />
        </button>
        <button
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-sm font-medium text-white"
          aria-label="Account"
        >
          C
        </button>
      </div> */}
      <div className="flex min-w-42.5 items-center justify-end gap-2">
         <button className="signin-btn px-3 py-1.5 flex items-center gap-2 font-black transition-colors duration-200 cursor-pointer">
          <HiEllipsisVertical  className="text-xl" />
        </button>
        <SignInButton />
      </div>
    </header>
  );
}
