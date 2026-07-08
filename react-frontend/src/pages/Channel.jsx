import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { HiCheckCircle, HiPencilSquare, HiPlus, HiMagnifyingGlass, HiOutlineTrash } from "react-icons/hi2";
import VideoCard from "../components/VideoCard.jsx";

const tabs = ["Videos", "Posts"];

function Channel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Videos");
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);

  const authToken = useMemo(() => localStorage.getItem("token") || "", []);
  const currentUser = useMemo(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }, []);

  const isOwner = !!channel && !!currentUser && channel.owner?._id === currentUser._id;

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get(`http://localhost:5000/api/channel/${id}`);
        setChannel(response.data?.channel || null);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load channel.");
      } finally {
        setLoading(false);
      }
    };

    fetchChannel();
  }, [id]);

  useEffect(() => {
    const fetchChannelVideos = async () => {
      try {
        const params = { channel: id };
        if (search.trim()) params.search = search.trim();

        const response = await axios.get("http://localhost:5000/api/videos", {
          params,
        });
        setVideos(response.data?.videos || []);
      } catch {
        setVideos([]);
      }
    };

    fetchChannelVideos();
  }, [id, search]);

  const handleDeleteChannel = async () => {
    if (!window.confirm("Delete this channel and all of its videos?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/channel/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete channel.");
    }
  };

  if (loading) {
    return <p className="text-[#606060]">Loading channel...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!channel) {
    return (
      <div className="rounded-[2rem] border border-[#e5e5e5] bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-[#0f172a]">Channel not found</p>
        <p className="mt-3 text-sm text-[#64748b]">This channel may have been deleted or the link is incorrect.</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-medium text-white hover:bg-[#111]"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
        <div className="relative">
          <img
            src={channel.banner}
            alt={`${channel.channelName} banner`}
            className="h-60 w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-6 py-5 text-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <img
                  src={channel.logo}
                  alt={channel.channelName}
                  className="h-28 w-28 rounded-full border-4 border-white object-cover"
                />
                <div>
                  <p className="text-3xl font-semibold">{channel.channelName}</p>
                  <p className="mt-1 text-sm text-white/80">@{channel.channelName.replace(/\s+/g, "")}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-white/80">
                    <span>{channel.subscribersCount || 0} subscribers</span>
                    <span>{videos.length} videos</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {isOwner ? (
                  <>
                    <Link
                      to="/create-channel"
                      className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
                    >
                      <HiPencilSquare className="h-4 w-4" />
                      Edit channel
                    </Link>
                    <Link
                      to="/upload"
                      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#0f172a] hover:bg-[#f3f4f6]"
                    >
                      <HiPlus className="h-4 w-4" />
                      Upload video
                    </Link>
                    <button
                      type="button"
                      onClick={handleDeleteChannel}
                      className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                    >
                      <HiOutlineTrash className="h-4 w-4" />
                      Delete channel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#0f172a] hover:bg-[#f3f4f6]"
                  >
                    <HiCheckCircle className="h-4 w-4" />
                    Subscribed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-[#e5e5e5] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-[#64748b]">Channel</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#0f172a]">{channel.channelName}</h2>
              </div>
              <div className="relative max-w-sm">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search channel videos"
                  className="w-full rounded-full border border-[#e5e5e5] bg-[#f8fafc] px-4 py-3 pr-12 text-sm outline-none focus:border-black"
                />
                <HiMagnifyingGlass className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeTab === tab
                      ? "bg-black text-white"
                      : "bg-[#f2f4f7] text-[#475569] hover:bg-[#e2e8f0]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#e5e5e5] bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-[#0f172a]">About</h3>
                <p className="mt-2 text-sm text-[#475569]">{channel.description || "No channel description provided."}</p>
              </div>
              <span className="inline-flex rounded-full bg-[#f2f4f7] px-4 py-2 text-sm text-[#475569]">
                Created {new Date(channel.createdAt).toLocaleDateString()}
              </span>
            </div>

            {activeTab === "Videos" ? (
              <div>
                {videos.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-[#e5e5e5] p-10 text-center text-sm text-[#64748b]">
                    No videos have been uploaded to this channel yet.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {videos.map((video) => (
                      <VideoCard key={video._id} video={video} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-[#e5e5e5] p-10 text-center text-sm text-[#64748b]">
                No posts available yet.
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-[#e5e5e5] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#0f172a]">Channel details</h3>
            <div className="mt-5 space-y-4 text-sm text-[#475569]">
              <div>
                <p className="text-[#64748b]">Owner</p>
                <p className="mt-1 text-[#0f172a]">{channel.owner?.username || "Unknown"}</p>
              </div>
              <div>
                <p className="text-[#64748b]">Subscribers</p>
                <p className="mt-1 text-[#0f172a]">{channel.subscribersCount || 0}</p>
              </div>
              <div>
                <p className="text-[#64748b]">Total views</p>
                <p className="mt-1 text-[#0f172a]">{channel.totalViews || 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#e5e5e5] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#0f172a]">Channel actions</h3>
            <div className="mt-5 space-y-3 text-sm text-[#475569]">
              <p>Manage and share your channel from one place.</p>
              <div className="grid gap-3 pt-3">
                <Link
                  to={isOwner ? "/create-channel" : "/"}
                  className="inline-flex items-center justify-center rounded-full bg-[#f8fafc] px-4 py-3 text-sm font-medium text-[#0f172a] hover:bg-[#e2e8f0]"
                >
                  {isOwner ? "Edit channel" : "View profile"}
                </Link>
                <Link
                  to={isOwner ? "/upload" : "/"}
                  className="inline-flex items-center justify-center rounded-full bg-[#f8fafc] px-4 py-3 text-sm font-medium text-[#0f172a] hover:bg-[#e2e8f0]"
                >
                  {isOwner ? "Upload new video" : "Explore videos"}
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Channel
