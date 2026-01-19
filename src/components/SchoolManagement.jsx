import React, { useState } from 'react';

export default function SchoolManagement() {
  const [schools, setSchools] = useState([
    { id: 1, name: 'Royal University of Phnom Penh', address: 'Phnom Penh, Cambodia', type: 'University' },
    { id: 2, name: 'Institute of Technology of Cambodia', address: 'Phnom Penh, Cambodia', type: 'Institute' },
  ]);
  const [editingSchool, setEditingSchool] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: '',
  });

  const handleEdit = (school) => {
    setEditingSchool(school);
    setFormData({
      name: school.name || '',
      address: school.address || '',
      type: school.type || '',
    });
  };

  const handleSave = () => {
    if (editingSchool) {
      setSchools(schools.map(s => s.id === editingSchool.id ? { ...s, ...formData } : s));
    } else {
      const newSchool = {
        id: Date.now(),
        ...formData,
      };
      setSchools([...schools, newSchool]);
    }
    setEditingSchool(null);
    setFormData({ name: '', address: '', type: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this school?')) {
      setSchools(schools.filter(s => s.id !== id));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">School Management</h2>

      <div className="mb-6">
        <button
          onClick={() => setEditingSchool({})}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New School
        </button>
      </div>

      {editingSchool && (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingSchool.id ? 'Edit School' : 'Add New School'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="School Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="border p-2 rounded"
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="border p-2 rounded"
            >
              <option value="">Select Type</option>
              <option value="University">University</option>
              <option value="Institute">Institute</option>
              <option value="High School">High School</option>
              <option value="Elementary">Elementary</option>
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={() => setEditingSchool(null)}
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
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {schools.map((school) => (
              <tr key={school.id}>
                <td className="px-6 py-4 whitespace-nowrap">{school.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{school.address}</td>
                <td className="px-6 py-4 whitespace-nowrap">{school.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(school)}
                    className="text-blue-600 hover:text-blue-900 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(school.id)}
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
