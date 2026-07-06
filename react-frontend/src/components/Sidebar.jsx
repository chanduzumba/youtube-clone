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
  HiTrophy,
  HiUserCircle,
  HiOutlineClock,
  HiMiniClock,
} from "react-icons/hi2";
import {
  MdDownload,
  MdGames,
  MdLiveTv,
  MdOutlineGamepad,
  MdOutlineLiveHelp,
  MdSubscriptions,
} from "react-icons/md";
import { SiYoutubeshorts } from "react-icons/si";
import { Link } from "react-router-dom";
import SignInButton from "./SignInButton";
import { FaGripLines } from "react-icons/fa";

const mainLinks = [
  { icon: HiHome, label: "Home", to: "/" },
  { icon: SiYoutubeshorts, label: "Shorts" },
  { icon: MdSubscriptions, label: "Subscriptions" },
  { icon: HiUserCircle, label: "You" },
  { icon: HiClock, label: "History" },
];

const subscriptions = [{ icon: HiUserCircle, label: "Channel 1" }];

const libraryLinks = [
  { icon: HiRectangleStack, label: "Your Channel", to: "/profile" },
  { icon: HiMiniClock, label: "History" },
  { icon: FaGripLines, label: "Playlists" },
  { icon: HiOutlineClock, label: "Watch Later" },
  { icon: HiHandThumbUp, label: "Liked videos" },
  { icon: HiTv, label: "Your videos" },
  { icon: MdDownload, label: "Downloads" },
];

const exploreLinks = [
  { icon: HiShoppingBag, label: "Shopping" },
  { icon: HiMusicalNote, label: "Music" },
  { icon: HiFilm, label: "Movies" },
  { icon: MdOutlineLiveHelp, label: "Live" },
  { icon: MdOutlineGamepad, label: "Gaming" },
];

function SidebarRow({ icon: Icon, label, mini, to }) {
  // Renders one sidebar entry with an icon and label
  return (
    <Link
      to={to}
      className={`flex w-full items-center gap-5 rounded-lg text-left transition hover:bg-black/5 ${
        mini
          ? "flex-col gap-1 px-1 py-4 text-[10px]"
          : "px-3 py-2.5 text-[14px]"
      }`}
    >
      <Icon className="h-6 w-6" />
      <span className={mini ? "" : "font-normal text-[#0f0f0f]"}>{label}</span>
    </Link>
  );
}

function Section({ title, links, mini }) {
  // Groups related sidebar items into a section block
  if (mini) {
    return (
      <div className="flex flex-col items-center">
        {links.map((link) => (
          <SidebarRow key={link.label} {...link} mini />
        ))}
      </div>
    );
  }
  if (title === "Guest") {
    return (
      <div className="border-b border-[#e5e5e5] p-4">
        <small>Sign in to like videos, comment, and subscribe.</small>
        <SignInButton />
      </div>
    );
  }
  if (title === "Footer") {
    return (
      <div className="border-b border-[#e5e5e5] p-4 font-bold text-xs text-gray-500">
          <div className="p-2">About Press Copyright Contact us Creators Advertise Developers</div>
          <div className="p-2">Terms Privacy Policy & Safety How YouTube works Test new features</div>
          <div className="p-2 text-gray-400">© 2026 Google LLC</div>
      </div>
    );
  }
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
  // Reads the sidebar open state from Redux so the layout can expand or collapse
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  return (
    <aside
      className={`fixed bottom-0 left-0 top-14 z-40 overflow-y-auto bg-white shadow-lg transition-all duration-200 md:shadow-none ${
        isOpen
          ? "w-60 translate-x-0 px-1"
          : "w-60 -translate-x-full px-1 md:w-[72px] md:translate-x-0"
      }`}
    >
      {isOpen ? (
        <>
          <Section links={mainLinks} />
          <Section title="Subscriptions   >" links={subscriptions} />
          <Section title="You   >" links={libraryLinks} />
          <Section title="Guest" />
          <Section title="Explore" links={exploreLinks} />
          <Section title="Footer" />
        </>
      ) : (
        <div className="md:block">
          <Section links={mainLinks} mini />
        </div>
      )}
    </aside>
  );
}
