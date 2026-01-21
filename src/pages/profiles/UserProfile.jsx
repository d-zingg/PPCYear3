import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../../context/UserContext";
import { PostsContext } from "../../context/PostsContext";
import { ProfileSkeleton, PostSkeleton, UserProfileMini } from "../../components/LoadingSkeleton";

export default function UserProfile() {
  const { user, updateUser } = useContext(UserContext) || {};
  const { getPostsByUser, toggleLike, toggleFavorite, addComment, updateUserInPosts } =
    useContext(PostsContext) || {};
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const getInitialFormData = () => {
    const baseData = {
      name: user?.name || "",
      phone: user?.phone || "",
      dob: user?.dob || "",
      schoolName: user?.schoolName || "",
      profileImage: user?.profileImage || "",
    };

    if (user?.role === "student") {
      return {
        ...baseData,
        grade: user?.grade || "",
        classSection: user?.classSection || "",
      };
    } else if (user?.role === "teacher") {
      return {
        ...baseData,
        subject: user?.subject || "",
        department: user?.department || "",
      };
    } else if (user?.role === "admin") {
      return { ...baseData, department: user?.department || "" };
    }
    return baseData;
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const userPosts =
    user && getPostsByUser ? getPostsByUser(user.email || user.id) : [];

  // Simulate loading effect (like Facebook)
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Simulate 1 second load time
    return () => clearTimeout(timer);
  }, [user?.email]);

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

  // Show loading skeleton
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow">No user signed in.</div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateUser(formData);
    // Update user info in all their posts
    if (updateUserInPosts) {
      updateUserInPosts(user.email || user.id, formData);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(getInitialFormData());
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Profile Info Card */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold">
                  {(user.name || user.email || "U")[0]}
                </div>
              )}
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="text-2xl font-bold border rounded px-2 py-1"
                    placeholder="Name"
                  />
                ) : (
                  <div className="text-2xl font-bold">
                    {user.name || user.email}
                  </div>
                )}
                <div className="text-sm text-gray-600">{user.role}</div>
              </div>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500 shadow-sm transition"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="bg-emerald-400 text-white px-4 py-2 rounded hover:bg-emerald-500 shadow-sm transition"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {isEditing && (
              <div>
                <strong>Profile Image:</strong>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="ml-2"
                />
              </div>
            )}
            <div>
              <strong>School:</strong>
              {isEditing ? (
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                  className="ml-2 border rounded px-2 py-1 w-full"
                  placeholder="School Name"
                />
              ) : (
                <span className="ml-2">
                  {user.schoolName || "Not specified"}
                </span>
              )}
            </div>
            <div>
              <strong>Phone:</strong>
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="ml-2 border rounded px-2 py-1 w-full"
                  placeholder="Phone Number"
                />
              ) : (
                <span className="ml-2">{user.phone || "Not specified"}</span>
              )}
            </div>
            <div>
              <strong>DOB:</strong>
              {isEditing ? (
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="ml-2 border rounded px-2 py-1"
                />
              ) : (
                <span className="ml-2">{user.dob || "Not specified"}</span>
              )}
            </div>
            <div>
              <strong>Email:</strong> <span className="ml-2">{user.email}</span>
            </div>

            {/* Role-specific fields */}
            {user.role === "student" && (
              <>
                <div>
                  <strong>Grade:</strong>
                  {isEditing ? (
                    <input
                      type="text"
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      className="ml-2 border rounded px-2 py-1 w-full"
                      placeholder="Grade Level"
                    />
                  ) : (
                    <span className="ml-2">
                      {user.grade || "Not specified"}
                    </span>
                  )}
                </div>
                <div>
                  <strong>Class Section:</strong>
                  {isEditing ? (
                    <input
                      type="text"
                      name="classSection"
                      value={formData.classSection}
                      onChange={handleInputChange}
                      className="ml-2 border rounded px-2 py-1 w-full"
                      placeholder="Class Section"
                    />
                  ) : (
                    <span className="ml-2">
                      {user.classSection || "Not specified"}
                    </span>
                  )}
                </div>
              </>
            )}

            {user.role === "teacher" && (
              <>
                <div>
                  <strong>Subject:</strong>
                  {isEditing ? (
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="ml-2 border rounded px-2 py-1 w-full"
                      placeholder="Teaching Subject"
                    />
                  ) : (
                    <span className="ml-2">
                      {user.subject || "Not specified"}
                    </span>
                  )}
                </div>
                <div>
                  <strong>Department:</strong>
                  {isEditing ? (
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="ml-2 border rounded px-2 py-1 w-full"
                      placeholder="Department"
                    />
                  ) : (
                    <span className="ml-2">
                      {user.department || "Not specified"}
                    </span>
                  )}
                </div>
              </>
            )}

            {user.role === "admin" && (
              <div>
                <strong>Department:</strong>
                {isEditing ? (
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="ml-2 border rounded px-2 py-1 w-full"
                    placeholder="Administrative Department"
                  />
                ) : (
                  <span className="ml-2">
                    {user.department || "Not specified"}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* My Posts Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-6">My Posts</h2>

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
                      onClick={() => toggleLike(post.id, user.email || user.id)}
                      className="hover:text-red-600"
                    >
                      ❤️ {post.likes || 0}
                    </button>

                    <button
                      onClick={() => {
                        const text = prompt("Add a comment");
                        if (text)
                          addComment(post.id, {
                            text,
                            author: {
                              name: user.name || user.email,
                              id: user.email || user.id,
                            },
                          });
                      }}
                      className="hover:text-green-600"
                    >
                      💬 {(post.comments || []).length}
                    </button>

                    <button
                      onClick={() =>
                        toggleFavorite(post.id, user.email || user.id)
                      }
                      className="hover:text-yellow-500 flex items-center gap-1"
                    >
                      {(post.favoritedBy || []).includes(user.email || user.id)
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
            <div className="text-center text-gray-500">
              No posts yet. Share your first post!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
