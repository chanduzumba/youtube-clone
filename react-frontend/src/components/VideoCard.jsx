import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiEllipsisVertical,
  HiOutlineTrash,
  HiPencilSquare,
} from "react-icons/hi2";
import { formatRelativeTime, formatDuration  } from "../utils/videoHelpers"

const VideoCard = ({ video, isOwner = false, onEdit, onDelete }) => {
  // Controls the visibility of the video actions menu
  const [menuOpen, setMenuOpen] = useState(false);

  // Memoizes the relative upload time to avoid unnecessary recalculations
  const relativeTime = useMemo(
    () => formatRelativeTime(video.createdAt),
    [video.createdAt]
  );

  // Opens or closes the options menu without triggering navigation
  const handleToggleMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setMenuOpen((prev) => !prev);
  };

  // Invokes the parent edit handler
  const handleEditClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setMenuOpen(false);
    onEdit?.(video._id);
  };

  // Invokes the parent delete handler
  const handleDeleteClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setMenuOpen(false);
    onDelete?.(video._id);
  };

  return (
    // Displays a YouTube-style video card
    <article className="w-full max-w-[320px] overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md">
      {/* Thumbnail section */}
      <div className="relative">
        <Link to={`/watch/${video._id}`} className="block">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="h-44 w-full object-cover"
          />

          {/* Video duration badge */}
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-[11px] font-medium text-white">
            {formatDuration(video.duration || 0)}
          </span>
        </Link>

        {/* Owner-only video management menu */}
        {isOwner && (
          <div className="absolute right-3 top-3">
            <button
              type="button"
              aria-label="More options"
              onClick={handleToggleMenu}
              className="rounded-full bg-white/90 p-2 text-[#606060] shadow-sm transition hover:bg-white"
            >
              <HiEllipsisVertical className="h-4 w-4" />
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div className="absolute right-0 top-full z-10 mt-2 w-40 rounded-xl border border-[#e5e5e5] bg-white shadow-lg">
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-[#0f0f0f] hover:bg-[#f8fafc]"
                >
                  <HiPencilSquare className="h-4 w-4" />
                  Edit video
                </button>

                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-[#fef2f2]"
                >
                  <HiOutlineTrash className="h-4 w-4" />
                  Delete video
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video information */}
      <div className="flex gap-3 p-3">
        {/* Channel avatar */}
        <img
          src={video.channel?.logo || video.uploader?.avatar}
          alt={video.channel?.channelName || video.uploader?.username}
          className="mt-1 h-9 w-9 flex-shrink-0 rounded-full object-cover"
        />

        <div className="min-w-0 flex-1">
          {/* Video title */}
          <div className="relative flex items-start justify-between gap-2">
            <div>
              <h3 className="line-clamp-2 text-sm font-semibold text-[#0f0f0f]">
                {video.title}
              </h3>
            </div>
          </div>

          {/* Channel name */}
          <p className="mt-1 text-sm text-[#606060]">
            {video.channel?.channelName || video.uploader?.username}
          </p>

          {/* Views and upload time */}
          <p className="text-sm text-[#606060]">
            {video.views} views • {relativeTime}
          </p>
        </div>
      </div>
    </article>
  );
};

export default VideoCard;