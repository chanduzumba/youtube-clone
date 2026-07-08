import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  HiEllipsisVertical,
  HiHandThumbUp,
  HiShare,
  HiChatBubbleLeft,
  HiPencil,
  HiTrash,
  HiFlag,
} from "react-icons/hi2";
import { FaCircleUser } from "react-icons/fa6";

const getYouTubeEmbedUrl = (url) => {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace("www.", "");
    if (hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }
    if (hostname === "youtube.com" || hostname === "youtube-nocookie.com") {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : "";
      }
      if (parsed.pathname.startsWith("/embed/")) {
        return url;
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.split("/").pop();
        return `https://www.youtube.com/embed/${id}`;
      }
    }
    return "";
  } catch {
    return "";
  }
};

const isYouTubeUrl = (url) => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace("www.", "");
    return ["youtube.com", "youtu.be", "youtube-nocookie.com"].includes(hostname);
  } catch {
    return false;
  }
};

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
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [deleteCandidateId, setDeleteCandidateId] = useState(null);
  const menuRef = useRef(null);
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);
  const authToken = useMemo(() => localStorage.getItem("token") || "", []);
  const authHeaders = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${authToken}` },
    }),
    [authToken],
  );

  const getCurrentUserId = () =>
    currentUser?._id || currentUser?.id || currentUser?.userId || null;
  const isCommentLikedByUser = (comment) => {
    const userId = getCurrentUserId();
    if (!userId) return false;
    return [...(comment?.likedby || []), ...(comment?.likedBy || [])].some(
      (item) => String(item?._id || item?.id || item) === String(userId),
    );
  };
  const isCommentDislikedByUser = (comment) => {
    const userId = getCurrentUserId();
    if (!userId) return false;
    return [
      ...(comment?.dislikedby || []),
      ...(comment?.dislikedBy || []),
    ].some((item) => String(item?._id || item?.id || item) === String(userId));
  };

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/videos/${id}`,
        );
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
  const activeVideoId = useMemo(
    () => id || video?._id || video?.id,
    [id, video],
  );

  useEffect(() => {
    const fetchComments = async () => {
      if (!activeVideoId) return;

      try {
        const response = await axios.get(
          `http://localhost:5000/api/comments/video/${activeVideoId}/`,
        );
        setComments(response.data?.comments || []);
      } catch (err) {
        setComments([]);
      }
    };

    fetchComments();
  }, [activeVideoId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // close menu when clicking outside any element marked with data-comment-menu
      if (!event.target.closest("[data-comment-menu]")) {
        setActiveMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const relativeTime = useMemo(
    () => (video ? formatRelativeTime(video.createdAt) : ""),
    [video],
  );

  const handleAddComment = async () => {
    if (!commentText.trim() || !activeVideoId) return;
    if (!currentUser) {
      setShowSignInPrompt(true);
      return;
    }

    try {
      setCommentLoading(true);
      setCommentError("");
      await axios.post(
        "http://localhost:5000/api/comments",
        {
          video: activeVideoId,
          text: commentText.trim(),
        },
        authHeaders,
      );
      setCommentText("");
      const response = await axios.get(
        `http://localhost:5000/api/comments/video/${activeVideoId}/`,
      );
      setComments(response.data?.comments || []);
    } catch (err) {
      setCommentError(err.response?.data?.message || "Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!currentUser) {
      setShowSignInPrompt(true);
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/comments/${commentId}`,
        authHeaders,
      );
      const response = await axios.get(
        `http://localhost:5000/api/comments/video/${activeVideoId}/`,
      );
      setComments(response.data?.comments || []);
      setActiveMenuId(null);
    } catch (err) {
      setCommentError(
        err.response?.data?.message || "Failed to delete comment",
      );
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editingText.trim()) return;
    if (!currentUser) {
      setShowSignInPrompt(true);
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/comments/${commentId}`,
        {
          text: editingText.trim(),
        },
        authHeaders,
      );
      const response = await axios.get(
        `http://localhost:5000/api/comments/video/${activeVideoId}/`,
      );
      setComments(response.data?.comments || []);
      setEditingCommentId(null);
      setEditingText("");
      setActiveMenuId(null);
    } catch (err) {
      setCommentError(
        err.response?.data?.message || "Failed to update comment",
      );
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!currentUser) {
      setShowSignInPrompt(true);
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/comments/${commentId}/like`,
        {},
        authHeaders,
      );
      const response = await axios.get(
        `http://localhost:5000/api/comments/video/${activeVideoId}/`,
      );
      setComments(response.data?.comments || []);
    } catch (err) {
      // ignore errors for now
    }
  };

  const handleDislikeComment = async (commentId) => {
    if (!currentUser) {
      setShowSignInPrompt(true);
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/comments/${commentId}/dislike`,
        {},
        authHeaders,
      );
      const response = await axios.get(
        `http://localhost:5000/api/comments/video/${activeVideoId}/`,
      );
      setComments(response.data?.comments || []);
    } catch (err) {
      // ignore errors for now
    }
  };

  const handleReplyTo = (username) => {
    if (!currentUser) {
      setShowSignInPrompt(true);
      return;
    }
    setCommentText((t) => `${t ? t + " " : ""}@${username} `);
  };

  const handleReportComment = async (commentId) => {
    if (!currentUser) {
      setShowSignInPrompt(true);
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/comments/${commentId}/report`,
        {},
        authHeaders,
      );
    } catch (err) {
      // ignore
    }
  };

  //video like  function
  const handleLikeVideo = async (videoId) => {
    if (!currentUser) {
      setShowSignInPrompt(true);
      return;
    }

    try {
      await axios.patch(
        `http://localhost:5000/api/videos/${videoId}/like`,
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

  //handle dislike video
  const handleDislikeVideo = async (videoId) => {
    if (!currentUser) {
      setShowSignInPrompt(true);
      return;
    }

    try {
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

        <div className="space-y-3">
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

          <div className="relative">
            <div className="flex items-start gap-3 rounded-xl p-3">
              <FaCircleUser className="mt-1 h-9 w-9 text-[#606060]" />
              <div className="flex-1">
                <textarea
                  rows="3"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full rounded-lg border border-[#e5e5e5] p-3 text-sm outline-none"
                />
                {commentError && (
                  <p className="mt-2 text-sm text-red-500">{commentError}</p>
                )}
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

            {showSignInPrompt && (
              <div className="absolute left-4 top-[-90px] z-20 w-72 rounded-xl bg-white p-4 shadow-lg">
                <h3 className="text-md font-semibold">
                  Want to join the conversation?
                </h3>
                <p className="text-sm text-[#606060] mt-1">
                  Sign in to continue
                </p>
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
          </div>

          <div className="space-y-3">
            {comments.length === 0 ? (
              <div className="rounded-xl p-4 text-sm text-[#606060]">
                No comments yet. Be the first to comment.
              </div>
            ) : (
              comments.map((comment) => {
                const currentUserId =
                  currentUser?._id ||
                  currentUser?.id ||
                  currentUser?.userId ||
                  null;
                const commentUserId =
                  comment.user?._id || comment.user?.id || null;
                const isOwner =
                  currentUserId &&
                  String(commentUserId) === String(currentUserId);
                const isEditing = editingCommentId === comment._id;

                return (
                  <div key={comment._id} className="rounded-xl p-3 bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={
                            comment.user?.avatar ||
                            "https://ui-avatars.com/api/?name=" +
                              (comment.user?.username || "User")
                          }
                          alt={comment.user?.username || "User"}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-[#0f0f0f]">
                              {comment.user?.username || "User"}
                            </p>
                            <p className="text-xs text-[#606060]">
                              {formatRelativeTime(comment.createdAt)}
                            </p>
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
                            <>
                              <p className="mt-1 text-sm text-[#0f0f0f]">
                                {comment.text}
                              </p>

                              <div className="mt-2 flex items-center gap-4 text-sm">
                                <button
                                  type="button"
                                  onClick={() => handleLikeComment(comment._id)}
                                  className={`flex items-center gap-2 ${isCommentLikedByUser(comment) ? "text-blue-600" : "text-[#606060]"}`}
                                >
                                  <HiHandThumbUp
                                    className={`h-4 w-4 ${isCommentLikedByUser(comment) ? "text-blue-600" : "text-current"}`}
                                  />
                                  <span>{comment.likes || 0}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDislikeComment(comment._id)
                                  }
                                  className={`flex items-center gap-2 ${isCommentDislikedByUser(comment) ? "text-red-600" : "text-[#606060]"}`}
                                >
                                  <HiHandThumbUp
                                    className={`h-4 w-4 rotate-180 ${isCommentDislikedByUser(comment) ? "text-red-600" : "text-current"}`}
                                  />
                                  <span>{comment.dislikes || 0}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleReplyTo(comment.user?.username)
                                  }
                                  className="text-sm text-[#606060]"
                                >
                                  Reply
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="relative" ref={menuRef} data-comment-menu>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuId(
                              activeMenuId === comment._id ? null : comment._id,
                            )
                          }
                          className="rounded-full p-1 hover:bg-[#f2f2f2]"
                          aria-label="Comment options"
                        >
                          <HiEllipsisVertical className="h-4 w-4 text-[#606060]" />
                        </button>

                        {activeMenuId === comment._id && (
                          <div className="absolute right-0 top-8 z-10 w-40 rounded-lg border border-[#e5e5e5] bg-white p-1 shadow-md">
                            {isOwner ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCommentId(comment._id);
                                    setEditingText(comment.text);
                                    setActiveMenuId(null);
                                  }}
                                  className="flex items-center gap-2 block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-[#f2f2f2]"
                                >
                                  <HiPencil className="h-4 w-4" /> Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteCandidateId(comment._id)
                                  }
                                  className="flex items-center gap-2 block w-full rounded-md px-2 py-1.5 text-left text-sm text-red-500 hover:bg-[#f2f2f2]"
                                >
                                  <HiTrash className="h-4 w-4" /> Delete
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!currentUser) {
                                      setShowSignInPrompt(true);
                                    } else {
                                      handleReportComment(comment._id);
                                      setActiveMenuId(null);
                                    }
                                  }}
                                  className="flex items-center gap-2 block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-[#f2f2f2]"
                                >
                                  <HiFlag className="h-4 w-4" /> Report
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {deleteCandidateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDeleteCandidateId(null)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-lg bg-white p-4 shadow-lg">
            <h3 className="text-lg font-semibold">Delete comment</h3>
            <p className="mt-2 text-sm text-[#606060]">
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteCandidateId(null)}
                className="rounded-md border px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await handleDeleteComment(deleteCandidateId);
                  setDeleteCandidateId(null);
                }}
                className="rounded-md bg-red-600 px-3 py-1.5 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
