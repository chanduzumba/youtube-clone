import { useEffect, useMemo, useRef, useState } from "react";
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
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const menuRef = useRef(null);
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);
  const authToken = useMemo(() => localStorage.getItem("token") || "", []);
  const authHeaders = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  }), [authToken]);

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
  const activeVideoId = useMemo(() => id || video?._id || video?.id, [id, video]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!activeVideoId) return;

      try {
        const response = await axios.get(`http://localhost:5000/api/comments/video/${activeVideoId}/`);
        setComments(response.data?.comments || []);
      } catch (err) {
        setComments([]);
      }
    };

    fetchComments();
  }, [activeVideoId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  
  const relativeTime = useMemo(() => (video ? formatRelativeTime(video.createdAt) : ""), [video]);

  const handleAddComment = async () => {
    if (!commentText.trim() || !activeVideoId) return;

    try {
      setCommentLoading(true);
      setCommentError("");
      await axios.post("http://localhost:5000/api/comments", {
        video: activeVideoId,
        text: commentText.trim(),
      }, authHeaders);
      setCommentText("");
      const response = await axios.get(`http://localhost:5000/api/comments/video/${activeVideoId}/`);
      setComments(response.data?.comments || []);
    } catch (err) {
      setCommentError(err.response?.data?.message || "Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:5000/api/comments/${commentId}`, authHeaders);
      const response = await axios.get(`http://localhost:5000/api/comments/video/${activeVideoId}/`);
      setComments(response.data?.comments || []);
      setActiveMenuId(null);
    } catch (err) {
      setCommentError(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editingText.trim()) return;

    try {
      await axios.put(`http://localhost:5000/api/comments/${commentId}`, {
        text: editingText.trim(),
      }, authHeaders);
      const response = await axios.get(`http://localhost:5000/api/comments/video/${activeVideoId}/`);
      setComments(response.data?.comments || []);
      setEditingCommentId(null);
      setEditingText("");
      setActiveMenuId(null);
    } catch (err) {
      setCommentError(err.response?.data?.message || "Failed to update comment");
    }
  };

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
            <p className="text-sm text-[#606060]">{comments.length} comments</p>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-[#e5e5e5] p-3">
            <FaCircleUser className="mt-1 h-9 w-9 text-[#606060]" />
            <div className="flex-1">
              <textarea
                rows="3"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full rounded-lg border border-[#e5e5e5] p-3 text-sm outline-none"
              />
              {commentError && <p className="mt-2 text-sm text-red-500">{commentError}</p>}
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddComment}
                  disabled={commentLoading}
                  className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
                >
                  {commentLoading ? "Posting..." : "Comment"}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {comments.length === 0 ? (
              <div className="rounded-xl border border-[#e5e5e5] p-4 text-sm text-[#606060]">
                No comments yet. Be the first to comment.
              </div>
            ) : (
              comments.map((comment) => {
                const isOwner = currentUser?._id && comment.user?._id === currentUser._id;
                const isEditing = editingCommentId === comment._id;

                return (
                  <div key={comment._id} className="rounded-xl border border-[#e5e5e5] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={comment.user?.avatar || "https://ui-avatars.com/api/?name=" + (comment.user?.username || "User")}
                          alt={comment.user?.username || "User"}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-[#0f0f0f]">{comment.user?.username || "User"}</p>
                            <p className="text-xs text-[#606060]">{formatRelativeTime(comment.createdAt)}</p>
                          </div>
                          {isEditing ? (
                            <div className="mt-2">
                              <textarea
                                rows="3"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="w-full rounded-lg border border-[#e5e5e5] p-2 text-sm outline-none"
                              />
                              <div className="mt-2 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditComment(comment._id)}
                                  className="rounded-full bg-black px-3 py-1.5 text-sm font-medium text-white"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCommentId(null);
                                    setEditingText("");
                                  }}
                                  className="rounded-full border border-[#e5e5e5] px-3 py-1.5 text-sm font-medium"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-1 text-sm text-[#0f0f0f]">{comment.text}</p>
                          )}
                        </div>
                      </div>

                      {isOwner && (
                        <div className="relative" ref={menuRef}>
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(activeMenuId === comment._id ? null : comment._id)}
                            className="rounded-full p-1 hover:bg-[#f2f2f2]"
                            aria-label="Comment options"
                          >
                            <HiEllipsisVertical className="h-4 w-4 text-[#606060]" />
                          </button>

                          {activeMenuId === comment._id && (
                            <div className="absolute right-0 top-8 z-10 w-28 rounded-lg border border-[#e5e5e5] bg-white p-1 shadow-md">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCommentId(comment._id);
                                  setEditingText(comment.text);
                                  setActiveMenuId(null);
                                }}
                                className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-[#f2f2f2]"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(comment._id)}
                                className="block w-full rounded-md px-2 py-1.5 text-left text-sm text-red-500 hover:bg-[#f2f2f2]"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
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
