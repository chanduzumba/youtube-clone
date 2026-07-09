import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { HiEllipsisVertical, HiHandThumbUp, HiShare } from "react-icons/hi2";
import { useAuth } from "../hooks/useAuth";
import {
  getYouTubeEmbedUrl,
  isYouTubeUrl,
  formatRelativeTime,
} from "../utils/videoHelpers";
import Comments from "../components/Comments";

function Watch() {
  // state and hooks for managing video data, related videos, and user interactions
  const { id } = useParams();
  const { currentUser, authHeaders, getCurrentUserId } = useAuth();

  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        // api call to fetch video by id
        const response = await axios.get(
          `http://localhost:5000/api/videos/${id}`,
        );
        setVideo(response.data?.video || null);
        // implementation in future
        setRelatedVideos(response.data?.relatedVideos || []);
      } catch (err) {
        setError("Failed to load video");
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  const activeVideoId = useMemo(
    () => id || video?._id || video?.id,
    [id, video],
  );

  // Memoizes the relative upload time to avoid unnecessary recalculations
  const relativeTime = useMemo(
    () => (video ? formatRelativeTime(video.createdAt) : ""),
    [video],
  );

  //video like  function
  const handleLikeVideo = async (videoId) => {
    if (!currentUser) {
      setShowSignInPrompt(true);
      return;
    }

    try {
      // patch http request to toggle like on a video
      await axios.patch(
        `http://localhost:5000/api/videos/${videoId}/like`,
        {},
        authHeaders,
      );
      //get video after changing updation
      const response = await axios.get(
        `http://localhost:5000/api/videos/${videoId}`,
      );
      setVideo(response.data?.video || null);
    } catch (err) {
      // ignore errors for now
    }
  };

  //handle dislike video
  const handleDislikeVideo = async (videoId) => {
    if (!currentUser) {
      setShowSignInPrompt(true);
      return;
    }

    try {
      // patch dislike api call
      await axios.patch(
        `http://localhost:5000/api/videos/${videoId}/dislike`,
        {},
        authHeaders,
      );
      const response = await axios.get(
        `http://localhost:5000/api/videos/${videoId}`,
      );
      setVideo(response.data?.video || null);
    } catch (err) {
      // ignore errors for now
    }
  };

  //video like check
  const isVideoLikedByUser = (video) => {
    const userId = getCurrentUserId();
    if (!userId) return false;
    return [...(video?.likedBy || []), ...(video?.likedby || [])].some(
      (item) => String(item?._id || item?.id || item) === String(userId),
    );
  };

  //video dislike check
  const isVideoDislikedByUser = (video) => {
    const userId = getCurrentUserId();
    if (!userId) return false;
    return [...(video?.dislikedBy || []), ...(video?.dislikedby || [])].some(
      (item) => String(item?._id || item?.id || item) === String(userId),
    );
  };

  if (loading) return <p className="text-[#606060]">Loading video...</p>;
  if (error || !video)
    return <p className="text-red-500">{error || "Video not found"}</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_340px]">
      <div className="space-y-4">
        <div className="overflow-hidden rounded-xl bg-black">
          {isYouTubeUrl(video.videoUrl) ? (
            <iframe
              src={getYouTubeEmbedUrl(video.videoUrl)}
              title={video.title}
              className="aspect-video w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              controls
              className="aspect-video w-full"
              src={video.videoUrl}
            />
          )}
        </div>
        {/* video / channel details */}
        <div className="relative space-y-3">
          <h1 className="text-xl font-semibold text-[#0f0f0f]">
            {video.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={
                  video.channel?.logo ||
                  video.uploader?.avatar ||
                  "https://ui-avatars.com/api/?name=User"
                }
                alt={video.channel?.channelName || video.uploader?.username}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-[#0f0f0f]">
                  {video.channel?.channelName || video.uploader?.username}
                </p>
                <p className="text-sm text-[#606060]">
                  {video.subscribers || 0} subscribers
                </p>
              </div>
            </div>
            {/* like dislike section */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleLikeVideo(video._id)}
                className={`flex items-center gap-2 rounded-full bg-[#f2f2f2] px-3 py-2 text-sm font-medium ${isVideoLikedByUser(video) ? "text-blue-600" : "text-[#606060]"}`}
              >
                <HiHandThumbUp className="h-4 w-4" /> {video.likes || 0}
              </button>
              <button
                onClick={() => handleDislikeVideo(video._id)}
                className={`flex items-center gap-2 rounded-full bg-[#f2f2f2] px-3 py-2 text-sm font-medium ${isVideoDislikedByUser(video) ? "text-red-600" : "text-[#606060]"}`}
              >
                <HiHandThumbUp className="h-4 w-4 rotate-180" />{" "}
                {video.dislikes || 0}
              </button>
              <button className="flex items-center gap-2 rounded-full bg-[#f2f2f2] px-3 py-2 text-sm font-medium">
                <HiShare className="h-4 w-4" /> Share
              </button>
              <button className="rounded-full bg-[#f2f2f2] p-2">
                <HiEllipsisVertical className="h-4 w-4" />
              </button>
              <button className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white">
                Subscribe
              </button>
            </div>
          </div>
          {/* signin prompt */}
          {showSignInPrompt && (
            <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl bg-white p-4 shadow-lg">
              <h3 className="text-md font-semibold">
                Want to join the conversation?
              </h3>
              <p className="text-sm text-[#606060] mt-1">Sign in to continue</p>
              <div className="mt-3 text-center">
                <a
                  href="/login"
                  onClick={() => setShowSignInPrompt(false)}
                  className="inline-block rounded-full bg-black px-6 py-2 text-sm font-medium text-white"
                >
                  Sign in
                </a>
              </div>
            </div>
          )}
          {/* video description */}
          <div className="rounded-xl bg-[#f2f2f2] p-4">
            <p className="text-sm text-[#606060]">
              {video.views} views • {relativeTime}
            </p>
            <p className="mt-2 text-sm text-[#0f0f0f]">{video.description}</p>
          </div>
        </div>
        {/* Comment section */}
        <Comments videoId={activeVideoId} />
      </div>
      {/* Related videos section */}
      <aside className="space-y-3">
        {relatedVideos.length > 0 ? (
          relatedVideos.map((item) => (
            <div
              key={item._id}
              className="flex gap-3 rounded-lg bg-white p-2 shadow-sm"
            >
              <img
                src={item.thumbnailUrl}
                alt={item.title}
                className="h-20 w-28 rounded-md object-cover"
              />
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-medium text-[#0f0f0f]">
                  {item.title}
                </p>
                <p className="text-sm text-[#606060]">
                  {item.channel?.channelName || item.uploader?.username}
                </p>
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
