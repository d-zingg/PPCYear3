import React, { useContext, useState } from "react";
import { UsersContext } from "../../context/UsersContext";
import { UserContext } from "../../context/UserContext";

export default function UserManagement() {
  const {
    allUsers = [],
    addUser,
    updateUser,
    removeUser,
  } = useContext(UsersContext) || {};
  const { user: currentUser } = useContext(UserContext) || {};
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    schoolName: "",
    phone: "",
  });

  // Remove duplicate users by email
  const uniqueUsers = allUsers.reduce((acc, user) => {
    if (!acc.find(u => u.email === user.email)) {
      acc.push(user);
    }
    return acc;
  }, []);

  // Filter users by search query and role
  const filteredUsers = uniqueUsers.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.schoolName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "",
      schoolName: user.schoolName || "",
      phone: user.phone || "",
    });
  };

  const handleSave = () => {
    if (editingUser) {
      updateUser && updateUser(editingUser.email, formData);
    } else {
      try {
        addUser && addUser(formData);
      } catch (error) {
        alert(error.message || 'Failed to add user');
        return;
      }
    }
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", role: "", schoolName: "", phone: "" });
  };

  const handleDelete = (email) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      removeUser && removeUser(email);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">User Management</h2>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <button
          onClick={() => setEditingUser({})}
          className="bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500 shadow-sm transition"
        >
          Add New User
        </button>

        <div className="flex-1 min-w-[200px] max-w-md">
          <input
            type="text"
            placeholder="Search by name, email, or school..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select>

        <div className="text-sm text-gray-600">
          Showing {filteredUsers.length} of {uniqueUsers.length} users
        </div>
      </div>

      {editingUser && (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingUser.email ? "Edit User" : "Add New User"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="border p-2 rounded"
              disabled={!!editingUser.email}
            />
            <input
              type="password"
              placeholder={editingUser.email ? "New Password (leave blank to keep current)" : "Password"}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="border p-2 rounded"
            />
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="border p-2 rounded"
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
            <input
              type="text"
              placeholder="School Name"
              value={formData.schoolName}
              onChange={(e) =>
                setFormData({ ...formData, schoolName: e.target.value })
              }
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="border p-2 rounded"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSave}
              className="bg-emerald-400 text-white px-4 py-2 rounded hover:bg-emerald-500 shadow-sm transition"
            >
              Save
            </button>
            <button
              onClick={() => setEditingUser(null)}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                School
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.email}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    {user.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.schoolName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.email)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No users found matching your search criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
