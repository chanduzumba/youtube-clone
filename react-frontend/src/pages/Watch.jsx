import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { HiEllipsisVertical, HiHandThumbUp, HiShare, HiChatBubbleLeft } from "react-icons/hi2";
import { FaCircleUser } from "react-icons/fa6";

const formatRelativeTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently uploaded";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
};

function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/videos/${id}`);
        setVideo(response.data?.video || null);
        setRelatedVideos(response.data?.relatedVideos || []);
      } catch (err) {
        setError("Failed to load video");
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  const relativeTime = useMemo(() => (video ? formatRelativeTime(video.createdAt) : ""), [video]);

  if (loading) return <p className="text-[#606060]">Loading video...</p>;
  if (error || !video) return <p className="text-red-500">{error || "Video not found"}</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_340px]">
      <div className="space-y-4">
        <div className="overflow-hidden rounded-xl bg-black">
          <video controls className="aspect-video w-full" src={video.videoUrl} />
        </div>

        <div className="space-y-3">
          <h1 className="text-xl font-semibold text-[#0f0f0f]">{video.title}</h1>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={video.channel?.logo || video.uploader?.avatar || "https://ui-avatars.com/api/?name=User"}
                alt={video.channel?.channelName || video.uploader?.username}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-[#0f0f0f]">{video.channel?.channelName || video.uploader?.username}</p>
                <p className="text-sm text-[#606060]">{video.subscribers || 0} subscribers</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 rounded-full bg-[#f2f2f2] px-3 py-2 text-sm font-medium">
                <HiHandThumbUp className="h-4 w-4" /> {video.likes || 0}
              </button>
              <button className="flex items-center gap-2 rounded-full bg-[#f2f2f2] px-3 py-2 text-sm font-medium">
                <HiHandThumbUp className="h-4 w-4 rotate-180" /> {video.dislikes || 0}
              </button>
              <button className="flex items-center gap-2 rounded-full bg-[#f2f2f2] px-3 py-2 text-sm font-medium">
                <HiShare className="h-4 w-4" /> Share
              </button>
              <button className="rounded-full bg-[#f2f2f2] p-2">
                <HiEllipsisVertical className="h-4 w-4" />
              </button>
              <button className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white">Subscribe</button>
            </div>
          </div>

          <div className="rounded-xl bg-[#f2f2f2] p-4">
            <p className="text-sm text-[#606060]">
              {video.views} views • {relativeTime}
            </p>
            <p className="mt-2 text-sm text-[#0f0f0f]">{video.description}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#0f0f0f]">Comments</h2>
            <p className="text-sm text-[#606060]">0 comments</p>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-[#e5e5e5] p-3">
            <FaCircleUser className="mt-1 h-9 w-9 text-[#606060]" />
            <div className="flex-1">
              <textarea
                rows="3"
                placeholder="Add a comment..."
                className="w-full rounded-lg border border-[#e5e5e5] p-3 text-sm outline-none"
              />
              <div className="mt-2 flex justify-end">
                <button className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white">Comment</button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#e5e5e5] p-4 text-sm text-[#606060]">
            Comments UI will be connected to the backend next.
          </div>
        </div>
      </div>

      <aside className="space-y-3">
        {relatedVideos.length > 0 ? (
          relatedVideos.map((item) => (
            <div key={item._id} className="flex gap-3 rounded-lg bg-white p-2 shadow-sm">
              <img src={item.thumbnailUrl} alt={item.title} className="h-20 w-28 rounded-md object-cover" />
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-medium text-[#0f0f0f]">{item.title}</p>
                <p className="text-sm text-[#606060]">{item.channel?.channelName || item.uploader?.username}</p>
                <p className="text-sm text-[#606060]">{item.views} views</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-[#606060]">No related videos available.</p>
        )}
      </aside>
    </div>
  );
}

export default Watch;
