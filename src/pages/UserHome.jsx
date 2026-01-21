import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PostsContext } from "../context/PostsContext";
import { UserContext } from "../context/UserContext";
import { ClassesContext } from "../context/ClassesContext";
import { PostSkeleton, UserProfileMini } from "../components/LoadingSkeleton";
import smpLogo from "../image/smp-logo.png";

export default function UserHome() {
  const navigate = useNavigate();

  const { user, signOut } = useContext(UserContext) || {};
  const { posts, toggleLike, toggleFavorite, addComment, deletePost, updatePost } =
    useContext(PostsContext) || { posts: [] };
  const { classes } = useContext(ClassesContext) || { classes: [] };

  // Refresh user data from localStorage
  const [currentUserData, setCurrentUserData] = useState(null);
  
  useEffect(() => {
    // Load fresh user data from localStorage
    const userEmail = user?.email || localStorage.getItem('ppc_user');
    if (userEmail) {
      const users = JSON.parse(localStorage.getItem('ppc_users') || '[]');
      const userData = users.find(u => u.email === userEmail);
      if (userData) {
        setCurrentUserData(userData);
      }
    }
  }, [user]);

  const displayUser = currentUserData || user;

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [postActionMenu, setPostActionMenu] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    image: '',
    imagePreview: '',
    video: '',
    videoPreview: '',
    visibility: 'public',
    classId: ''
  });
  const editImageInputRef = React.useRef(null);
  const editVideoInputRef = React.useRef(null);

  const currentUser = {
    id: user?.email || user?.id || "current-user",
    name: user?.name || user?.email || "You"
  };
  const userId = user?.id || user?.email || currentUser.id;

  const goToRoleDashboard = () => {
    const actualRole = user?.role || localStorage.getItem("ppc_role");
    if (!actualRole) {
      navigate("/");
      return;
    }
    
    const route = {
      admin: "/admin",
      adminschool: "/admin",
      teacher: "/teacher",
      student: "/student",
      students: "/student"
    }[actualRole.toLowerCase()] || "/userHome";
    
    navigate(route);
  };

  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();

    const inTitle = post.title?.toLowerCase().includes(q);
    const inDesc = post.description?.toLowerCase().includes(q);
    const inPoster = post.poster?.name?.toLowerCase().includes(q);

    const inComments = (post.comments || []).some(
      (c) =>
        c.text?.toLowerCase().includes(q) ||
        c.author?.name?.toLowerCase().includes(q)
    );

    return inTitle || inDesc || inPoster || inComments;
  });

  // Simulate loading effect for posts
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
  }, [posts.length, searchQuery]);

  const handleDeletePost = (postId, title) => {
    if (window.confirm(`Delete post "${title}"?`)) {
      if (deletePost) deletePost(postId);
    }
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setEditFormData({
      title: post.title,
      description: post.description,
      image: post.image || '',
      imagePreview: post.image || '',
      video: post.video || '',
      videoPreview: post.video || '',
      visibility: post.visibility || 'public',
      classId: post.classId || ''
    });
    setEditModalOpen(true);
    setPostActionMenu(null);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingPost(null);
    setEditFormData({ title: '', description: '', image: '', imagePreview: '', video: '', videoPreview: '', visibility: 'public', classId: '' });
    if (editImageInputRef.current) editImageInputRef.current.value = '';
    if (editVideoInputRef.current) editVideoInputRef.current.value = '';
  };

  const handleEditImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditFormData(prev => ({
          ...prev,
          image: file.name,
          imagePreview: e.target?.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert('Video size must be less than 50MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditFormData(prev => ({
          ...prev,
          video: file.name,
          videoPreview: e.target?.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeEditImage = () => {
    setEditFormData(prev => ({ ...prev, image: '', imagePreview: '' }));
    if (editImageInputRef.current) editImageInputRef.current.value = '';
  };

  const removeEditVideo = () => {
    setEditFormData(prev => ({ ...prev, video: '', videoPreview: '' }));
    if (editVideoInputRef.current) editVideoInputRef.current.value = '';
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editFormData.title || !editFormData.description) {
      alert('Please enter both title and description');
      return;
    }

    if (updatePost && editingPost) {
      updatePost(editingPost.id, {
        title: editFormData.title,
        description: editFormData.description,
        image: editFormData.imagePreview || editFormData.image,
        video: editFormData.videoPreview || editFormData.video,
        visibility: editFormData.visibility,
        classId: editFormData.classId
      });
    }
    closeEditModal();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-auto h-16 transform hover:scale-105 transition-transform">
            <img src={smpLogo} alt="SMP Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-3xl font-bold text-[#5b9bd5]">SMP</div>
            <div className="text-sm text-gray-500 font-medium">Community Hub</div>
          </div>
        </div>

        {/* 🔍 Search */}
        <div className="relative flex-1 max-w-md mx-8">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={goToRoleDashboard}
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white font-medium transition-all hover:shadow-lg transform hover:scale-105"
          >
            🏠 My Dashboard
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 border border-gray-200 hover:border-blue-500 transition-all group"
          >
            <div className="w-9 h-9 rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-blue-500 flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 shadow-sm transition-all">
              {(displayUser?.avatar || displayUser?.profileImage) ? (
                <img
                  src={displayUser?.avatar || displayUser?.profileImage}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-blue-700">
                  {((displayUser && (displayUser.name || displayUser.email)) || "U")[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-sm font-semibold text-gray-800">{displayUser?.name || "User"}</div>
              <div className="text-xs text-gray-500 capitalize">{displayUser?.role || "Member"}</div>
            </div>
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all hover:shadow-md"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                <button 
                  onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                  className="block w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors font-medium text-gray-700"
                >
                  ⚙️ Settings
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    if (signOut) signOut();
                    navigate("/");
                  }}
                  className="block w-full text-left px-5 py-3 hover:bg-red-50 text-red-600 border-t border-gray-100 transition-colors font-medium"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">Welcome Back</h1>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Recent Posts</h2>
          {searchQuery && (
            <span className="text-sm text-gray-500 bg-blue-50 px-4 py-2 rounded-lg">
              {filteredPosts.length} result(s) for "<span className="font-semibold">{searchQuery}</span>"
            </span>
          )}
        </div>

        {filteredPosts.length > 0 ? (
          <div className="space-y-6">
            {isLoadingPosts ? (
              // Show loading skeletons
              <>
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
              </>
            ) : (
              // Show actual posts
              filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl p-6 transition-all transform hover:scale-[1.01]"
              >
                {/* Poster */}
                {isLoadingProfiles ? (
                  <div className="mb-4">
                    <UserProfileMini showTime={true} />
                  </div>
                ) : (
                  <div 
                    className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition"
                    onClick={() => {
                      if (post.poster?.email || post.poster?.id) {
                        navigate(`/profile/${post.poster?.email || post.poster?.id}`);
                      }
                    }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden shadow-md">
                      {post.poster?.avatar ? (
                        <img
                          src={post.poster.avatar}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-bold text-blue-600">{(post.poster?.name || "A")[0]}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                        {post.poster?.name || "Anonymous"}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span>{new Date(post.timestamp).toLocaleString()}</span>
                        {post.visibility === 'class' && post.classId && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                            👥 {classes.find(c => c.id === post.classId)?.className || 'Class Only'}
                          </span>
                        )}
                        {(!post.visibility || post.visibility === 'public') && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                            🌍 Public
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Edit/Delete Menu for Post Owner */}
                    {(post.poster?.id === userId || post.poster?.email === userId) && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPostActionMenu(postActionMenu === post.id ? null : post.id);
                          }}
                          className="text-gray-500 hover:text-gray-700 text-2xl font-bold px-2"
                        >
                          ⋮
                        </button>
                        {postActionMenu === post.id && (
                          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(post);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePost(post.id, post.title);
                                setPostActionMenu(null);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <h3 className="text-xl font-bold mb-2 text-gray-900">{post.title}</h3>
                <p className="mb-4 text-gray-700 leading-relaxed">{post.description}</p>

                {/* ✅ IMAGE */}
                {post.image && (
                  <img
                    src={post.image}
                    alt="post"
                    className="w-full max-h-96 object-cover rounded-xl mb-4 shadow-md"
                  />
                )}

                {/* ✅ VIDEO (FIXED) */}
                {post.video && (
                  <video controls className="w-full rounded-xl mb-4 shadow-md">
                    <source src={post.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}

                {/* Actions */}
                <div className="flex gap-6 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => toggleLike(post.id, currentUser.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors font-medium"
                  >
                    ❤️ <span>{post.likes || 0}</span>
                  </button>

                  <button
                    onClick={() => {
                      const text = prompt("Add a comment");
                      if (text)
                        addComment(post.id, {
                          text,
                          author: currentUser
                        });
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-emerald-50 text-gray-700 hover:text-emerald-600 transition-colors font-medium"
                  >
                    💬 <span>{(post.comments || []).length}</span>
                  </button>

                  <button
                    onClick={() => toggleFavorite(post.id, userId)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-yellow-50 text-gray-700 hover:text-yellow-600 transition-colors font-medium"
                  >
                    {(post.favoritedBy || []).includes(userId) ? '★' : '☆'} <span>{post.favorites || 0}</span>
                  </button>
                </div>

                {/* Comments */}
                {post.comments?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    {post.comments.map((c) => (
                      <div key={c.id} className="bg-gray-50 rounded-lg p-3">
                        <span className="font-semibold text-gray-800">
                          {c.author?.name || "Anon"}
                        </span>
                        <span className="text-gray-600 ml-2">{c.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No posts found</p>
            <p className="text-gray-400 text-sm mt-2">Check back later for new content</p>
          </div>
        )}
      </div>

      {/* Edit Post Modal */}
      {editModalOpen && editingPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">✏️ Edit Post</h3>
              <button onClick={closeEditModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Enter post title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md p-2 h-32"
                  placeholder="Write your post content..."
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image (optional)</label>
                <input
                  ref={editImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageSelect}
                  className="hidden"
                />
                {editFormData.imagePreview ? (
                  <div className="relative">
                    <img src={editFormData.imagePreview} alt="preview" className="w-full h-48 object-cover rounded" />
                    <button
                      type="button"
                      onClick={removeEditImage}
                      className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => editImageInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50"
                  >
                    📷 Click to upload image
                  </button>
                )}
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Video (optional)</label>
                <input
                  ref={editVideoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleEditVideoSelect}
                  className="hidden"
                />
                {editFormData.videoPreview ? (
                  <div className="relative">
                    <video src={editFormData.videoPreview} controls className="w-full h-48 rounded" />
                    <button
                      type="button"
                      onClick={removeEditVideo}
                      className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => editVideoInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50"
                  >
                    🎥 Click to upload video
                  </button>
                )}
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">👁️ Who can see this post?</label>
                <select
                  value={editFormData.visibility}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, visibility: e.target.value, classId: e.target.value === 'class' ? prev.classId : '' }))}
                  className="w-full border border-gray-300 rounded-md p-2 bg-white"
                >
                  <option value="public">🌍 Public - Everyone can see</option>
                  <option value="class">👥 Specific Class Only</option>
                </select>
              </div>

              {/* Class Selection */}
              {editFormData.visibility === 'class' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
                  <select
                    value={editFormData.classId}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, classId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md p-2 bg-white"
                    required
                  >
                    <option value="">-- Choose a class --</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.className} ({cls.section})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  ✅ Update Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
