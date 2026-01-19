import React, { useContext, useState } from 'react';
import { UsersContext } from '../context/UsersContext';
import { UserContext } from '../context/UserContext';

export default function UserManagement() {
  const { users = [], addUser, updateUser, deleteUser } = useContext(UsersContext) || {};
  const { user: currentUser } = useContext(UserContext) || {};
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    schoolName: '',
    phone: '',
  });

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || '',
      schoolName: user.schoolName || '',
      phone: user.phone || '',
    });
  };

  const handleSave = () => {
    if (editingUser) {
      updateUser && updateUser(editingUser.email, formData);
    } else {
      addUser && addUser(formData);
    }
    setEditingUser(null);
    setFormData({ name: '', email: '', role: '', schoolName: '', phone: '' });
  };

  const handleDelete = (email) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser && deleteUser(email);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">User Management</h2>

      <div className="mb-6">
        <button
          onClick={() => setEditingUser({})}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New User
        </button>
      </div>

      {editingUser && (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingUser.email ? 'Edit User' : 'Add New User'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="border p-2 rounded"
              disabled={!!editingUser.email}
            />
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="border p-2 rounded"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
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
            {users.map((user) => (
              <tr key={user.email}>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.schoolName}</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
