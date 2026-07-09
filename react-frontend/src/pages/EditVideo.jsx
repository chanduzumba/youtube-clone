import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

//categories default values
const categories = [
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

const visibilityOptions = ["public", "private", "unlisted"];

function EditVideo() {
  const { id } = useParams();
  const navigate = useNavigate();
  // State variables to manage video data, form inputs, loading state, saving state, and error messages
  const [video, setVideo] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    thumbnailUrl: "",
    videoUrl: "",
    category: categories[0],
    duration: "",
    visibility: "public",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        // fetch video details from backend using video id
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/videos/${id}`);
        const existingVideo = response.data?.video;
        if (existingVideo) {
          setVideo(existingVideo);
          setForm({
            title: existingVideo.title || "",
            description: existingVideo.description || "",
            thumbnailUrl: existingVideo.thumbnailUrl || "",
            videoUrl: existingVideo.videoUrl || "",
            category: existingVideo.category || categories[0],
            duration: existingVideo.duration?.toString() || "",
            visibility: existingVideo.visibility || "public",
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load video.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  // Validates the form inputs to ensure all required fields are filled
  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.thumbnailUrl.trim() || !form.videoUrl.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setSaving(true);
      setError("");
      // Sends a PUT request to update the video details on the backend
      const response = await axios.put(
        `http://localhost:5000/api/videos/${id}`,
        {
          title: form.title,
          description: form.description,
          thumbnailUrl: form.thumbnailUrl,
          videoUrl: form.videoUrl,
          category: form.category,
          duration: Number(form.duration) || 0,
          visibility: form.visibility,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // route to watch video
      navigate(`/watch/${response.data.video._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update video.");
    } finally {
      setSaving(false);
    }
  };

  // Handles video deletion by sending a DELETE request to the backend and navigating back to the profile page
  const handleDelete = async () => {
    if (!window.confirm("Delete this video permanently?")) return;
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // Delete api call to backend 
      await axios.delete(`http://localhost:5000/api/videos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete video.");
    }
  };

  if (loading) {
    return <p className="text-[#606060]">Loading video details...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pt-20">
      <div className="rounded-[2rem] border border-[#e5e5e5] bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-[#0f172a]">Edit video</h1>
        <p className="mt-2 text-sm text-[#64748b]">Update your video details, then save to apply changes.</p>
{/* Form to edit video details */}
        <form className="mt-8 space-y-6" onSubmit={handleUpdate}>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#0f172a]">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter video title"
              className="w-full rounded-3xl border border-[#e5e5e5] bg-[#f8fafc] px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#0f172a]">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tell viewers about your video"
              rows={5}
              className="w-full rounded-3xl border border-[#e5e5e5] bg-[#f8fafc] px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#0f172a]">Thumbnail URL</label>
              <input
                type="url"
                value={form.thumbnailUrl}
                onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-3xl border border-[#e5e5e5] bg-[#f8fafc] px-4 py-3 outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#0f172a]">Video URL</label>
              <input
                type="url"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-3xl border border-[#e5e5e5] bg-[#f8fafc] px-4 py-3 outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#0f172a]">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-3xl border border-[#e5e5e5] bg-[#f8fafc] px-4 py-3 outline-none focus:border-black"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#0f172a]">Duration (seconds)</label>
              <input
                type="number"
                min={1}
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full rounded-3xl border border-[#e5e5e5] bg-[#f8fafc] px-4 py-3 outline-none focus:border-black"
                placeholder="120"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#0f172a]">Visibility</label>
              <select
                value={form.visibility}
                onChange={(e) => setForm({ ...form, visibility: e.target.value })}
                className="w-full rounded-3xl border border-[#e5e5e5] bg-[#f8fafc] px-4 py-3 outline-none focus:border-black"
              >
                {visibilityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-[#111] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate(`/watch/${id}`)}
                className="rounded-full border border-[#e5e5e5] bg-white px-6 py-3 text-sm font-medium text-[#0f172a] hover:bg-[#f8fafc]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-full bg-red-500 px-6 py-3 text-sm font-medium text-white hover:bg-red-600"
              >
                Delete video
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditVideo
