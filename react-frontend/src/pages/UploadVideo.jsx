import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

function UploadVideo() {
  const navigate = useNavigate();
  // state variables to manage form inputs, error messages, and saving state
  const [form, setForm] = useState({
    title: "",
    description: "",
    thumbnailUrl: "",
    videoUrl: "",
    category: categories[0],
    duration: "",
    visibility: "public",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
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
      //api call to post video data
      const response = await axios.post(
        "http://localhost:5000/api/videos",
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
      // navigate to watch newly uploaded video
      navigate(`/watch/${response.data.video._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload video.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pt-20">
      <div className="rounded-[2rem] border border-[#e5e5e5] bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-[#0f172a]">Upload video</h1>
        <p className="mt-2 text-sm text-[#64748b]">Share your next video with the world from your channel.</p>
        {/*  upload video form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
              {saving ? "Uploading..." : "Upload video"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="rounded-full border border-[#e5e5e5] bg-white px-6 py-3 text-sm font-medium text-[#0f172a] hover:bg-[#f8fafc]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadVideo
