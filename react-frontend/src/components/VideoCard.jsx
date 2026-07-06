import { useMemo } from "react";
import { HiEllipsisVertical } from "react-icons/hi2";

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

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const VideoCard = ({ video }) => {
  const relativeTime = useMemo(() => formatRelativeTime(video.createdAt), [video.createdAt]);

  return (
    <article className="w-full max-w-[320px] cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md">
      <div className="relative">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="h-44 w-full object-cover"
        />
        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-[11px] font-medium text-white">
          {formatDuration(video.duration || 0)}
        </span>
      </div>

      <div className="flex gap-3 p-3">
        <img
          src={video.channel?.logo || video.uploader?.avatar}
          alt={video.channel?.channelName || video.uploader?.username}
          className="mt-1 h-9 w-9 flex-shrink-0 rounded-full object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-semibold text-[#0f0f0f]">
              {video.title}
            </h3>
            <button type="button" aria-label="More options" className="rounded-full p-1 hover:bg-black/5">
              <HiEllipsisVertical className="h-4 w-4 text-[#606060]" />
            </button>
          </div>

          <p className="mt-1 text-sm text-[#606060]">
            {video.channel?.channelName || video.uploader?.username}
          </p>
          <p className="text-sm text-[#606060]">
            {video.views} views • {relativeTime}
          </p>
        </div>
      </div>
    </article>
  );
};

export default VideoCard;
