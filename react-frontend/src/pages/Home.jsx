import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import api from "../api/axios";
import VideoCard from "../components/VideoCard";

const categories = [
  "All",
  "Music",
  "Gaming",
  "Education",
  "Sports",
  "Technology",
  "News",
  "Entertainment",
  "Movies",
  "Comedy",
  "Lifestyle",
];

const Home = () => {
  // State variables to manage videos, loading state, error messages, selected category, and search query
  const location = useLocation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef(null);

  const scrollCategories = (direction) => {
    if (scrollRef.current) {
      const amount = 220;
      scrollRef.current.scrollBy({
        left: direction === "right" ? amount : -amount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    // fetch url params
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get("search") || "");
  }, [location.search]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const params = {};

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (selectedCategory !== "All") {
          params.category = selectedCategory;
        }
        // Fetches videos from the backend based on search query and selected category
        const response = await api.get("/videos", { params });
        setVideos(response.data?.videos || []);
        setError("");
      } catch (err) {
        setError("Failed to load videos");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {/* <div className="text-sm text-[#606060]">
          {searchQuery ? `Showing results for “${searchQuery}”` : "Browse videos"}
        </div> */}
        {/* categories section */}
        <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Scroll categories left"
          onClick={() => scrollCategories("left")}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#e5e5e5] bg-white shadow-sm"
        >
          <HiChevronLeft className="h-5 w-5 text-zinc-700" />
        </button>

        <div
          ref={scrollRef}
          className="flex flex-1 gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((category) => {
            const isSelected = category === selectedCategory;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${
                  isSelected
                    ? "bg-[#0f0f0f] text-white"
                    : "bg-[#f2f2f2] text-[#0f0f0f] hover:bg-[#e5e5e5]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="Scroll categories right"
          onClick={() => scrollCategories("right")}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#e5e5e5] bg-white shadow-sm"
        >
          <HiChevronRight className="h-5 w-5 text-zinc-700" />
        </button>
        </div>
      </div>

      {loading && <p className="text-[#606060]">Loading videos...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && videos.length === 0 && (
        <p className="text-[#606060]">No videos found.</p>
      )}

      {/* Videos grid sections */}
      {!loading && !error && videos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;