import React, { useState, useContext, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import { ClassesContext } from '../context/ClassesContext'
import { PostsContext } from '../context/PostsContext'
import { AssignmentsContext } from '../context/AssignmentsContext'
import ClassManagementEnhanced from '../features/admin/ClassManagementEnhanced'
import { UserProfileMini } from '../components/LoadingSkeleton'

export default function StudentDashboard() {
  // StudentDashboard: dashboard for students with navbar, sidebar, and main content.
  // - Navbar: profile, search bar, and menu (settings/logout).
  // - Sidebar: student-specific navigation (Dashboard, Courses, Assignments, Grades).
  // - Main content: displays selected section.
  const [menuOpen, setMenuOpen] = useState(false)
  const { signOut } = useContext(UserContext) || {}
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const { user } = useContext(UserContext) || {}
  const { classes } = useContext(ClassesContext) || { classes: [] }
  const { posts = [], toggleFavorite, addPost, deletePost, updatePost } = useContext(PostsContext) || {}
  const { assignments = [], submitAssignment, getStudentSubmission } = useContext(AssignmentsContext) || {}
  const [submissionModal, setSubmissionModal] = useState(null)
  const [submissionFormData, setSubmissionFormData] = useState({ answer: '', file: null, filePreview: '' })
  const [toast, setToast] = useState('')
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true)
  const fileInputRef = React.useRef(null)
  const [postModalOpen, setPostModalOpen] = useState(false)
  const [postFormData, setPostFormData] = useState({
    title: '',
    description: '',
    image: '',
    imagePreview: '',
    video: '',
    videoPreview: '',
    visibility: 'public',
    targetClass: ''
  })
  const postImageInputRef = React.useRef(null)
  const postVideoInputRef = React.useRef(null)
  const [postActionMenu, setPostActionMenu] = useState(null)
  const [editingPostId, setEditingPostId] = useState(null)

  // Loading effect for profiles
  useEffect(() => {
    setIsLoadingProfiles(true)
    const timer = setTimeout(() => {
      setIsLoadingProfiles(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [posts.length])

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(''), 3000)
  }

  // Students see: classes they're enrolled in + classes published by teacher (have teacherId)
  const assignedClasses = (classes || []).filter(c => {
    if (!user?.email) return false;
    const enrolled = (c.studentList || []).includes(user.email);
    const published = !!c.teacherId; // classes added/assigned by admin or teacher
    return enrolled || published;
  });
  const userId = user?.id || user?.email
  // Filter posts: show public posts + posts visible to student's class
  const visiblePosts = posts.filter(post => {
    if (!post.visibility || post.visibility === 'public') return true
    if (post.visibility === 'students') return true
    if (post.visibility === 'class' && post.targetClass) {
      return assignedClasses.some(c => c.id === post.targetClass || c.className === post.targetClass)
    }
    return false
  })
  const userPosts = visiblePosts.filter(p => p.poster?.id === userId || p.poster?.email === userId || p.poster === userId)

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <h2 className="text-xl font-bold mb-4">Dashboard Overview</h2>
      case 'courses':
          return <ClassManagementEnhanced userRole="student" />
      case 'assignments':
        return (
          <div>
            <h2 className="text-xl font-bold mb-6">📚 My Assignments</h2>
            {assignedClasses.length > 0 ? (
              (() => {
                const studentAssignments = assignments.filter(a =>
                  assignedClasses.some(c => c.id === a.classId)
                );
                return studentAssignments.length > 0 ? (
                  <div className="space-y-4">
                    {studentAssignments.map(assignment => {
                      const assignmentClass = assignedClasses.find(c => c.id === assignment.classId);
                      const dueDate = new Date(assignment.dueDate);
                      const isOverdue = dueDate < new Date();
                      return (
                        <div
                          key={assignment.id}
                          className={`bg-white p-6 rounded-lg shadow border ${
                            isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-2">{assignment.title}</h3>
                              <p className="text-gray-700 mb-4">{assignment.description}</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                <div>
                                  <span className="font-semibold text-gray-600">Class:</span>
                                  <div className="text-gray-700">{assignmentClass?.className || 'Unknown'}</div>
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-600">Due Date:</span>
                                  <div className={`${
                                    isOverdue ? 'text-red-600 font-bold' : 'text-gray-700'
                                  }`}>
                                    {dueDate.toLocaleDateString()}
                                  </div>
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-600">Points:</span>
                                  <div className="text-gray-700">{assignment.points}</div>
                                </div>
                                <div>
                                  <span className="font-semibold text-gray-600">Status:</span>
                                  <div className={`${
                                    isOverdue ? 'text-red-600' : 'text-green-600'
                                  } font-semibold`}>
                                    {isOverdue ? '⏰ Overdue' : '✓ Open'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openSubmissionModal(assignment)}
                                  className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition shadow-sm"
                                >
                                  📤 {getStudentSubmission?.(assignment.id, user?.email) ? 'Update Submission' : 'Submit'}
                                </button>
                                {getStudentSubmission?.(assignment.id, user?.email) && (
                                  <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold">✅ Submitted</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-lg shadow border text-center text-gray-600">
                    <p className="text-lg">📭 No assignments for your classes yet</p>
                  </div>
                );
              })()
            ) : (
              <div className="bg-white p-8 rounded-lg shadow border text-center text-gray-600">
                <p className="text-lg">No assigned classes</p>
                <p className="text-sm mt-2">Enroll in courses to see assignments</p>
              </div>
            )}
          </div>
        )
      case 'grades':
        return <h2 className="text-xl font-bold mb-4">My Grades</h2>
      default:
        return <h2 className="text-xl font-bold mb-4">Dashboard</h2>
    }
  }

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)

    if (!query.trim()) {
      setSearchResults([])
      return
    }

    const searchableItems = [
      { name: 'Dashboard Overview', section: 'dashboard', type: 'menu' },
      { name: 'My Courses', section: 'courses', type: 'menu' },
      { name: 'Assignments', section: 'assignments', type: 'menu' },
      { name: 'My Grades', section: 'grades', type: 'menu' },
      ...assignedClasses.map(c => ({
        name: `${c.className} (${c.subject})`,
        section: 'courses',
        type: 'course',
        details: c
      })),
      ...posts.map(post => ({
        name: post.title,
        description: post.description,
        section: 'dashboard',
        type: 'post',
        postId: post.id
      }))
    ]

    const results = searchableItems.filter(item => {
      const itemName = item.name.toLowerCase()
      const itemDesc = (item.description || '').toLowerCase()
      return itemName.includes(query) || itemDesc.includes(query)
    })

    setSearchResults(results)
  }

  const navigateToSearch = (section, type) => {
    setActiveSection(section)
    setSearchQuery('')
    setSearchResults([])
  }

  const openSubmissionModal = (assignment) => {
    const existingSubmission = getStudentSubmission(assignment.id, user?.email)
    setSubmissionModal(assignment)
    setSubmissionFormData({ 
      answer: existingSubmission?.answer || '', 
      file: null,
      filePreview: existingSubmission?.file || ''
    })
  }

  const closeSubmissionModal = () => {
    setSubmissionModal(null)
    setSubmissionFormData({ answer: '', file: null, filePreview: '' })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('⚠️ File size must be less than 10MB')
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        setSubmissionFormData(prev => ({
          ...prev,
          file: file.name,
          filePreview: e.target?.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeFile = () => {
    setSubmissionFormData(prev => ({
      ...prev,
      file: null,
      filePreview: ''
    }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmissionSubmit = (e) => {
    e.preventDefault()
    if (!submissionFormData.answer.trim() && !submissionFormData.file) {
      showToast('⚠️ Please provide an answer or upload a file')
      return
    }
    if (submitAssignment) {
      submitAssignment(submissionModal.id, {
        studentEmail: user?.email,
        studentName: user?.name || user?.email,
        answer: submissionFormData.answer.trim(),
        file: submissionFormData.filePreview || null,
        fileName: submissionFormData.file || null,
      })
      showToast('✅ Assignment submitted successfully!')
      closeSubmissionModal()
    }
  }

  // Post creation handlers
  const openPostModal = (postToEdit = null) => {
    if (postToEdit) {
      setEditingPostId(postToEdit.id)
      setPostFormData({
        title: postToEdit.title,
        description: postToEdit.description,
        image: postToEdit.image || '',
        imagePreview: postToEdit.image || '',
        video: postToEdit.video || '',
        videoPreview: postToEdit.video || '',
        visibility: postToEdit.visibility || 'public',
        targetClass: postToEdit.targetClass || ''
      })
    } else {
      setEditingPostId(null)
      setPostFormData({
        title: '',
        description: '',
        image: '',
        imagePreview: '',
        video: '',
        videoPreview: '',
        visibility: 'public',
        targetClass: ''
      })
    }
    setPostModalOpen(true)
  }

  const closePostModal = () => {
    setPostModalOpen(false)
    setEditingPostId(null)
    setPostFormData({
      title: '',
      description: '',
      image: '',
      imagePreview: '',
      video: '',
      videoPreview: '',
      visibility: 'public',
      targetClass: ''
    })
    if (postImageInputRef.current) postImageInputRef.current.value = ''
    if (postVideoInputRef.current) postVideoInputRef.current.value = ''
  }

  const handlePostImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('⚠️ Image size must be less than 5MB')
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        setPostFormData(prev => ({
          ...prev,
          image: file.name,
          imagePreview: e.target?.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePostVideoSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        showToast('⚠️ Video size must be less than 50MB')
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        setPostFormData(prev => ({
          ...prev,
          video: file.name,
          videoPreview: e.target?.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removePostImage = () => {
    setPostFormData(prev => ({ ...prev, image: '', imagePreview: '' }))
    if (postImageInputRef.current) postImageInputRef.current.value = ''
  }

  const removePostVideo = () => {
    setPostFormData(prev => ({ ...prev, video: '', videoPreview: '' }))
    if (postVideoInputRef.current) postVideoInputRef.current.value = ''
  }

  const handlePostSubmit = (e) => {
    e.preventDefault()
    if (!postFormData.title || !postFormData.description) {
      showToast('⚠️ Please enter both title and description')
      return
    }

    if (editingPostId) {
      // Update existing post
      if (updatePost) {
        updatePost(editingPostId, {
          title: postFormData.title,
          description: postFormData.description,
          image: postFormData.imagePreview || null,
          video: postFormData.videoPreview || null,
          visibility: postFormData.visibility,
          targetClass: postFormData.targetClass,
        })
        showToast(`✅ Post "${postFormData.title}" updated successfully!`)
      }
    } else {
      // Create new post
      const postData = {
        title: postFormData.title,
        description: postFormData.description,
        timestamp: new Date().toISOString(),
        poster: {
          id: user?.email || user?.id,
          name: user?.name || 'Student',
          avatar: user?.profileImage,
        },
        image: postFormData.imagePreview || null,
        video: postFormData.videoPreview || null,
        visibility: postFormData.visibility,
        targetClass: postFormData.targetClass,
        likes: 0,
        favorites: 0,
        comments: [],
      }

      if (addPost) addPost(postData)
      showToast(`✅ Post "${postFormData.title}" created successfully!`)
    }
    closePostModal()
  }

  const handleDeletePost = (postId, title) => {
    if (window.confirm(`Delete post "${title}"?`)) {
      if (deletePost) deletePost(postId)
      showToast(`🗑️ Post "${title}" deleted`)
      setPostActionMenu(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform">
            <img src={smpLogo} alt="SMP Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-3xl font-bold text-[#5b9bd5]">SMP</div>
            <div className="text-sm text-gray-500 font-medium">Learning Portal</div>
          </div>
        </div>
        <div className="relative w-64">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search courses, assignments..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 w-full bg-white text-gray-800 rounded shadow-lg mt-1 z-50 max-h-64 overflow-y-auto">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => navigateToSearch(result.section, result.type)}
                  className="w-full text-left px-4 py-2 hover:bg-purple-100 border-b last:border-b-0 text-sm"
                >
                  <div className="font-semibold">{result.name}</div>
                  {result.type === 'post' && (
                    <div className="text-xs text-gray-600 truncate">{result.description}</div>
                  )}
                  {result.type !== 'post' && (
                    <div className="text-xs text-gray-500">{result.type === 'course' ? 'Course' : 'Menu'}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/userHome")}
            className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all hover:shadow-md flex items-center gap-2"
            title="User View"
          >
            <span>🏠</span>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="w-11 h-11 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-purple-400 flex items-center justify-center text-sm font-bold bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105"
            title="Profile"
          >
            {user && user.profileImage ? (
              <img src={user.profileImage} alt="profile" className="w-full h-full object-cover" />
            ) : (
              <span>{(user && (user.name || user.email) ? (user.name || user.email)[0] : 'S')}</span>
            )}
          </button>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all text-xl"
              title="Menu"
            >
              ⋮
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                <button className="block w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b">
                  ⚙️ Settings
                </button>
                <button
                  className="block w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 transition"
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
            <div className="h-1 w-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
          </div>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveSection('dashboard')}
                className={`w-full text-left px-5 py-3.5 rounded-xl transition-all font-medium group ${activeSection === 'dashboard' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' : 'hover:bg-white/80 text-gray-700 hover:shadow-md'}`}
              >
                <span className="text-xl mr-3">📊</span>
                <span className="group-hover:translate-x-1 inline-block transition-transform">Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('courses')}
                className={`w-full text-left px-5 py-3.5 rounded-xl transition-all font-medium group ${activeSection === 'courses' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' : 'hover:bg-white/80 text-gray-700 hover:shadow-md'}`}
              >
                <span className="text-xl mr-3">📚</span>
                <span className="group-hover:translate-x-1 inline-block transition-transform">My Courses</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('assignments')}
                className={`w-full text-left px-4 py-2 rounded transition ${activeSection === 'assignments' ? 'bg-purple-600' : 'hover:bg-gray-700'}`}
              >
                ✏️ Assignments
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('grades')}
                className={`w-full text-left px-4 py-2 rounded transition ${activeSection === 'grades' ? 'bg-purple-600' : 'hover:bg-gray-700'}`}
              >
                📝 Grades
              </button>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderContent()}
          {activeSection === 'dashboard' ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Your Posts</h3>
                <button
                  onClick={openPostModal}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition font-semibold"
                >
                  ✏️ Create Post
                </button>
              </div>
              {userPosts.length > 0 ? (
                <div className="space-y-4">
                  {userPosts.map(post => (
                    <div key={post.id} className="bg-white p-6 rounded-lg shadow border">
                      {isLoadingProfiles ? (
                        <div className="mb-3">
                          <UserProfileMini showTime={true} />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <button
                            onClick={() => navigate(`/profile/${post.poster?.email || post.poster?.id}`)}
                            className="flex items-center gap-3 hover:opacity-80 cursor-pointer"
                          >
                            {post.poster?.avatar ? (
                              <img src={post.poster.avatar} alt={post.poster.name} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-sm font-bold">
                                {post.poster?.name?.[0] || 'S'}
                              </div>
                            )}
                            <div className="text-left">
                              <p className="font-semibold text-blue-600 hover:text-blue-800">{post.poster?.name || 'Student'}</p>
                              <p className="text-xs text-gray-500">{post.timestamp ? new Date(post.timestamp).toLocaleDateString() : 'Recently'}</p>
                            </div>
                          </button>
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
                                      openPostModal(post);
                                      setPostActionMenu(null);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeletePost(post.id, post.title);
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
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-gray-900 flex-1">{post.title}</h4>
                        <div className="flex gap-2 ml-2">
                          {post.visibility && post.visibility !== 'public' && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              post.visibility === 'students' ? 'bg-blue-100 text-blue-800' :
                              post.visibility === 'class' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {post.visibility === 'students' ? '👥 Students' :
                               post.visibility === 'class' ? `📚 ${assignedClasses.find(c => c.id === post.targetClass)?.className || 'Class'}` :
                               '🔒 Private'}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{post.description}</p>
                      {post.image && <img src={post.image} alt="post" className="w-full h-48 object-cover rounded mb-3" />}
                      {post.video && <video src={post.video} controls className="w-full h-48 rounded mb-3" />}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <button className="hover:text-purple-600">👍 {post.likes || 0}</button>
                          <button onClick={() => toggleFavorite(post.id, userId)} className="hover:text-yellow-500 text-xl">
                            {(post.favoritedBy || []).includes(userId) ? '★' : '☆'} {post.favorites || 0}
                          </button>
                          <button className="hover:text-gray-800">💬 {(post.comments || []).length}</button>
                        </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow border text-gray-600 text-center">
                  <p>No posts yet. Create a post to share with everyone!</p>
                </div>
              )}
            </div>
          ) : activeSection === 'courses' ? (
            <div>
              <h3 className="text-lg font-semibold mb-2">Assigned Classes</h3>
              {assignedClasses.length > 0 ? (
                <ul className="space-y-3">
                  {assignedClasses.map(c => (
                    <li key={c.id} className="p-4 border rounded bg-white">
                      <div className="font-bold">{c.className} <span className="text-sm text-gray-500">({c.subject})</span></div>
                      <div className="text-sm text-gray-600">Section: {c.section} • Schedule: {c.schedule}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-600">No classes assigned.</div>
              )}
            </div>
          ) : (
            <p className="text-gray-600">Content for this section goes here.</p>
          )}
        </main>
      </div>

      {/* Submission Modal */}
      {submissionModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={closeSubmissionModal}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold">📤 Submit Assignment</h2>
              <button onClick={closeSubmissionModal} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">✕</button>
            </div>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-bold text-gray-900 mb-2">{submissionModal.title}</h3>
              <p className="text-sm text-gray-700 mb-3">{submissionModal.description}</p>
              <div className="text-xs text-gray-600">
                <div>📅 Due: {new Date(submissionModal.dueDate).toLocaleDateString()}</div>
                <div>⭐ Points: {submissionModal.points}</div>
              </div>
            </div>

            <form onSubmit={handleSubmissionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Answer</label>
                <textarea
                  value={submissionFormData.answer}
                  onChange={(e) => setSubmissionFormData(prev => ({ ...prev, answer: e.target.value }))}
                  placeholder="Write your answer or response here..."
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="border-2 border-dashed border-blue-300 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">📎 Upload File or Image (optional)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.txt,.xlsx"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {submissionFormData.filePreview ? (
                  <div className="space-y-2">
                    {submissionFormData.file?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                      <img src={submissionFormData.filePreview} alt="preview" className="w-full h-48 object-cover rounded" />
                    ) : (
                      <div className="bg-gray-100 p-4 rounded text-center">
                        <div className="text-3xl mb-2">📄</div>
                        <p className="font-semibold text-gray-700">{submissionFormData.file}</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={removeFile}
                      className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
                    >
                      🗑️ Remove File
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:bg-blue-50 transition"
                  >
                    <div className="text-blue-600 font-medium">📁 Click to upload or drag file</div>
                    <div className="text-xs text-gray-500 mt-1">Max 10MB • Images, PDF, Word, Excel</div>
                  </button>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <span className="font-semibold">💡 Note:</span> You can provide either text answer or file upload or both
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeSubmissionModal} className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition font-semibold">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-blue-400 text-white py-2 rounded-lg hover:bg-blue-500 transition font-semibold shadow-sm">
                  ✅ Submit Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

{/* Post Creation Modal */}
      {postModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">{editingPostId ? '✏️ Edit Post' : '✏️ Create New Post'}</h3>
              <button onClick={closePostModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>

            <form onSubmit={handlePostSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={postFormData.title}
                  onChange={(e) => setPostFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Enter post title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={postFormData.description}
                  onChange={(e) => setPostFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md p-2 h-32"
                  placeholder="Write your post content..."
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image (optional)</label>
                <input
                  ref={postImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePostImageSelect}
                  className="hidden"
                />
                {postFormData.imagePreview ? (
                  <div className="relative">
                    <img src={postFormData.imagePreview} alt="preview" className="w-full h-48 object-cover rounded" />
                    <button
                      type="button"
                      onClick={removePostImage}
                      className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => postImageInputRef.current?.click()}
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
                  ref={postVideoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handlePostVideoSelect}
                  className="hidden"
                />
                {postFormData.videoPreview ? (
                  <div className="relative">
                    <video src={postFormData.videoPreview} controls className="w-full h-48 rounded" />
                    <button
                      type="button"
                      onClick={removePostVideo}
                      className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => postVideoInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50"
                  >
                    🎥 Click to upload video
                  </button>
                )}
              </div>

              {/* Visibility Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Who can see this?</label>
                  <select
                    value={postFormData.visibility}
                    onChange={(e) => setPostFormData(prev => ({ ...prev, visibility: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="public">🌍 Public (Everyone)</option>
                    <option value="students">👥 Students Only</option>
                    <option value="class">📚 Specific Class</option>
                  </select>
                </div>

                {postFormData.visibility === 'class' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
                    <select
                      value={postFormData.targetClass}
                      onChange={(e) => setPostFormData(prev => ({ ...prev, targetClass: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md p-2"
                      required
                    >
                      <option value="">Choose class...</option>
                      {assignedClasses.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.className}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closePostModal}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg hover:shadow-lg transition"
                >
                  {editingPostId ? '✅ Update Post' : '✅ Create Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
            {toast && (
              <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-6 py-4 rounded-lg shadow-2xl z-50 flex items-center gap-3">
                <span className="font-medium">{toast}</span>
              </div>
            )}
          </div>
        )
      }
