import { useSelector } from "react-redux";
import {
  HiHome,
  HiRectangleGroup,
  HiRectangleStack,
  HiClock,
  HiHandThumbUp,
  HiFilm,
  HiFire,
  HiShoppingBag,
  HiMusicalNote,
  HiTrophy,
} from "react-icons/hi2";

const mainLinks = [
  { icon: HiHome, label: "Home" },
  { icon: HiRectangleGroup, label: "Shorts" },
  { icon: HiRectangleStack, label: "Subscriptions" },
];

const libraryLinks = [
  { icon: HiRectangleStack, label: "Library" },
  { icon: HiClock, label: "History" },
  { icon: HiHandThumbUp, label: "Liked videos" },
];

const exploreLinks = [
  { icon: HiFire, label: "Trending" },
  { icon: HiShoppingBag, label: "Shopping" },
  { icon: HiMusicalNote, label: "Music" },
  { icon: HiFilm, label: "Movies" },
  { icon: HiTrophy, label: "Sports" },
];

function SidebarRow({ icon: Icon, label, mini }) {
  // Renders one sidebar entry with an icon and label
  return (
    <button
      className={`flex w-full items-center gap-5 rounded-lg text-left transition hover:bg-black/5 ${
        mini ? "flex-col gap-1 px-1 py-4 text-[10px]" : "px-3 py-2.5 text-[14px]"
      }`}
    >
      <Icon className="h-6 w-6" />
      <span className={mini ? "" : "font-normal text-[#0f0f0f]"}>{label}</span>
    </button>
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

  return (
    <div className="border-b border-[#e5e5e5] py-2">
      {title && <h3 className="px-3 pb-1 pt-2 text-[16px] font-medium">{title}</h3>}
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
      className={`fixed bottom-0 left-0 top-14 overflow-y-auto bg-white transition-all duration-150 ${
        isOpen ? "w-60 px-1" : "w-[72px]"
      } hidden md:block`}
    >
      {isOpen ? (
        <>
          <Section links={mainLinks} />
          <Section links={libraryLinks} />
          <Section title="Explore" links={exploreLinks} />
        </>
      ) : (
        <Section links={mainLinks} mini />
      )}
    </aside>
  );
}
