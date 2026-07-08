import { Link } from "react-router-dom";
import { HiMagnifyingGlass, HiArrowLeft } from "react-icons/hi2";

function NotFound() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-[#f9fafb] px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-[#e5e5e5] bg-white p-10 shadow-sm text-center">
        <div className="mx-auto mb-8 h-48 w-48 rounded-full bg-[#f3f4f6] p-8">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#fff3cd] text-[#d63384]">
            <span className="text-5xl">🐒</span>
          </div>
        </div>

        <h1 className="text-4xl font-semibold text-[#0f172a]">This page isn't available</h1>
        <p className="mt-4 text-sm text-[#64748b]">
          Sorry about that. Try searching for something else or go back to the homepage.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-[#111]"
          >
            <HiArrowLeft className="h-4 w-4" />
            Go home
          </Link>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#e5e5e5] px-6 py-3 text-sm font-medium text-[#0f172a] hover:bg-[#f8fafc]"
            onClick={() => window.location.reload()}
          >
            <HiMagnifyingGlass className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound
