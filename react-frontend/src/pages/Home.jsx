import { useEffect, useRef, useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import axios from "axios";
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
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    const fetchVideos = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/videos");
        setVideos(response.data?.videos || []);
      } catch (err) {
        setError("Failed to load videos");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Scroll categories left"
          onClick={() => scrollCategories("left")}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <HiChevronLeft className="h-5 w-5 text-[#0f0f0f]" />
        </button>

        <div
          ref={scrollRef}
          className="flex flex-1 gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((category) => {
            const isSelected = category === "All";

            return (
              <button
                key={category}
                type="button"
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
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <HiChevronRight className="h-5 w-5 text-[#0f0f0f]" />
        </button>
      </div>

      {loading && <p className="text-[#606060]">Loading videos...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && videos.length === 0 && (
        <p className="text-[#606060]">No videos found.</p>
      )}

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