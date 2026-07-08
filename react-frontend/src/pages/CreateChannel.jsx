import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const defaultLogo = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
const defaultBanner = "https://via.placeholder.com/1200x300?text=Channel+Banner";

function CreateChannel() {
  const navigate = useNavigate();
  const [channel, setChannel] = useState(null);
  const [form, setForm] = useState({
    channelName: "",
    description: "",
    logo: defaultLogo,
    banner: defaultBanner,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyChannel = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/api/channel/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const existingChannel = response.data?.channel;
        if (existingChannel) {
          setChannel(existingChannel);
          setForm({
            channelName: existingChannel.channelName || "",
            description: existingChannel.description || "",
            logo: existingChannel.logo || defaultLogo,
            banner: existingChannel.banner || defaultBanner,
          });
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          setError(err.response?.data?.message || "Unable to load channel data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyChannel();
  }, []);

  const validate = () => {
    if (!form.channelName.trim()) {
      setError("Channel name is required.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setSaving(true);
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        channelName: form.channelName,
        description: form.description,
        logo: form.logo,
        banner: form.banner,
      };

      const response = channel
        ? await axios.put(`http://localhost:5000/api/channel/${channel._id}`, payload, { headers })
        : await axios.post("http://localhost:5000/api/channel", payload, { headers });

      toast.success(`Channel ${channel ? "updated" : "created"} successfully.`);
      navigate(`/channel/${response.data.channel._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save channel.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pt-20">
      <div className="rounded-[2rem] border border-[#e5e5e5] bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-[#0f172a]">
          {channel ? "Edit channel" : "Create channel"}
        </h1>
        <p className="mt-2 text-sm text-[#64748b]">
          {channel
            ? "Update your channel details and branding."
            : "Create a channel so you can upload videos and share them with everyone."}
        </p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#0f172a]">Channel name</label>
            <input
              type="text"
              value={form.channelName}
              onChange={(e) => setForm({ ...form, channelName: e.target.value })}
              className="w-full rounded-3xl border border-[#e5e5e5] bg-[#f8fafc] px-4 py-3 outline-none focus:border-black"
              placeholder="Enter your channel name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#0f172a]">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-3xl border border-[#e5e5e5] bg-[#f8fafc] px-4 py-3 outline-none focus:border-black"
              rows={5}
              placeholder="Describe your channel"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#0f172a]">Logo URL</label>
              <input
                type="url"
                value={form.logo}
                onChange={(e) => setForm({ ...form, logo: e.target.value })}
                className="w-full rounded-3xl border border-[#e5e5e5] bg-[#f8fafc] px-4 py-3 outline-none focus:border-black"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#0f172a]">Banner URL</label>
              <input
                type="url"
                value={form.banner}
                onChange={(e) => setForm({ ...form, banner: e.target.value })}
                className="w-full rounded-3xl border border-[#e5e5e5] bg-[#f8fafc] px-4 py-3 outline-none focus:border-black"
                placeholder="https://..."
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-[#111] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : channel ? "Update channel" : "Create channel"}
            </button>
            <button
              type="button"
              onClick={() => navigate(channel ? `/channel/${channel._id}` : "/profile")}
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

export default CreateChannel
