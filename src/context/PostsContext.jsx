import React, { createContext, useState, useEffect } from "react";

export const PostsContext = createContext();

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState([]);

  /* LOAD POSTS FROM LOCAL STORAGE */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("posts"));
    if (saved) setPosts(saved);
  }, []);

  /* SAVE POSTS TO LOCAL STORAGE */
  useEffect(() => {
    localStorage.setItem("posts", JSON.stringify(posts));
  }, [posts]);

  /* ADD POST (supports File objects for video/image) */
  const addPost = (post) => {
    let videoUrl = null;
    let imageUrl = null;

    if (post.video instanceof File) {
      videoUrl = URL.createObjectURL(post.video);
    } else {
      videoUrl = post.video;
    }

    if (post.image instanceof File) {
      imageUrl = URL.createObjectURL(post.image);
    } else {
      imageUrl = post.image;
    }

    const newPost = {
      id: Date.now(),
      timestamp: new Date(),
      poster: post.poster || { id: "anon", name: "Anonymous", avatar: null },
      likes: 0,
      likedBy: [],
      favorites: 0,
      favoritedBy: [],
      comments: [],
      ...post,
      video: videoUrl,
      image: imageUrl,
    };

    setPosts((prev) => [newPost, ...prev]);
  };

  /* DELETE POST */
  const deletePost = (id) => {
    setPosts((prev) => prev.filter((post) => post.id !== id));
  };

  /* LIKE / UNLIKE POST */
  const toggleLike = (postId, userId) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const liked = post.likedBy.includes(userId);
          return {
            ...post,
            likes: liked ? post.likes - 1 : post.likes + 1,
            likedBy: liked
              ? post.likedBy.filter((id) => id !== userId)
              : [...post.likedBy, userId],
          };
        }
        return post;
      })
    );
  };

  /* FAVORITE / UNFAVORITE POST */
  const toggleFavorite = (postId, userId) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const favorited = post.favoritedBy.includes(userId);
          return {
            ...post,
            favorites: favorited ? post.favorites - 1 : post.favorites + 1,
            favoritedBy: favorited
              ? post.favoritedBy.filter((id) => id !== userId)
              : [...post.favoritedBy, userId],
          };
        }
        return post;
      })
    );
  };

  /* ADD COMMENT */
  const addComment = (postId, comment) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, comment] }
          : post
      )
    );
  };

  /* GET POSTS BY USER ID */
  const getPostsByUser = (userId) => {
    return posts.filter((post) => {
      const posterId = post.poster?.id || post.poster?.email || post.poster;
      const targetId = userId;
      return posterId === targetId;
    });
  };

  return (
    <PostsContext.Provider
      value={{
        posts,
        addPost,
        deletePost,
        toggleLike,
        toggleFavorite,
        addComment,
        getPostsByUser,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
}
