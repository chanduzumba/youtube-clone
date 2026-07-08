import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { HiUserCircle, HiPlus, HiArrowRight, HiPencilSquare } from "react-icons/hi2";
import VideoCard from "../components/VideoCard.jsx";

const defaultBanner = "https://via.placeholder.com/1400x350?text=Channel+Banner";
const defaultLogo = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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

        const [channelResponse, videosResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/channel/me", authHeaders),
          axios.get("http://localhost:5000/api/videos/my/videos", authHeaders),
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

  if (loading) {
    return <p className="text-[#606060]">Loading profile...</p>;
  }

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

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="rounded-[2rem] border border-[#e5e5e5] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar || defaultLogo}
              alt={user.username}
              className="h-16 w-16 rounded-full object-cover"
            />
            <div>
              <p className="text-lg font-semibold text-[#0f0f0f]">{user.username}</p>
              <p className="text-sm text-[#606060]">{user.email}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm text-[#606060]">Channel status</p>
              <p className="mt-1 text-sm font-medium text-[#0f0f0f]">
                {channel ? "Channel created" : "Guest channel"}
              </p>
            </div>
            {channel && (
              <div>
                <p className="text-sm text-[#606060]">Subscribers</p>
                <p className="mt-1 text-sm font-medium text-[#0f0f0f]">{channel.subscribersCount || 0}</p>
              </div>
            )}
          </div>
        </div>

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

          <div className="rounded-[2rem] border border-[#e5e5e5] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-[#606060]">Your videos</p>
                <p className="text-xl font-semibold text-[#0f0f0f]">{videos.length}</p>
              </div>
              <Link
                to="/upload"
                className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-[#111]"
              >
                Upload
              </Link>
            </div>

            {videos.length === 0 ? (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-[#e5e5e5] p-8 text-center text-sm text-[#606060]">
                No videos uploaded yet.
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {videos.map((video) => (
                  <VideoCard key={video._id} video={video} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
