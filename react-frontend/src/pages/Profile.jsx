import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiUserCircle,
  HiPlus,
  HiPencilSquare,
  HiMagnifyingGlass,
  HiEllipsisVertical,
  HiPencil,
  HiTrash,
} from "react-icons/hi2";
import { formatRelativeTime } from "../utils/videoHelpers";
import api from "../api/axios";

const defaultBanner = "https://via.placeholder.com/1400x350?text=Channel+Banner";
const defaultLogo = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const formatDuration = (seconds) => {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) return null;
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatViews = (views) => {
  const count = Number(views) || 0;
  if (count === 0) return "No views";
  return `${count.toLocaleString()} view${count === 1 ? "" : "s"}`;
};

// A single video tile in the channel's "Videos" grid, styled after the
// real YouTube channel page: thumbnail + duration badge, title, meta line,
// and a kebab menu for owner actions (edit/delete).
function ChannelVideoCard({ video, isOwner, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const duration = formatDuration(video.duration);

  return (
    <div className="group">
      <Link to={`/watch/${video._id}`} className="relative block overflow-hidden rounded-xl bg-black">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="aspect-video w-full object-cover transition group-hover:opacity-90"
        />
        {duration && (
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
            {duration}
          </span>
        )}
      </Link>

      <div className="mt-2 flex items-start justify-between gap-2">
        <Link to={`/watch/${video._id}`} className="min-w-0">
          <p className="line-clamp-2 text-sm font-medium text-[#0f0f0f]">{video.title}</p>
          <p className="mt-1 text-sm text-[#606060]">
            {formatViews(video.views)} • {formatRelativeTime(video.createdAt)}
          </p>
        </Link>

        {isOwner && (
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="rounded-full p-1 text-[#606060] hover:bg-[#f2f2f2]"
              aria-label="Video options"
            >
              <HiEllipsisVertical className="h-5 w-5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 z-10 w-36 rounded-lg border border-[#e5e5e5] bg-white p-1 shadow-md">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit?.(video._id);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-[#f2f2f2]"
                >
                  <HiPencil className="h-4 w-4" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete?.(video._id);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-red-500 hover:bg-[#f2f2f2]"
                >
                  <HiTrash className="h-4 w-4" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Profile() {
  const navigate = useNavigate();
  // State variables to manage user data, channel data, videos, loading state, and error messages
  const [user, setUser] = useState(null);
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("videos");

  useEffect(() => {
    // collect user info from LS
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      const authHeaders = {
        headers: { Authorization: `Bearer ${token}` },
      };

      try {
        setLoading(true);
        setError("");
        // make api calls to get channel info and videos of channel
        const [channelResponse, videosResponse] = await Promise.all([
          api.get("/channel/me", authHeaders),
          api.get("/videos/my/videos", authHeaders),
        ]);

        setChannel(channelResponse.data?.channel || null);
        setVideos(videosResponse.data?.videos || []);
      } catch (err) {
        if (err.response?.status === 404) {
          setChannel(null);
        } else {
          setError(err.response?.data?.message || "Unable to load profile data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleDeleteVideo = async (videoId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/videos/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete video.");
    }
  };

  if (loading) {
    return <p className="text-[#606060]">Loading profile...</p>;
  }

  //if user not signedin 
  if (!user) {
    return (
      <div className="pt-20">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#e5e5e5] bg-white px-8 py-12 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f2f2f2]">
            <HiUserCircle className="h-10 w-10 text-[#606060]" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-[#0f0f0f]">Enjoy your favorite videos</h1>
          <p className="mt-3 text-sm text-[#606060]">
            Sign in to access videos that you’ve liked or saved.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white hover:bg-[#111]"
            >
              Sign in
            </Link>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] px-6 py-3 text-sm font-medium text-[#0f0f0f] hover:bg-[#f8f8f8]"
            >
              Explore videos
            </button>
          </div>
        </div>
      </div>
    );
  }

  //profile page view /channel details
  return (
    <div className="space-y-6 pt-20">
      {error && <p className="text-red-500">{error}</p>}

      <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
        <div className="relative">
          <img
            src={channel?.banner || defaultBanner}
            alt="Channel banner"
            className="h-56 w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-6 py-4 text-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <img
                  src={channel?.logo || user.avatar || defaultLogo}
                  alt={channel?.channelName || user.username}
                  className="h-24 w-24 rounded-full border-4 border-white object-cover"
                />
                <div>
                  <p className="text-3xl font-semibold">{channel?.channelName || `${user.username}'s channel`}</p>
                  <p className="mt-1 text-sm text-white/80">
                    @{channel?.channelName?.replace(/\s+/g, "") || user.username}
                  </p>
                  <p className="mt-2 text-sm text-white/80">
                    {channel ? `${videos.length} video${videos.length === 1 ? "" : "s"}` : "No channel created yet"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to={channel ? "/create-channel" : "/create-channel"}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-[#0f0f0f] shadow-sm hover:bg-[#f2f2f2]"
                >
                  <HiPencilSquare className="h-4 w-4" />
                  {channel ? "Customize channel" : "Create channel"}
                </Link>
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-5 py-3 text-sm font-medium text-[#0f0f0f] shadow-sm hover:bg-[#f8f8f8]"
                >
                  <HiPlus className="h-4 w-4" />
                  {channel ? "Manage videos" : "Upload video"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="space-y-6">
          {!channel ? (
            <div className="rounded-[2rem] border border-[#e5e5e5] bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f2f2f2]">
                <HiPlus className="h-7 w-7 text-[#606060]" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-[#0f0f0f]">Start your channel</h2>
              <p className="mt-3 text-sm text-[#606060]">
                Create a channel to share videos with your audience and manage your uploads from one place.
              </p>
              <div className="mt-6 flex justify-center">
                <Link
                  to="/create-channel"
                  className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white hover:bg-[#111]"
                >
                  Create channel
                </Link>
              </div>
            </div>
          ) : null}

          {/* Videos section - styled like the channel page's Videos/Posts tabs */}
          <div>
            <div className="flex items-center gap-8 border-b border-[#e5e5e5]">
              <button
                type="button"
                onClick={() => setActiveTab("videos")}
                className={`-mb-px border-b-2 pb-3 text-sm font-medium ${
                  activeTab === "videos"
                    ? "border-[#0f0f0f] text-[#0f0f0f]"
                    : "border-transparent text-[#606060] hover:text-[#0f0f0f]"
                }`}
              >
                Videos
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("posts")}
                className={`-mb-px border-b-2 pb-3 text-sm font-medium ${
                  activeTab === "posts"
                    ? "border-[#0f0f0f] text-[#0f0f0f]"
                    : "border-transparent text-[#606060] hover:text-[#0f0f0f]"
                }`}
              >
                Posts
              </button>
              <HiMagnifyingGlass className="ml-auto mb-3 h-5 w-5 text-[#606060]" />
            </div>

            {activeTab === "videos" ? (
              videos.length === 0 ? (
                <div className="mt-6 rounded-[1.5rem] border border-dashed border-[#e5e5e5] p-8 text-center text-sm text-[#606060]">
                  No videos uploaded yet.{" "}
                  <Link to="/upload" className="font-medium text-[#0f0f0f] underline">
                    Upload your first video
                  </Link>
                </div>
              ) : (
                <div className="mt-6 grid gap-x-4 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
                  {videos.map((video) => (
                    <ChannelVideoCard
                      key={video._id}
                      video={video}
                      isOwner={true}
                      onEdit={(videoId) => navigate(`/edit-video/${videoId}`)}
                      onDelete={handleDeleteVideo}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-[#e5e5e5] p-8 text-center text-sm text-[#606060]">
                No posts yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
