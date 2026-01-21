// Full contents of src/components/TeacherDashboard.jsx (updated)
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { PostsContext } from '../context/PostsContext';
import { AssignmentsContext } from '../context/AssignmentsContext';
import { ClassesContext } from '../context/ClassesContext';
import ClassManagementEnhanced from '../features/admin/ClassManagementEnhanced';
import { btnAccent } from '../components/ui/styles';
import { PostSkeleton, UserProfileMini } from '../components/LoadingSkeleton';

export default function TeacherDashboard() {
  // --- State and Context Initialization ---
  const [menuOpen, setMenuOpen] = useState(false);
  const { signOut, user } = useContext(UserContext) || {};
  const { posts = [], addPost, toggleLike, toggleFavorite } = useContext(PostsContext) || {};
  const { assignments = [], addAssignment, updateAssignment, deleteAssignment } = useContext(AssignmentsContext) || {};
  const { classes = [] } = useContext(ClassesContext) || {};
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Filter teacher's classes
  const teacherClasses = classes.filter(c => c.teacherId === user?.email);

  // Assignment Management States
  const [editingAssignment, setEditingAssignment] = useState(null);

  // ENHANCED: Post management states matching admin
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [teacherPosts, setTeacherPosts] = useState([]);
  const [postActionMenu, setPostActionMenu] = useState(null);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [postFormData, setPostFormData] = useState({
    title: '',
    description: '',
    image: '',
    imagePreview: '',
    video: '',
    videoPreview: '',
    visibility: 'public',
    isPinned: false
  });

  // File input refs
  const imageInputRef = React.useRef(null);
  const videoInputRef = React.useRef(null);

  // --- Toast notification ---
  const [toast, setToast] = useState('');
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  // --- Assignment Management Functions ---
  const handlePostOrEditAssignment = (assignmentData) => {
    if (assignmentData.id) {
      updateAssignment(assignmentData.id, assignmentData);
      showToast(`Assignment '${assignmentData.title}' updated successfully!`);
    } else {
      addAssignment(assignmentData);
      showToast(`New Assignment '${assignmentData.title}' posted!`);
    }
    setEditingAssignment(null);
    setActiveSection('assignments');
  };

  const handleDeleteAssignment = (assignmentId, title) => {
    if (window.confirm(`Are you sure you want to delete the assignment: '${title}'?`)) {
      deleteAssignment(assignmentId);
      showToast(`Assignment '${title}' deleted.`);
    }
  };

  // ENHANCED: Post Management Functions (matching admin)
  const closePostModal = () => {
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
      isPinned: false
    });
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const openPostModal = (postToEdit = null) => {
    if (postToEdit) {
      setEditingPostId(postToEdit.id);
      setPostFormData({
        title: postToEdit.title,
        description: postToEdit.description,
        image: postToEdit.image || '',
        imagePreview: postToEdit.image || '',
        video: postToEdit.video || '',
        videoPreview: postToEdit.video || '',
        visibility: postToEdit.visibility || 'public',
        isPinned: postToEdit.isPinned || false
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
        isPinned: false
      });
    }
    setPostModalOpen(true);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setPostFormData(prev => ({
          ...prev,
          image: file.name,
          imagePreview: e.target?.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert('Video size must be less than 50MB');
        return;
      }
      if (!file.type.startsWith('video/')) {
        alert('Please select a valid video file');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setPostFormData(prev => ({
          ...prev,
          video: file.name,
          videoPreview: e.target?.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPostFormData(prev => ({
      ...prev,
      image: '',
      imagePreview: '',
    }));
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const removeVideo = () => {
    setPostFormData(prev => ({
      ...prev,
      video: '',
      videoPreview: '',
    }));
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  // Loading effect for posts
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
  }, [teacherPosts.length]);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!postFormData.title || !postFormData.description) {
      alert('Please enter both title and description.');
      return;
    }

    if (editingPostId) {
      setTeacherPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === editingPostId
            ? {
                ...p,
                title: postFormData.title,
                description: postFormData.description,
                image: postFormData.imagePreview || postFormData.image,
                video: postFormData.videoPreview || postFormData.video,
                visibility: postFormData.visibility,
                isPinned: postFormData.isPinned,
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
      showToast(`Post "${postFormData.title}" updated successfully!`);
    } else {
      const postData = {
        id: Date.now(),
        title: postFormData.title,
        description: postFormData.description,
        timestamp: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        poster: {
          id: user?.email || user?.id,
          name: user?.name || 'Teacher',
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
      setTeacherPosts(prevPosts => [postData, ...prevPosts]);
      if (addPost) addPost(postData);
      showToast(`Post "${postFormData.title}" created successfully!`);
    }
    closePostModal();
  };

  const handleDeletePost = (postId, title) => {
    if (window.confirm(`Delete post "${title}"?`)) {
      setTeacherPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
      showToast(`Post "${title}" deleted successfully!`);
    }
  };

  const handlePinPost = (postId) => {
    setTeacherPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId ? { ...p, isPinned: !p.isPinned } : p
      )
    );
  };

  const handleEditPost = (post) => {
    openPostModal(post);
  };

  // Sort posts: pinned first, then by timestamp
  const sortedTeacherPosts = [...teacherPosts].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return b.isPinned - a.isPinned;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  // --- Content Components ---

  const MyClassesContent = () => <ClassManagementEnhanced userRole="teacher" />;

  const AssignmentManagementContent = () => {
    const classAssignments = assignments.filter(a => 
      teacherClasses.some(c => c.id === a.classId)
    );

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">📋 Assignment Management</h2>
          <button
            onClick={() => { setActiveSection('postAssignment'); setEditingAssignment(null); }}
            className="bg-emerald-400 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition font-semibold shadow-sm"
          >
            ➕ Create New Assignment
          </button>
        </div>

        {classAssignments.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {classAssignments.map(assignment => (
              <div key={assignment.id} className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{assignment.title}</h3>
                    <p className="text-gray-700 mb-3">{assignment.description}</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-gray-600">Class:</span>
                        <div className="text-gray-700">{getClassName(assignment.classId)}</div>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-600">Due Date:</span>
                        <div className="text-gray-700">{new Date(assignment.dueDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-600">Points:</span>
                        <div className="text-gray-700">{assignment.points}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => { setEditingAssignment(assignment); setActiveSection('postAssignment'); }}
                      className="bg-blue-400 text-white px-3 py-2 rounded hover:bg-blue-500 transition text-sm shadow-sm"
                      title="Edit assignment"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(assignment.id, assignment.title)}
                      className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition text-sm"
                      title="Delete assignment"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow border text-center text-gray-600">
            <p className="text-lg mb-4">📭 No assignments yet</p>
            <p>Create an assignment to get started.</p>
          </div>
        )}
      </div>
    );
  };

  const PostAssignmentForm = ({ onSubmit, initialData }) => {
    const isEditing = !!initialData;
    const availableClasses = teacherClasses.filter(c => c.teacherId === user?.id);
  
    const [formData, setFormData] = useState({
      title: initialData?.title || '',
      description: initialData?.description || '',
      classId: initialData?.classId || (availableClasses.length > 0 ? availableClasses[0].id : ''),
      dueDate: initialData?.dueDate || '',
      points: initialData?.points || 100,
      id: initialData?.id || null,
    });
  
    const handleChange = (e) => {
      const { name, value, type } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value,
      }));
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!availableClasses.find(c => c.id === formData.classId)) {
        alert('Please select a valid class');
        return;
      }
      onSubmit(formData);
    };
  
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-green-700">{isEditing ? '✏️ Edit Assignment' : '➕ Post New Assignment'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Assign to Class</label>
            {availableClasses.length > 0 ? (
              <select name="classId" value={formData.classId} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                {availableClasses.map(c => (
                  <option key={c.id} value={c.id}>{c.className} ({c.subject})</option>
                ))}
              </select>
            ) : (
              <div className="mt-1 p-3 bg-yellow-50 border border-yellow-300 rounded text-sm text-yellow-800">
                📚 No classes found. Create a class first in "My Classes" section.
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Total Points</label>
              <input type="number" name="points" value={formData.points} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
          </div>
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => { setActiveSection('assignments'); setEditingAssignment(null); }}
              className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-400 text-white py-2 px-4 rounded-md hover:bg-emerald-500 transition shadow-sm"
            >
              {isEditing ? 'Save Changes' : 'Post Assignment'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // --- Render Logic ---

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <h2 className="text-xl font-bold mb-4">Dashboard Overview</h2>;
      case 'classes':
        return <MyClassesContent />;
      
      case 'assignments':
        return <AssignmentManagementContent />;
      case 'postAssignment':
        return <PostAssignmentForm 
          onSubmit={handlePostOrEditAssignment} 
          initialData={editingAssignment} 
        />;
      case 'grades':
        return <h2 className="text-xl font-bold mb-4">Grade Management</h2>;
      default:
        return <h2 className="text-xl font-bold mb-4">Dashboard</h2>;
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const menuItems = [
      { name: 'Dashboard Overview', section: 'dashboard', type: 'menu' },
      { name: 'My Classes', section: 'classes', type: 'menu' },
      { name: 'Assignments', section: 'assignments', type: 'menu' },
      { name: 'Grade Management', section: 'grades', type: 'menu' }
    ];
    
    const classResults = teacherClasses.map(c => ({
      name: c.name,
      description: `Course Code: ${c.courseCode} | Schedule: ${c.schedule}`,
      section: 'classes',
      type: 'class',
      classId: c.id
    }));

    const assignmentResults = assignments.map(a => ({
      name: `Assignment: ${a.title}`,
      description: `For: ${getClassName(a.classId)} | Due: ${a.dueDate}`,
      section: 'assignments',
      type: 'assignment',
      assignmentId: a.id
    }));

    const postResults = sortedTeacherPosts.map(post => ({
      name: post.title,
      description: post.description,
      section: 'dashboard',
      type: 'post',
      postId: post.id
    }));

    const allItems = [...menuItems, ...postResults, ...classResults, ...assignmentResults];
    const results = allItems.filter(item => {
      const itemName = item.name.toLowerCase();
      const itemDesc = (item.description || '').toLowerCase();
      return itemName.includes(query) || itemDesc.includes(query);
    });

    setSearchResults(results);
  };

  const navigateToSearch = (section, type, id) => {
    if (type === 'class') {
      setActiveSection('classes');
    } else if (type === 'assignment') {
      setActiveSection('assignments'); 
    } else {
      setActiveSection(section);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
            <span className="text-2xl">🎓</span>
          </div>
          <div>
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">PPC Teacher</div>
            <div className="text-xs text-gray-500 font-medium">Teaching Portal</div>
          </div>
        </div>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search classes, posts..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-2 rounded text-gray-800"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white text-gray-800 rounded shadow-lg mt-1 z-50 max-h-96 overflow-y-auto">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => navigateToSearch(result.section, result.type, result.classId || result.assignmentId)}
                  className="w-full text-left px-4 py-2 hover:bg-green-100 border-b last:border-b-0"
                >
                  <div className="font-semibold text-sm">{result.name}</div>
                  {result.type === 'post' && (
                    <div className="text-xs text-gray-600 truncate">{result.description}</div>
                  )}
                  {result.type === 'class' && (
                    <div className="text-xs text-green-500">Class: {result.description.split('|')[0].trim()}</div>
                  )}
                  {result.type === 'assignment' && (
                    <div className="text-xs text-indigo-500">{result.description}</div>
                  )}
                  {result.type === 'menu' && (
                    <div className="text-xs text-gray-500">Menu</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Profile and Menu - Create Post in navbar */}
        <div className="flex items-center gap-4">
          <button onClick={() => openPostModal()} className={btnAccent} title="Create a new post">➕ Create Post</button>
          <Link
            to="/userHome"
            className="bg-indigo-400 hover:bg-indigo-500 text-white px-4 py-2 rounded transition font-semibold shadow-sm"
            title="Go to Home Dashboard"
          >
            🏠 Home
          </Link>
          <button
            onClick={() => navigate('/profile')}
            title="My Profile"
            className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center"
          >
            {user && user.profileImage ? (
              <img src={user.profileImage} alt="profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm">{(user && (user.name || user.email) ? (user.name || user.email)[0] : 'T')}</span>
            )}
          </button>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="px-4 py-2 rounded hover:bg-emerald-500 transition"
            >
              Menu ▼
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded shadow-lg z-10">
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  ⚙️ Settings
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 border-t"
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
        {/* Sidebar */}
        <aside className="w-72 bg-white/50 backdrop-blur-sm border-r border-gray-200/50 p-6">
          <div className="mb-8">
            <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-1">Navigation</h3>
            <div className="h-1 w-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full"></div>
          </div>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => { setActiveSection('dashboard'); setEditingAssignment(null); }}
                className={`w-full text-left px-5 py-3.5 rounded-xl transition-all font-medium group ${activeSection === 'dashboard' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30' : 'hover:bg-white/80 text-gray-700 hover:shadow-md'}`}
              >
                <span className="text-xl mr-3">📊</span>
                <span className="group-hover:translate-x-1 inline-block transition-transform">Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => { setActiveSection('classes'); setEditingAssignment(null); }}
                className={`w-full text-left px-5 py-3.5 rounded-xl transition-all font-medium group ${activeSection === 'classes' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30' : 'hover:bg-white/80 text-gray-700 hover:shadow-md'}`}
              >
                <span className="text-xl mr-3">📚</span>
                <span className="group-hover:translate-x-1 inline-block transition-transform">My Classes</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => { setActiveSection('assignments'); setEditingAssignment(null); }}
                className={`w-full text-left px-5 py-3.5 rounded-xl transition-all font-medium group ${activeSection === 'assignments' || activeSection === 'postAssignment' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30' : 'hover:bg-white/80 text-gray-700 hover:shadow-md'}`}
              >
                <span className="text-xl mr-3">✏️</span>
                <span className="group-hover:translate-x-1 inline-block transition-transform">Assignments</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => { setActiveSection('grades'); setEditingAssignment(null); }}
                className={`w-full text-left px-5 py-3.5 rounded-xl transition-all font-medium group ${activeSection === 'grades' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30' : 'hover:bg-white/80 text-gray-700 hover:shadow-md'}`}
              >
                <span className="text-xl mr-3">📝</span>
                <span className="group-hover:translate-x-1 inline-block transition-transform">Grades</span>
              </button>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderContent()}

          {/* ENHANCED: Posts section matching admin */}
          {activeSection === 'dashboard' && (
            <div className="mt-8">
              <div className="flex items-center mb-6">
                <h3 className="text-2xl font-bold">📌 My Posts</h3>
              </div>

              <div className="space-y-4">
                {isLoadingPosts ? (
                  <>
                    <PostSkeleton />
                    <PostSkeleton />
                    <PostSkeleton />
                  </>
                ) : sortedTeacherPosts.length > 0 ? (
                  sortedTeacherPosts.map(post => (
                    <div key={post.id} className={`bg-white p-6 rounded-lg shadow border transition ${post.isPinned ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        {isLoadingProfiles ? (
                          <div className="flex-1">
                            <UserProfileMini showTime={true} />
                          </div>
                        ) : (
                          <button
                            onClick={() => navigate(`/profile/${post.poster?.email || post.poster?.id}`)}
                            className="flex items-center gap-3 hover:opacity-80 cursor-pointer text-left"
                          >
                            {post.poster?.avatar ? (
                              <img src={post.poster.avatar} alt={post.poster.name} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-sm font-bold">
                                {post.poster?.name?.[0] || 'T'}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-blue-600 hover:text-blue-800">{post.poster?.name || 'Teacher'}</p>
                              <p className="text-xs text-gray-500">
                                {post.timestamp ? new Date(post.timestamp).toLocaleDateString() : 'Recently'}
                              </p>
                            </div>
                          </button>
                        )}

                        {/* Status & Menu */}
                        <div className="flex items-center gap-2">
                          {post.isPinned && <span className="text-yellow-600 text-sm font-bold">📌 Pinned</span>}
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            post.visibility === 'public' ? 'bg-green-100 text-green-800' : 
                            post.visibility === 'students' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {post.visibility === 'public' ? '🌍 Public' : 
                             post.visibility === 'students' ? '👥 Students' : '🔒 Private'}
                          </span>

                          {/* Action Menu */}
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
                                  onClick={() => {
                                    handleEditPost(post);
                                    setPostActionMenu(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 hover:bg-blue-50 border-b transition"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => {
                                    handlePinPost(post.id);
                                    setPostActionMenu(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 hover:bg-yellow-50 border-b"
                                >
                                  {post.isPinned ? '📍 Unpin' : '📌 Pin'}
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeletePost(post.id, post.title);
                                    setPostActionMenu(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <h4 className="font-bold text-gray-900 mb-2 text-lg">{post.title}</h4>
                      <p className="text-gray-700 mb-3">{post.description}</p>

                      {/* Media */}
                      {post.image && (
                        <img src={post.image} alt="post" className="w-full h-48 object-cover rounded mb-3" />
                      )}
                      {post.video && (
                        <video src={post.video} controls className="w-full h-48 rounded mb-3" />
                      )}

                      {/* Engagement */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-4">
                        <button onClick={() => toggleLike && toggleLike(post.id, user?.id || user?.email)} className="hover:text-green-600 flex items-center gap-1">👍 <span>{post.likes || 0}</span></button>
                        <button onClick={() => toggleFavorite && toggleFavorite(post.id, user?.id || user?.email)} className="hover:text-yellow-500 flex items-center gap-1">{(post.favoritedBy || []).includes(user?.id || user?.email) ? '★' : '☆'} <span>{post.favorites || 0}</span></button>
                        <button className="hover:text-gray-800 flex items-center gap-1">💬 <span>{(post.comments || []).length}</span></button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow border text-gray-600 text-center">
                    <p>No posts yet. Click "Create Post" button in the navbar to share an announcement.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ENHANCED: Post Modal matching admin */}
      {postModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={closePostModal}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold">{editingPostId ? '✏️ Edit Post' : '📢 Create Post'}</h2>
              <button onClick={closePostModal} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200">✕</button>
            </div>
            
            <form className="space-y-4" onSubmit={handlePostSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input 
                  type="text" 
                  value={postFormData.title}
                  onChange={(e) => setPostFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <textarea 
                  rows="4" 
                  value={postFormData.description}
                  onChange={(e) => setPostFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>

              {/* Image Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">📷 Image</label>
                <input 
                  ref={imageInputRef}
                  type="file" 
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                
                {postFormData.imagePreview ? (
                  <div className="space-y-2">
                    <img src={postFormData.imagePreview} alt="preview" className="w-full h-48 object-cover rounded" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
                    >
                      🗑️ Remove Image
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-indigo-300 rounded-lg p-4 text-center hover:bg-indigo-50"
                  >
                    <div className="text-indigo-600 font-medium">Click to browse or drag image</div>
                    <div className="text-xs text-gray-500">Max 5MB</div>
                  </button>
                )}
              </div>

              {/* Video Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">🎬 Video</label>
                <input 
                  ref={videoInputRef}
                  type="file" 
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
                
                {postFormData.videoPreview ? (
                  <div className="space-y-2">
                    <video src={postFormData.videoPreview} controls className="w-full h-48 rounded" />
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
                    >
                      🗑️ Remove Video
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-indigo-300 rounded-lg p-4 text-center hover:bg-indigo-50"
                  >
                    <div className="text-indigo-600 font-medium">Click to browse or drag video</div>
                    <div className="text-xs text-gray-500">Max 50MB</div>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Visibility</label>
                  <select 
                    value={postFormData.visibility}
                    onChange={(e) => setPostFormData(prev => ({ ...prev, visibility: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="public">Public</option>
                    <option value="students">Students Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={postFormData.isPinned}
                      onChange={(e) => setPostFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
                      className="w-4 h-4 rounded"
                    />
                    <span className="ml-2 text-sm font-medium">📌 Pin</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closePostModal} className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-indigo-400 text-white py-2 rounded hover:bg-indigo-500 shadow-sm transition">
                  {editingPostId ? 'Update Post' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-6 py-4 rounded-lg shadow-2xl z-50 flex items-center gap-3">
          <span className="text-green-400">✓</span>
          <span className="font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
}