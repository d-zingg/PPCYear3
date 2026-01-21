import React, { useContext, useMemo, useState } from "react";
import { PostsContext } from "../../context/PostsContext";
import { UserContext } from "../../context/UserContext";
import { ClassesContext } from "../../context/ClassesContext";
import { UsersContext } from "../../context/UsersContext";

export default function AdminReports() {
  const { posts = [] } = useContext(PostsContext);
  const { user } = useContext(UserContext);
  const { classes = [] } = useContext(ClassesContext);
  const { allUsers = [] } = useContext(UsersContext);
  const [timePeriod, setTimePeriod] = useState("all");

  // Helper function to get date range based on period
  const getDateRange = () => {
    const now = new Date();
    switch (timePeriod) {
      case "today":
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return { start: today, end: now };
      case "week":
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        return { start: weekStart, end: now };
      case "month":
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        return { start: monthStart, end: now };
      case "all":
      default:
        return { start: new Date(0), end: now };
    }
  };

  // Filter posts by date range
  const filteredPosts = useMemo(() => {
    const dateRange = getDateRange();
    return posts.filter((post) => {
      const postDate = new Date(post.timestamp || 0);
      return postDate >= dateRange.start && postDate <= dateRange.end;
    });
  }, [posts, timePeriod]);

  // Calculate statistics
  const stats = useMemo(() => {
    const usersByRole = {
      admin: allUsers.filter((u) => u.role === "admin").length,
      teacher: allUsers.filter((u) => u.role === "teacher").length,
      student: allUsers.filter((u) => u.role === "student").length,
    };

    const totalLikes = filteredPosts.reduce(
      (sum, post) => sum + (post.likes?.length || 0),
      0,
    );
    const totalComments = filteredPosts.reduce(
      (sum, post) => sum + (post.comments?.length || 0),
      0,
    );
    const totalStudents = classes.reduce(
      (sum, cls) => sum + (cls.studentList?.length || 0),
      0,
    );
    const avgStudentsPerClass =
      classes.length > 0 ? (totalStudents / classes.length).toFixed(1) : 0;
    const avgLikesPerPost =
      filteredPosts.length > 0
        ? (totalLikes / filteredPosts.length).toFixed(1)
        : 0;
    const avgCommentsPerPost =
      filteredPosts.length > 0
        ? (totalComments / filteredPosts.length).toFixed(1)
        : 0;

    return {
      totalUsers: allUsers.length,
      totalPosts: filteredPosts.length,
      totalClasses: classes.length,
      totalStudents,
      usersByRole,
      totalLikes,
      totalComments,
      avgStudentsPerClass,
      avgLikesPerPost,
      avgCommentsPerPost,
    };
  }, [allUsers, filteredPosts, classes]);

  // Get top classes by student count
  const topClasses = useMemo(() => {
    return classes
      .map((cls) => ({
        ...cls,
        studentCount: cls.studentList?.length || 0,
      }))
      .sort((a, b) => b.studentCount - a.studentCount)
      .slice(0, 5);
  }, [classes]);

  // StatCard component
  const StatCard = ({ label, value, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-50 border-blue-200",
      green: "bg-green-50 border-green-200",
      purple: "bg-purple-50 border-purple-200",
      orange: "bg-orange-50 border-orange-200",
    };

    return (
      <div className={`${colorClasses[color]} border rounded-lg p-6`}>
        <p className="text-gray-600 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header with Period Filter */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">System Reports</h1>
        <div className="flex gap-2">
          {[
            { value: "today", label: "Today" },
            { value: "week", label: "This Week" },
            { value: "month", label: "This Month" },
            { value: "all", label: "All Time" },
          ].map((period) => (
            <button
              key={period.value}
              onClick={() => setTimePeriod(period.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timePeriod === period.value
                  ? "bg-blue-400 text-white shadow-sm"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          System Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={stats.totalUsers} color="blue" />
          <StatCard
            label="Total Posts"
            value={stats.totalPosts}
            color="green"
          />
          <StatCard
            label="Total Classes"
            value={stats.totalClasses}
            color="purple"
          />
          <StatCard
            label="Total Students"
            value={stats.totalStudents}
            color="orange"
          />
        </div>
      </div>

      {/* User Distribution */}
      <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          User Distribution by Role
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-600 text-sm">Admins</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.usersByRole.admin}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {((stats.usersByRole.admin / stats.totalUsers) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-gray-600 text-sm">Teachers</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.usersByRole.teacher}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {((stats.usersByRole.teacher / stats.totalUsers) * 100).toFixed(
                1,
              )}
              %
            </p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-gray-600 text-sm">Students</p>
            <p className="text-2xl font-bold text-purple-600">
              {stats.usersByRole.student}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {((stats.usersByRole.student / stats.totalUsers) * 100).toFixed(
                1,
              )}
              %
            </p>
          </div>
        </div>
      </div>

      {/* Engagement Statistics */}
      <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Engagement Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-gray-600 text-sm">Total Likes</p>
            <p className="text-2xl font-bold text-gray-800 mt-2">
              {stats.totalLikes}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Avg: {stats.avgLikesPerPost} per post
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-gray-600 text-sm">Total Comments</p>
            <p className="text-2xl font-bold text-gray-800 mt-2">
              {stats.totalComments}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Avg: {stats.avgCommentsPerPost} per post
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-gray-600 text-sm">Engagement Rate</p>
            <p className="text-2xl font-bold text-gray-800 mt-2">
              {stats.totalPosts > 0
                ? (
                    (stats.totalLikes + stats.totalComments) /
                    stats.totalPosts
                  ).toFixed(1)
                : 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Per post average</p>
          </div>
        </div>
      </div>

      {/* Class Statistics */}
      <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Class Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-gray-600 text-sm">Average Students per Class</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {stats.avgStudentsPerClass}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-gray-600 text-sm">Total Classes</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats.totalClasses}
            </p>
          </div>
        </div>

        {/* Top Classes Table */}
        {topClasses.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Top Classes by Enrollment
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Class Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Subject
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      Students
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topClasses.map((cls) => (
                    <tr
                      key={cls.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-gray-800">
                        {cls.className || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {cls.subject || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-800 font-semibold">
                        {cls.studentCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Recent Posts Activity
        </h2>
        {filteredPosts.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredPosts
              .slice(-10)
              .reverse()
              .map((post) => (
                <div
                  key={post.id}
                  className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {post.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        By: {post.poster?.name || "Unknown"}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>👍 {post.likes?.length || 0}</p>
                      <p>💬 {post.comments?.length || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No posts in selected period
          </p>
        )}
      </div>
    </div>
  );
}
