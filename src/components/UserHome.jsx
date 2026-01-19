import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PostsContext } from "../context/PostsContext";
import { UserContext } from "../context/UserContext";

export default function UserHome() {
  const location = useLocation();
  const navigate = useNavigate();

  const dob = location?.state?.dob;
  const email = location?.state?.email;
  const role = (location?.state?.role || "").toString();
  const name = location?.state?.name;

  const { user, signOut } = useContext(UserContext) || {};
  const { posts, toggleLike, toggleFavorite, addComment } =
    useContext(PostsContext) || { posts: [] };

  const [menuOpen, setMenuOpen] = useState(false);

  /* 🔍 SEARCH STATE */
  const [searchQuery, setSearchQuery] = useState("");

  const currentUser = {
    id: (user && (user.email || user.id)) || email || "current-user",
    name: (user && (user.name || user.email)) || name || "You"
  };
  const userId = user?.id || user?.email || currentUser.id;

  const getDashboardRoute = (r) => {
    switch ((r || "").toLowerCase()) {
      case "admin":
      case "adminschool":
        return "/admin";
      case "teacher":
        return "/teacher";
      case "student":
      case "students":
        return "/student";
      default:
        return "/userHome";
    }
  };

  const goToRoleDashboard = () => {
    const actualRole =
      (user && user.role) || localStorage.getItem("ppc_role") || role;
    if (!actualRole) {
      navigate("/");
      return;
    }
    navigate(getDashboardRoute(actualRole));
  };

  /* 🔍 SEARCH FILTER */
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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="text-2xl font-bold">PPC</div>

        {/* 🔍 Search */}
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 rounded text-gray-800 w-64"
        />

        <div className="flex items-center gap-4">
          <button
            onClick={goToRoleDashboard}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded font-semibold"
          >
            🏠 My Dashboard
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm">
                {((user && (user.name || user.email)) || "U")[0]}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="px-4 py-2 rounded hover:bg-blue-700"
            >
              Menu ▼
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded shadow-lg">
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  ⚙️ Settings
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    if (signOut) signOut();
                    navigate("/");
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 border-t"
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
        <h1 className="text-3xl font-bold mb-6">Welcome</h1>

        {dob && <p className="mb-2 text-gray-700">Date of birth: {dob}</p>}
        {email && <p className="mb-6 text-gray-700">Email: {email}</p>}

        <h2 className="text-2xl font-bold mb-6">Recent Posts</h2>

        {searchQuery && (
          <p className="text-sm text-gray-500 mb-4">
            Showing {filteredPosts.length} result(s) for "{searchQuery}"
          </p>
        )}

        {filteredPosts.length > 0 ? (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white border border-gray-200 rounded-lg shadow-md p-6"
              >
                {/* Poster */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
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
                    <button
                      onClick={() => navigate(`/profile/${post.poster?.email || post.poster?.id}`)}
                      className="font-semibold hover:text-blue-600 text-left cursor-pointer"
                    >
                      {post.poster?.name || "Anonymous"}
                    </button>
                    <div className="text-sm text-gray-500">
                      {new Date(post.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                <p className="mb-4 text-gray-600">{post.description}</p>

                {/* ✅ IMAGE */}
                {post.image && (
                  <img
                    src={post.image}
                    alt="post"
                    className="w-full max-h-64 object-cover rounded mb-4"
                  />
                )}

                {/* ✅ VIDEO (FIXED) */}
                {post.video && (
                  <video controls className="w-full rounded mb-4">
                    <source src={post.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}

                {/* Actions */}
                <div className="flex gap-6 mt-4">
                  <button
                    onClick={() => toggleLike(post.id, currentUser.id)}
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
                          author: currentUser
                        });
                    }}
                    className="hover:text-green-600"
                  >
                    💬 {(post.comments || []).length}
                  </button>

                  <button
                    onClick={() => toggleFavorite(post.id, userId)}
                    className="hover:text-yellow-600 flex items-center gap-1"
                  >
                    {(post.favoritedBy || []).includes(userId) ? '★' : '☆'} <span>{post.favorites || 0}</span>
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
            No posts found.
          </div>
        )}
      </div>
    </div>
  );
}
