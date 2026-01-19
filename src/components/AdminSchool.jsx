import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostsContext } from '../context/PostsContext';
import { UserContext } from '../context/UserContext';
import { ClassesContext } from '../context/ClassesContext';
import AdminReports from './AdminReports';
import ClassManagementEnhanced from './ClassManagementEnhanced';
import UserManagement from './UserManagement'; 
import SchoolManagement from './SchoolManagement'; 
import { header, btnPrimary, btnSecondary, btnAccent, smallLink, card } from './ui/styles';

const mockStudentsPerClass = {
  'class_abc123': [
    { id: 1, name: 'Alice Johnson', email: 'alice@student.com' },
    { id: 2, name: 'Bob Smith', email: 'bob@student.com' },
  ],
  'class_xyz789': [{ id: 3, name: 'Charlie Davis', email: 'charlie@student.com' }],
};

export default function AdminSchool() {
  const { addPost, posts = [], deletePost, toggleFavorite, toggleLike } = useContext(PostsContext) || {};
  const { user, signOut } = useContext(UserContext) || {};
  const { classes = [], addClass, updateClass, deleteClass } = useContext(ClassesContext) || {};

  const navigate = useNavigate();

  // UI state
  const [menuOpen, setMenuOpen] = useState(false);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [toast, setToast] = useState('');
  const [selectedClassId, setSelectedClassId] = useState(null);

  // Posts state
  const [editingPostId, setEditingPostId] = useState(null);
  const [adminPosts, setAdminPosts] = useState([]);
  const [postActionMenu, setPostActionMenu] = useState(null);
  const [postFormData, setPostFormData] = useState({
    title: '',
    description: '',
    image: '',
    imagePreview: '',
    video: '',
    videoPreview: '',
    visibility: 'public',
    isPinned: false,
  });

  // File refs
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Initialize from context when available
  useEffect(() => {
    // initialize posts from context if present
    if (Array.isArray(posts) && posts.length) {
      setAdminPosts(posts.map(p => ({ ...p })));
    }
  }, [posts]);

  

  // Small toast helper
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const closeModal = () => {
    setPostModalOpen(false);
    setEditingPostId(null);
    setPostFormData({
      title: '',
      description: '',
      image: '',
      imagePreview: '',
      video: '',
      videoPreview: '',
      visibility: 'public',
      isPinned: false,
    });
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  // File handlers (image/video) with preview
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPostFormData(prev => ({ ...prev, image: file.name, imagePreview: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert('Video size must be less than 50MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPostFormData(prev => ({ ...prev, video: file.name, videoPreview: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setPostFormData(prev => ({ ...prev, image: '', imagePreview: '' }));
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const removeVideo = () => {
    setPostFormData(prev => ({ ...prev, video: '', videoPreview: '' }));
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  // Post CRUD
  const openPostModal = (postToEdit = null) => {
    if (postToEdit) {
      setEditingPostId(postToEdit.id);
      setPostFormData({
        title: postToEdit.title || '',
        description: postToEdit.description || '',
        image: postToEdit.image || '',
        imagePreview: postToEdit.image || '',
        video: postToEdit.video || '',
        videoPreview: postToEdit.video || '',
        visibility: postToEdit.visibility || 'public',
        isPinned: !!postToEdit.isPinned,
      });
    } else {
      setEditingPostId(null);
      setPostFormData({
        title: '',
        description: '',
        image: '',
        imagePreview: '',
        video: '',
        videoPreview: '',
        visibility: 'public',
        isPinned: false,
      });
    }
    setPostModalOpen(true);
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!postFormData.title.trim() || !postFormData.description.trim()) {
      alert('Please enter both title and description.');
      return;
    }

    if (editingPostId) {
      setAdminPosts(prev => prev.map(p => p.id === editingPostId ? {
        ...p,
        title: postFormData.title,
        description: postFormData.description,
        image: postFormData.imagePreview || postFormData.image || null,
        video: postFormData.videoPreview || postFormData.video || null,
        visibility: postFormData.visibility,
        isPinned: postFormData.isPinned,
        updatedAt: new Date().toISOString(),
      } : p));
      showToast('Post updated successfully!');
    } else {
      const postData = {
        id: Date.now(),
        title: postFormData.title,
        description: postFormData.description,
        timestamp: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        poster: {
          id: user?.email || user?.id || 'admin',
          name: user?.name || 'Admin',
          avatar: user?.profileImage,
        },
        image: postFormData.imagePreview || null,
        video: postFormData.videoPreview || null,
        visibility: postFormData.visibility,
        isPinned: postFormData.isPinned,
        likes: 0,
        favorites: 0,
        comments: [],
      };
      setAdminPosts(prev => [postData, ...prev]);
      if (addPost) addPost(postData);
      showToast('Post created successfully!');
    }
    closeModal();
  };

  const handleDeletePost = (postId, title) => {
    if (!window.confirm(`Delete post "${title}"?`)) return;
    setAdminPosts(prev => prev.filter(p => p.id !== postId));
    if (deletePost) deletePost(postId);
    showToast('Post deleted.');
  };

  const handlePinPost = (postId) => {
    setAdminPosts(prev => prev.map(p => p.id === postId ? { ...p, isPinned: !p.isPinned } : p));
  };

  const handleEditPost = (post) => openPostModal(post);

  const sortedAdminPosts = [...adminPosts].sort((a, b) => {
    if ((a.isPinned ? 1 : 0) !== (b.isPinned ? 1 : 0)) return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
    return new Date(b.timestamp || b.updatedAt || 0) - new Date(a.timestamp || a.updatedAt || 0);
  });

  // Search handler
  const handleSearch = (e) => {
    const q = (e.target.value || '').toLowerCase();
    setSearchQuery(q);
    if (!q) {
      setSearchResults([]);
      return;
    }

    const menuItems = [
      { name: 'Dashboard Overview', section: 'dashboard', type: 'menu' },
      { name: 'Manage Users', section: 'users', type: 'menu' },
      { name: 'Manage Schools', section: 'schools', type: 'menu' }, 
      { name: 'Manage Classes', section: 'classes', type: 'menu' },
      { name: 'View Reports', section: 'reports', type: 'menu' },
    ];

    const postResults = sortedAdminPosts.map(p => ({
      name: p.title,
      description: p.description,
      section: 'dashboard',
      type: 'post',
      postId: p.id,
    }));

    const classResults = (classes || []).map(c => ({
      name: c.className,
      description: `Subject: ${c.subject} | Section: ${c.section}`,
      section: 'classes',
      type: 'class',
      classId: c.id,
    }));
    
    const all = [...menuItems, ...postResults, ...classResults];
    const results = all.filter(item => {
      const name = (item.name || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
    setSearchResults(results);
  };

  const navigateToSearch = (section) => {
    setActiveSection(section);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Render content for main area
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">Admin Dashboard - Full System Activity</h2>;
      case 'users':
        return <UserManagement />;
      case 'schools':
        return <SchoolManagement />;
      case 'classes':
        // Renders Class Management Component
        return <ClassManagement />; // <-- This is the correct call
      
      case 'reports':
        return <AdminReports />;
      default:
        return <h2 className="text-xl font-bold mb-4">Dashboard</h2>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className={header}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛡️</span>
          <div className="text-2xl font-bold">PPC Admin</div>
        </div>

        <div className="relative w-96 hidden md:block">
          <input
            type="text"
            placeholder="Search database..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-2 rounded-full text-gray-800 border-none focus:ring-2 focus:ring-yellow-400 outline-none"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white text-gray-800 rounded-lg shadow-xl mt-2 z-50 max-h-96 overflow-y-auto">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => navigateToSearch(result.section, result.type, result.classId)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b transition"
                >
                  <div className="font-semibold text-sm">{result.name}</div>
                  {result.type === 'post' && <div className="text-xs text-gray-500">{result.description}</div>}
                  {result.type === 'class' && <div className="text-xs text-blue-500">{result.description}</div>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/userHome')} className={btnSecondary}>Go to User View</button>
          <button onClick={() => openPostModal()} className={btnAccent}>➕ Post</button>
          <button onClick={() => setActiveSection('classes')} className={btnPrimary}>📚 Class</button>

          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/50 flex items-center justify-center text-sm font-bold text-white bg-indigo-800"
          >
            {user && user.profileImage ? (
              <img src={user.profileImage} alt="profile" className="w-full h-full object-cover" />
            ) : (
              (user && (user.name || user.email) ? (user.name || user.email)[0] : 'A')
            )}
          </button>

          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="px-3 py-2 rounded hover:bg-blue-800">
              ☰
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-xl z-50">
                <button className="block w-full text-left px-4 py-3 hover:bg-gray-50">⚙️ Settings</button>
                <button
                  className="block w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 border-t"
                  onClick={() => { setMenuOpen(false); if (signOut) signOut(); navigate('/'); }}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        <aside className="w-64 bg-gray-900 text-gray-300 p-6">
          <h3 className="text-xs uppercase font-bold text-gray-500 mb-4">Admin Controls</h3>
          <ul className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'users', label: 'Manage Users', icon: '👥' },
              { id: 'schools', label: 'Manage Schools', icon: '🏫' },
              { id: 'classes', label: 'Manage Classes', icon: '📚' },
              { id: 'reports', label: 'System Reports', icon: '📈' },
            ].map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${activeSection === item.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-800'}`}
                >
                  <span>{item.icon}</span> {item.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          {renderContent()}

          {/* Posts Section (Only displays on dashboard) */}
          {activeSection === 'dashboard' && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">📌 Admin Posts</h3>
                <button onClick={() => openPostModal()} className="bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600">
                  ➕ Create Post
                </button>
              </div>

              <div className="space-y-4">
                {sortedAdminPosts.length > 0 ? (
                  sortedAdminPosts.map(post => (
                    <div key={post.id} className={`bg-white p-6 rounded-lg shadow border ${post.isPinned ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {post.poster?.avatar ? (
                            <img src={post.poster.avatar} alt={post.poster.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold">
                              {post.poster?.name?.[0] || 'A'}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-800">{post.poster?.name || 'Admin'}</p>
                            <p className="text-xs text-gray-500">
                              {post.timestamp ? new Date(post.timestamp).toLocaleDateString() : 'Recently'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {post.isPinned && <span className="text-yellow-600 text-sm font-bold">📌 Pinned</span>}
                          <span className={`text-xs px-2 py-1 rounded-full ${post.visibility === 'public' ? 'bg-green-100 text-green-800' : post.visibility === 'students' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {post.visibility === 'public' ? '🌍 Public' : post.visibility === 'students' ? '👥 Students' : '🔒 Private'}
                          </span>

                          <div className="relative">
                            <button
                              onClick={() => setPostActionMenu(postActionMenu === post.id ? null : post.id)}
                              className="text-gray-600 hover:text-gray-800 p-1"
                            >
                              ⋮
                            </button>
                            {postActionMenu === post.id && (
                              <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-lg z-10 border">
                                <button
                                  onClick={() => { handleEditPost(post); setPostActionMenu(null); }}
                                  className="block w-full text-left px-4 py-2 hover:bg-blue-50 border-b"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => { handlePinPost(post.id); setPostActionMenu(null); }}
                                  className="block w-full text-left px-4 py-2 hover:bg-yellow-50 border-b"
                                >
                                  {post.isPinned ? '📍 Unpin' : '📌 Pin'}
                                </button>
                                <button
                                  onClick={() => { handleDeletePost(post.id, post.title); setPostActionMenu(null); }}
                                  className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <h4 className="font-bold text-gray-900 mb-2 text-lg">{post.title}</h4>
                      <p className="text-gray-700 mb-3">{post.description}</p>

                      {post.image && <img src={post.image} alt="post" className="w-full h-48 object-cover rounded mb-3" />}
                      {post.video && <video src={post.video} controls className="w-full h-48 rounded mb-3" />}

                      <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-4">
                        <button onClick={() => toggleLike && toggleLike(post.id, user?.email || user?.id)} className="hover:text-green-600 flex items-center gap-1">👍 <span>{post.likes || 0}</span></button>
                        <button onClick={() => toggleFavorite && toggleFavorite(post.id, user?.email || user?.id)} className="hover:text-yellow-500 flex items-center gap-1">{(post.favoritedBy || []).includes(user?.email || user?.id) ? '★' : '☆'} <span>{post.favorites || 0}</span></button>
                        <button className="hover:text-gray-800 flex items-center gap-1">💬 <span>{(post.comments || []).length}</span></button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow border text-gray-600 text-center">
                    <p>No posts yet. Click "Create Post" to get started.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* *** FIX APPLIED HERE: REMOVE THE REDUNDANT ClassManagement CALL *** */}
          {/* {activeSection === 'classes' && <ClassManagement userRole="admin" />} */}
        </main>
      </div>

      {/* Post Modal */}
      {postModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold">{editingPostId ? '✏️ Edit Post' : '📢 Create Post'}</h2>
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200">✕</button>
            </div>

            <form className="space-y-4" onSubmit={handlePostSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input type="text" value={postFormData.title} onChange={(e) => setPostFormData(prev => ({ ...prev, title: e.target.value }))} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <textarea rows="4" value={postFormData.description} onChange={(e) => setPostFormData(prev => ({ ...prev, description: e.target.value }))} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
              </div>

              {/* Image */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">📷 Image</label>
                <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                {postFormData.imagePreview ? (
                  <div className="space-y-2">
                    <img src={postFormData.imagePreview} alt="preview" className="w-full h-48 object-cover rounded" />
                    <button type="button" onClick={removeImage} className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600">🗑️ Remove Image</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full border-2 border-dashed border-indigo-300 rounded-lg p-4 text-center hover:bg-indigo-50">
                    <div className="text-indigo-600 font-medium">Click to browse or drag image</div>
                    <div className="text-xs text-gray-500">Max 5MB</div>
                  </button>
                )}
              </div>

              {/* Video */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">🎬 Video</label>
                <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
                {postFormData.videoPreview ? (
                  <div className="space-y-2">
                    <video src={postFormData.videoPreview} controls className="w-full h-48 rounded" />
                    <button type="button" onClick={removeVideo} className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600">🗑️ Remove Video</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => videoInputRef.current?.click()} className="w-full border-2 border-dashed border-indigo-300 rounded-lg p-4 text-center hover:bg-indigo-50">
                    <div className="text-indigo-600 font-medium">Click to browse or drag video</div>
                    <div className="text-xs text-gray-500">Max 50MB</div>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Visibility</label>
                  <select value={postFormData.visibility} onChange={(e) => setPostFormData(prev => ({ ...prev, visibility: e.target.value }))} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                    <option value="public">Public</option>
                    <option value="students">Students Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" checked={postFormData.isPinned} onChange={(e) => setPostFormData(prev => ({ ...prev, isPinned: e.target.checked }))} className="w-4 h-4 rounded" />
                    <span className="ml-2 text-sm font-medium">📌 Pin</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">{editingPostId ? 'Update' : 'Publish'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl z-50 transform transition-all animate-slide-in-bottom border-l-4 border-green-400">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <span className="font-medium">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}