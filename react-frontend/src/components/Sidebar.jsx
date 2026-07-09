import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  HiHome,
  HiRectangleStack,
  HiTv,
  HiClock,
  HiHandThumbUp,
  HiFilm,
  HiShoppingBag,
  HiMusicalNote,
  HiUserCircle,
  HiOutlineClock,
  HiMiniClock,
} from "react-icons/hi2";
import {
  MdDownload,
  MdOutlineGamepad,
  MdOutlineLiveHelp,
  MdSubscriptions,
} from "react-icons/md";
import { SiYoutubeshorts } from "react-icons/si";
import { Link } from "react-router-dom";
import SignInButton from "./SignInButton";
import { FaGripLines } from "react-icons/fa";

// Primary navigation links shown in the sidebar
const mainLinks = [
  { icon: HiHome, label: "Home", to: "/" },
  { icon: SiYoutubeshorts, label: "Shorts" },
  { icon: MdSubscriptions, label: "Subscriptions" },
  { icon: HiUserCircle, label: "You" },
  { icon: HiClock, label: "History" },
];

// Sample subscription data (can later be replaced with API data)
const subscriptions = [{ icon: HiUserCircle, label: "Channel 1" }];

// Library-related navigation links for authenticated users
const libraryLinks = [
  { icon: HiRectangleStack, label: "Your Channel", to: "/profile" },
  { icon: HiMiniClock, label: "History" },
  { icon: FaGripLines, label: "Playlists" },
  { icon: HiOutlineClock, label: "Watch Later" },
  { icon: HiHandThumbUp, label: "Liked videos" },
  { icon: HiTv, label: "Your videos" },
  { icon: MdDownload, label: "Downloads" },
];

// Explore section links
const exploreLinks = [
  { icon: HiShoppingBag, label: "Shopping" },
  { icon: HiMusicalNote, label: "Music" },
  { icon: HiFilm, label: "Movies" },
  { icon: MdOutlineLiveHelp, label: "Live" },
  { icon: MdOutlineGamepad, label: "Gaming" },
];

function SidebarRow({ icon: Icon, label, mini, to }) {
  // Renders a single navigation item in either expanded or collapsed view
  return (
    <Link
      to={to}
      className={`flex w-full items-center gap-5 rounded-lg text-left transition hover:bg-black/5 ${
        mini
          ? "flex-col gap-1 px-1 py-4 text-[10px]"
          : "px-3 py-2.5 text-[14px]"
      }`}
    >
      <Icon className="h-6 w-6 text-zinc-700" />
      <span className={mini ? "text-zinc-700" : "font-normal text-zinc-700"}>
        {label}
      </span>
    </Link>
  );
}

function Section({ title, links, mini, isLoggedIn = false }) {
  // Render compact sidebar when the sidebar is collapsed
  if (mini) {
    return (
      <div className="flex flex-col items-center">
        {links.map((link) => (
          <SidebarRow key={link.label} {...link} mini />
        ))}
      </div>
    );
  }

  // Guest section prompting users to sign in
  if (title === "Guest") {
    if (isLoggedIn) return null;

    return (
      <div className="border-b border-[#e5e5e5] p-4">
        <small>Sign in to like videos, comment, and subscribe.</small>
        <SignInButton />
      </div>
    );
  }

  // Footer section containing YouTube informational links
  if (title === "Footer") {
    return (
      <div className="border-b border-[#e5e5e5] p-4 font-bold text-xs text-gray-500">
        <div className="p-2">
          About Press Copyright Contact us Creators Advertise Developers
        </div>
        <div className="p-2">
          Terms Privacy Policy & Safety How YouTube works Test new features
        </div>
        <div className="p-2 text-gray-400">© 2026 Google LLC</div>
      </div>
    );
  }

  // Standard sidebar section with an optional title
  return (
    <div className="border-b border-[#e5e5e5] py-2">
      {title && (
        <h3 className="px-3 pb-1 pt-2 text-[16px] font-medium">{title}</h3>
      )}

      {links.map((link) => (
        <SidebarRow key={link.label} {...link} />
      ))}
    </div>
  );
}

export default function Sidebar() {
  // Gets the sidebar open/collapsed state from Redux
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  // Tracks whether the user is authenticated
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Updates authentication state from localStorage
  const syncAuthState = () => {
    setIsLoggedIn(Boolean(localStorage.getItem("token")));
  };

  useEffect(() => {
    // Initialize authentication state on component mount
    syncAuthState();

    // Sync authentication when localStorage changes across browser tabs
    const handleStorage = (event) => {
      if (event.key === "token" || event.key === "user") {
        syncAuthState();
      }
    };

    // Sync authentication when login/logout occurs within the same tab
    const handleAuthChange = () => syncAuthState();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("auth-state-changed", handleAuthChange);

    // Clean up event listeners to prevent memory leaks
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("auth-state-changed", handleAuthChange);
    };
  }, []);

  // Display different main navigation items depending on authentication status
  const mainSectionLinks = useMemo(() => {
    if (!isLoggedIn) return mainLinks;

    return [
      { icon: HiHome, label: "Home", to: "/" },
      { icon: SiYoutubeshorts, label: "Shorts" },
    ];
  }, [isLoggedIn]);

  return (
    // Responsive sidebar that expands or collapses based on Redux state
    <aside
      className={`fixed bottom-0 left-0 top-14 z-40 overflow-y-auto bg-white shadow-lg transition-all duration-200 md:shadow-none ${
        isOpen
          ? "w-60 translate-x-0 px-1"
          : "w-60 -translate-x-full px-1 md:w-[72px] md:translate-x-0"
      }`}
    >
      {isOpen ? (
        <>
          {/* Main navigation */}
          <Section links={mainSectionLinks} />

          {/* Show different sections depending on login status */}
          {isLoggedIn ? (
            <>
              <Section title="Subscriptions   >" links={subscriptions} />
              <Section title="You   >" links={libraryLinks} />
            </>
          ) : (
            <Section title="Guest" isLoggedIn={isLoggedIn} />
          )}

          {/* Explore and footer sections */}
          <Section title="Explore" links={exploreLinks} />
          <Section title="Footer" />
        </>
      ) : (
        // Mini sidebar shown on larger screens when collapsed
        <div className="md:block">
          <Section links={mainLinks} mini />
        </div>
      )}
    </aside>
  );
}