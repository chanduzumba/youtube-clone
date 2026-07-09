import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  HiEllipsisVertical,
  HiHandThumbUp,
  HiPencil,
  HiTrash,
  HiFlag,
} from "react-icons/hi2";
import { FaCircleUser } from "react-icons/fa6";
import { useAuth } from "../hooks/useAuth";
import { formatRelativeTime } from "../utils/videoHelpers";

function Comments({ videoId }) {
  // auth fields
  const { currentUser, authHeaders, getCurrentUserId } = useAuth();

  // state variables to manage comments
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [deleteCandidateId, setDeleteCandidateId] = useState(null);
  // ref to manage click outside for menu
  const menuRef = useRef(null);

  // Checks if the current user has liked a specific comment
  const isCommentLikedByUser = (comment) => {
    const userId = getCurrentUserId();
    if (!userId) return false;
    return [...(comment?.likedby || []), ...(comment?.likedBy || [])].some(
      (item) => String(item?._id || item?.id || item) === String(userId),
    );
  };

  // Checks if the current user has disliked a specific comment
  const isCommentDislikedByUser = (comment) => {
    const userId = getCurrentUserId();
    if (!userId) return false;
    return [
      ...(comment?.dislikedby || []),
      ...(comment?.dislikedBy || []),
    ].some((item) => String(item?._id || item?.id || item) === String(userId));
  };

  useEffect(() => {
    const fetchComments = async () => {
      if (!videoId) return;

      try {
        // api call to fetch comments for the given video
        const response = await axios.get(
          `http://localhost:5000/api/comments/video/${videoId}/`,
        );
        setComments(response.data?.comments || []);
      } catch (err) {
        setComments([]);
      }
    };

    fetchComments();
  }, [videoId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // close menu when clicking outside any element marked with data-comment-menu
      if (!event.target.closest("[data-comment-menu]")) {
        setActiveMenuId(null);
      }
    };

    // Add event listener to detect clicks outside the menu
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // refreshes the comments list by fetching the latest comments from the server
  const refreshComments = async () => {
    const response = await axios.get(
      `http://localhost:5000/api/comments/video/${videoId}/`,
    );
    setComments(response.data?.comments || []);
  };

  // Handles adding a new comment to the video
  const handleAddComment = async () => {
    if (!commentText.trim() || !videoId) return;
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
          video: videoId,
          text: commentText.trim(),
        },
        authHeaders,
      );
      setCommentText("");
      await refreshComments();
    } catch (err) {
      setCommentError(err.response?.data?.message || "Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };
 
  // Handles deleting a comment by sending a delete request to the server
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
      await refreshComments();
      setActiveMenuId(null);
    } catch (err) {
      setCommentError(
        err.response?.data?.message || "Failed to delete comment",
      );
    }
  };

  // Handles editing a comment by sending an update request to the server
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
      await refreshComments();
      setEditingCommentId(null);
      setEditingText("");
      setActiveMenuId(null);
    } catch (err) {
      setCommentError(
        err.response?.data?.message || "Failed to update comment",
      );
    }
  };

  // Handles liking a comment by sending a like request to the server
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
      await refreshComments();
    } catch (err) {
      // ignore errors for now
    }
  };

  // handles disliking a comment by sending a dislike request to the server
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
      await refreshComments();
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#0f0f0f]">Comments</h2>
        <p className="text-sm text-[#606060]">{comments.length} comments</p>
      </div>

      {/* Comment Input */}
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
            {/* Sign In Prompt */}
        {showSignInPrompt && (
          <div className="absolute left-4 top-[-90px] z-20 w-72 rounded-xl bg-white p-4 shadow-lg">
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
      </div>

{/* Comments List */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <div className="rounded-xl p-4 text-sm text-[#606060]">
            No comments yet. Be the first to comment.
          </div>
        ) : (
          comments.map((comment) => {
            const currentUserId =
              currentUser?._id || currentUser?.id || currentUser?.userId || null;
            const commentUserId =
              comment.user?._id || comment.user?.id || null;
            const isOwner =
              currentUserId && String(commentUserId) === String(currentUserId);
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
                              onClick={() => handleDislikeComment(comment._id)}
                              className={`flex items-center gap-2 ${isCommentDislikedByUser(comment) ? "text-red-600" : "text-[#606060]"}`}
                            >
                              <HiHandThumbUp
                                className={`h-4 w-4 rotate-180 ${isCommentDislikedByUser(comment) ? "text-red-600" : "text-current"}`}
                              />
                              <span>{comment.dislikes || 0}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReplyTo(comment.user?.username)}
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
                              onClick={() => setDeleteCandidateId(comment._id)}
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
    </div>
  );
}

export default Comments;
