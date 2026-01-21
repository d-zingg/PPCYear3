import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/UserContext';

export default function SchoolManagement() {
  const { user } = useContext(UserContext) || {};
  const [schools, setSchools] = useState([]);
  const [editingSchool, setEditingSchool] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: '',
    phone: '',
    email: '',
    website: '',
    description: '',
  });
  const [toast, setToast] = useState('');

  // Load schools from localStorage
  useEffect(() => {
    const savedSchools = JSON.parse(localStorage.getItem('ppc_schools') || '[]');
    if (savedSchools.length === 0) {
      // Initialize with default school if none exists
      const defaultSchool = {
        id: 1,
        name: user?.schoolName || 'Royal University of Phnom Penh',
        address: 'Phnom Penh, Cambodia',
        type: 'University',
        phone: '+855 23 880 116',
        email: 'info@rupp.edu.kh',
        website: 'https://www.rupp.edu.kh',
        description: 'Leading educational institution in Cambodia',
      };
      setSchools([defaultSchool]);
      localStorage.setItem('ppc_schools', JSON.stringify([defaultSchool]));
    } else {
      setSchools(savedSchools);
    }
  }, [user]);

  // Save schools to localStorage whenever they change
  useEffect(() => {
    if (schools.length > 0) {
      localStorage.setItem('ppc_schools', JSON.stringify(schools));
    }
  }, [schools]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const handleEdit = (school) => {
    setEditingSchool(school);
    setFormData({
      name: school.name || '',
      address: school.address || '',
      type: school.type || '',
      phone: school.phone || '',
      email: school.email || '',
      website: school.website || '',
      description: school.description || '',
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      showToast('⚠️ School name is required');
      return;
    }

    if (editingSchool) {
      setSchools(schools.map(s => s.id === editingSchool.id ? { ...s, ...formData } : s));
      showToast('✅ School updated successfully');
    } else {
      const newSchool = {
        id: Date.now(),
        ...formData,
      };
      setSchools([...schools, newSchool]);
      showToast('✅ School added successfully');
    }
    setEditingSchool(null);
    setFormData({ name: '', address: '', type: '', phone: '', email: '', website: '', description: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this school?')) {
      setSchools(schools.filter(s => s.id !== id));
      showToast('🗑️ School deleted successfully');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🏫 School Profile Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your school information and profile</p>
        </div>
        <button
          onClick={() => {
            setEditingSchool({});
            setFormData({ name: '', address: '', type: '', phone: '', email: '', website: '', description: '' });
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white font-medium transition-all hover:shadow-lg transform hover:scale-105"
        >
          ➕ Add New School
        </button>
      </div>

      {editingSchool && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            {editingSchool.id ? '✏️ Edit School Profile' : '➕ Add New School'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School Name *</label>
              <input
                type="text"
                placeholder="Enter school name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
              >
                <option value="">Select Type</option>
                <option value="University">University</option>
                <option value="Institute">Institute</option>
                <option value="High School">High School</option>
                <option value="Middle School">Middle School</option>
                <option value="Elementary">Elementary</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                placeholder="Enter school address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="url"
                placeholder="Enter website URL"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                placeholder="Enter school description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition h-24 resize-none"
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium transition-all hover:shadow-lg"
            >
              ✅ Save School
            </button>
            <button
              onClick={() => {
                setEditingSchool(null);
                setFormData({ name: '', address: '', type: '', phone: '', email: '', website: '', description: '' });
              }}
              className="px-6 py-2.5 rounded-lg bg-gray-500 text-white font-medium hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schools.map((school) => (
          <div key={school.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all transform hover:scale-[1.02]">
            <div className="bg-gradient-to-r from-blue-400 to-indigo-500 p-4">
              <h3 className="text-xl font-bold text-white">{school.name}</h3>
              <span className="inline-block bg-white/20 text-white text-xs px-3 py-1 rounded-full mt-2">
                {school.type || 'Not specified'}
              </span>
            </div>
            <div className="p-4 space-y-3">
              {school.address && (
                <div className="flex items-start gap-2">
                  <span className="text-gray-400">📍</span>
                  <span className="text-sm text-gray-600">{school.address}</span>
                </div>
              )}
              {school.phone && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">📞</span>
                  <span className="text-sm text-gray-600">{school.phone}</span>
                </div>
              )}
              {school.email && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">📧</span>
                  <span className="text-sm text-blue-600 hover:underline">{school.email}</span>
                </div>
              )}
              {school.website && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">🌐</span>
                  <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                    {school.website}
                  </a>
                </div>
              )}
              {school.description && (
                <p className="text-sm text-gray-600 mt-3 italic border-t pt-3">
                  "{school.description}"
                </p>
              )}
            </div>
            <div className="px-4 py-3 bg-gray-50 flex gap-2 border-t">
              <button
                onClick={() => handleEdit(school)}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDelete(school.id)}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {schools.length === 0 && !editingSchool && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🏫</span>
          </div>
          <p className="text-gray-500 text-lg">No schools added yet</p>
          <p className="text-gray-400 text-sm mt-2">Click "Add New School" to get started</p>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-6 py-4 rounded-lg shadow-2xl z-50 flex items-center gap-3 animate-fade-in">
          <span className="font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
}
