import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UsersContext } from "../../context/UsersContext";
import { PostsContext } from "../../context/PostsContext";
import { ProfileSkeleton, PostSkeleton, UserProfileMini } from "../../components/LoadingSkeleton";

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { allUsers = [] } = useContext(UsersContext) || { allUsers: [] };
  const { getPostsByUser, toggleLike, toggleFavorite, addComment } =
    useContext(PostsContext) || {};
  const [viewerUserId, setViewerUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

  // Get viewer's ID from context or localStorage
  useEffect(() => {
    // Try to get from UserContext first
    const storedUserId =
      localStorage.getItem("ppc_userId") || localStorage.getItem("ppc_email");
    setViewerUserId(storedUserId);
  }, []);

  // Loading effect for profile
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [userId]);

  // Loading effects for posts and profiles
  useEffect(() => {
    setIsLoadingPosts(true);
    setIsLoadingProfiles(true);
    const postsTimer = setTimeout(() => {
      setIsLoadingPosts(false);
    }, 800);
    const profilesTimer = setTimeout(() => {
      setIsLoadingProfiles(false);
    }, 600);
    return () => {
      clearTimeout(postsTimer);
      clearTimeout(profilesTimer);
    };
  }, [userPosts.length]);

  // Find the user
  const profileUser = allUsers.find(
    (u) => u.id === userId || u.email === userId,
  );
  const userPosts =
    profileUser && getPostsByUser
      ? getPostsByUser(profileUser.email || profileUser.id)
      : [];

  // Show loading skeleton
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
          <p className="text-gray-600 mb-6">
            The profile you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500 shadow-sm transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          ← Back
        </button>

        {/* Profile Info Card */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex items-center gap-4 mb-4">
            {profileUser.profileImage ? (
              <img
                src={profileUser.profileImage}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold">
                {(profileUser.name || profileUser.email || "U")[0]}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">
                {profileUser.name || profileUser.email}
              </h1>
              <p className="text-sm text-gray-600 capitalize">
                {profileUser.role || "User"}
              </p>
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            {profileUser.schoolName && (
              <div>
                <strong>School:</strong>
                <span className="ml-2">{profileUser.schoolName}</span>
              </div>
            )}
            {profileUser.phone && (
              <div>
                <strong>Phone:</strong>
                <span className="ml-2">{profileUser.phone}</span>
              </div>
            )}
            {profileUser.dob && (
              <div>
                <strong>DOB:</strong>
                <span className="ml-2">{profileUser.dob}</span>
              </div>
            )}
            {profileUser.role === "student" && profileUser.grade && (
              <div>
                <strong>Grade:</strong>
                <span className="ml-2">{profileUser.grade}</span>
              </div>
            )}
            {profileUser.role === "student" && profileUser.classSection && (
              <div>
                <strong>Class Section:</strong>
                <span className="ml-2">{profileUser.classSection}</span>
              </div>
            )}
            {profileUser.role === "teacher" && profileUser.subject && (
              <div>
                <strong>Subject:</strong>
                <span className="ml-2">{profileUser.subject}</span>
              </div>
            )}
            {profileUser.role === "teacher" && profileUser.department && (
              <div>
                <strong>Department:</strong>
                <span className="ml-2">{profileUser.department}</span>
              </div>
            )}
            {profileUser.role === "admin" && profileUser.department && (
              <div>
                <strong>Department:</strong>
                <span className="ml-2">{profileUser.department}</span>
              </div>
            )}
            <div>
              <strong>Email:</strong>
              <span className="ml-2">{profileUser.email}</span>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-6">
            {profileUser.name || profileUser.email}'s Posts
          </h2>

          {userPosts.length > 0 ? (
            <div className="space-y-6">
              {userPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-6"
                >
                  {/* Post Header */}
                  {isLoadingProfiles ? (
                    <div className="mb-4">
                      <UserProfileMini showTime={true} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {post.poster?.avatar ? (
                          <img
                            src={post.poster.avatar}
                            alt="avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{(post.poster?.name || "A")[0]}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {post.poster?.name || "Anonymous"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(post.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Post Content */}
                  <h3 className="text-lg font-bold mb-2">{post.title}</h3>
                  <p className="mb-4 text-gray-700">{post.description}</p>

                  {/* Image */}
                  {post.image && (
                    <img
                      src={post.image}
                      alt="post"
                      className="w-full max-h-64 object-cover rounded mb-4"
                    />
                  )}

                  {/* Video */}
                  {post.video && (
                    <video controls className="w-full rounded mb-4">
                      <source src={post.video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}

                  {/* Actions */}
                  <div className="flex gap-6 mt-4">
                    <button
                      onClick={() =>
                        viewerUserId && toggleLike(post.id, viewerUserId)
                      }
                      className="hover:text-red-600 cursor-pointer"
                    >
                      ❤️ {post.likes || 0}
                    </button>

                    <button
                      onClick={() => {
                        if (!viewerUserId) {
                          alert("Please sign in to comment");
                          return;
                        }
                        const text = prompt("Add a comment");
                        if (text) {
                          addComment(post.id, {
                            text,
                            author: { name: "Viewer", id: viewerUserId },
                          });
                        }
                      }}
                      className="hover:text-green-600 cursor-pointer"
                    >
                      💬 {(post.comments || []).length}
                    </button>

                    <button
                      onClick={() =>
                        viewerUserId && toggleFavorite(post.id, viewerUserId)
                      }
                      className="hover:text-yellow-600 cursor-pointer flex items-center gap-1"
                    >
                      {(post.favoritedBy || []).includes(viewerUserId)
                        ? "★"
                        : "☆"}{" "}
                      <span>{post.favorites || 0}</span>
                    </button>
                  </div>

                  {/* Comments */}
                  {post.comments?.length > 0 && (
                    <div className="mt-4 border-t pt-3 space-y-2">
                      {post.comments.map((c) => (
                        <div key={c.id} className="text-sm">
                          <span className="font-semibold">
                            {c.author?.name || "Anon"}:
                          </span>{" "}
                          {c.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">No posts yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
