import React from 'react';

// Shimmer animation for skeleton loading
export const Shimmer = () => (
  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
);

// Mini User Profile Skeleton (for post headers, comments, etc.)
export const UserProfileMini = ({ showTime = false }) => {
  return (
    <div className="flex items-center gap-3 animate-pulse">
      {/* Avatar skeleton */}
      <div className="relative w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
        <Shimmer />
      </div>
      {/* Name and time skeleton */}
      <div className="flex-1 space-y-2">
        <div className="relative h-4 w-32 bg-gray-200 rounded overflow-hidden">
          <Shimmer />
        </div>
        {showTime && (
          <div className="relative h-3 w-24 bg-gray-200 rounded overflow-hidden">
            <Shimmer />
          </div>
        )}
      </div>
    </div>
  );
};

// Profile skeleton loader (Facebook-style)
export const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen p-8 bg-gray-50 animate-pulse">
      <div className="max-w-4xl mx-auto">
        {/* Profile Info Card Skeleton */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Avatar skeleton */}
              <div className="relative w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
                <Shimmer />
              </div>
              <div className="space-y-2">
                {/* Name skeleton */}
                <div className="relative h-8 w-48 bg-gray-200 rounded overflow-hidden">
                  <Shimmer />
                </div>
                {/* Role skeleton */}
                <div className="relative h-4 w-24 bg-gray-200 rounded overflow-hidden">
                  <Shimmer />
                </div>
              </div>
            </div>
            {/* Button skeleton */}
            <div className="relative h-10 w-32 bg-gray-200 rounded overflow-hidden">
              <Shimmer />
            </div>
          </div>

          {/* Info fields skeleton */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="relative h-5 w-24 bg-gray-200 rounded overflow-hidden">
                  <Shimmer />
                </div>
                <div className="relative h-5 flex-1 bg-gray-200 rounded overflow-hidden">
                  <Shimmer />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Posts Section Skeleton */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="relative h-6 w-32 bg-gray-200 rounded mb-4 overflow-hidden">
            <Shimmer />
          </div>

          {/* Post cards skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                {/* Post header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    <Shimmer />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="relative h-4 w-32 bg-gray-200 rounded overflow-hidden">
                      <Shimmer />
                    </div>
                    <div className="relative h-3 w-24 bg-gray-200 rounded overflow-hidden">
                      <Shimmer />
                    </div>
                  </div>
                </div>

                {/* Post title */}
                <div className="relative h-5 w-3/4 bg-gray-200 rounded mb-2 overflow-hidden">
                  <Shimmer />
                </div>

                {/* Post description */}
                <div className="space-y-2 mb-3">
                  <div className="relative h-4 w-full bg-gray-200 rounded overflow-hidden">
                    <Shimmer />
                  </div>
                  <div className="relative h-4 w-5/6 bg-gray-200 rounded overflow-hidden">
                    <Shimmer />
                  </div>
                </div>

                {/* Post image placeholder */}
                <div className="relative h-48 w-full bg-gray-200 rounded mb-3 overflow-hidden">
                  <Shimmer />
                </div>

                {/* Post actions */}
                <div className="flex gap-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="relative h-8 w-20 bg-gray-200 rounded overflow-hidden">
                      <Shimmer />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact post skeleton for feed
export const PostSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 animate-pulse">
      {/* Post header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
          <Shimmer />
        </div>
        <div className="flex-1 space-y-2">
          <div className="relative h-4 w-32 bg-gray-200 rounded overflow-hidden">
            <Shimmer />
          </div>
          <div className="relative h-3 w-24 bg-gray-200 rounded overflow-hidden">
            <Shimmer />
          </div>
        </div>
      </div>

      {/* Post content */}
      <div className="space-y-2 mb-3">
        <div className="relative h-4 w-full bg-gray-200 rounded overflow-hidden">
          <Shimmer />
        </div>
        <div className="relative h-4 w-4/5 bg-gray-200 rounded overflow-hidden">
          <Shimmer />
        </div>
      </div>

      {/* Post actions */}
      <div className="flex gap-4 pt-3 border-t">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative h-8 w-20 bg-gray-200 rounded overflow-hidden">
            <Shimmer />
          </div>
        ))}
      </div>
    </div>
  );
};

// Card skeleton for dashboard
export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6 animate-pulse">
      <div className="relative h-6 w-32 bg-gray-200 rounded mb-4 overflow-hidden">
        <Shimmer />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative h-4 w-full bg-gray-200 rounded overflow-hidden">
            <Shimmer />
          </div>
        ))}
      </div>
    </div>
  );
};

// List item skeleton
export const ListSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-3">
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow animate-pulse">
          <div className="relative w-12 h-12 rounded bg-gray-200 overflow-hidden">
            <Shimmer />
          </div>
          <div className="flex-1 space-y-2">
            <div className="relative h-4 w-3/4 bg-gray-200 rounded overflow-hidden">
              <Shimmer />
            </div>
            <div className="relative h-3 w-1/2 bg-gray-200 rounded overflow-hidden">
              <Shimmer />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Dashboard skeleton with sidebar and feed
export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <div className="bg-gradient-to-r from-blue-400 to-cyan-300 px-6 py-4 shadow-lg animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10 rounded-full bg-white/30 overflow-hidden">
              <Shimmer />
            </div>
            <div className="relative h-6 w-32 bg-white/30 rounded overflow-hidden">
              <Shimmer />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative h-9 w-24 bg-white/30 rounded overflow-hidden">
              <Shimmer />
            </div>
            <div className="relative w-10 h-10 rounded-full bg-white/30 overflow-hidden">
              <Shimmer />
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar skeleton */}
        <div className="w-64 bg-white border-r min-h-screen p-4 animate-pulse">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="relative h-10 bg-gray-200 rounded overflow-hidden">
                <Shimmer />
              </div>
            ))}
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="relative h-4 w-24 bg-gray-200 rounded mb-3 overflow-hidden">
                    <Shimmer />
                  </div>
                  <div className="relative h-8 w-16 bg-gray-200 rounded overflow-hidden">
                    <Shimmer />
                  </div>
                </div>
              ))}
            </div>

            {/* Post skeletons */}
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default {
  ProfileSkeleton,
  PostSkeleton,
  CardSkeleton,
  ListSkeleton,
  DashboardSkeleton,
  Shimmer
};
