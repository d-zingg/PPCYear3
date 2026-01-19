import React, { useState, useEffect, useContext } from 'react';
// Assuming the context for classes and users/teachers are available
// NOTE: These contexts must be defined elsewhere in your project (e.g., src/context/)
import { ClassesContext } from '../context/ClassesContext'; 
import { UserContext } from '../context/UserContext'; 
import { btnPrimary, btnSecondary, card } from './ui/styles'; 

// --- MOCK DATA/CONTEXT START (Fallback for development) ---
const mockClasses = [
    { id: 'c1', className: 'Advanced Calculus', subject: 'Mathematics', section: 'A', teacherId: 'u3', schedule: 'MWF 9:00-10:00', totalStudents: 25 },
    { id: 'c2', className: 'World History', subject: 'Social Studies', section: 'B', teacherId: 'u9', schedule: 'TTH 11:00-12:30', totalStudents: 30 },
    { id: 'c3', className: 'Introduction to Python', subject: 'Computer Science', section: 'A', teacherId: 'u3', schedule: 'MW 14:00-16:00', totalStudents: 15 },
];

const mockTeachers = [
    { id: 'u3', name: 'Charlie Davis (Teacher)', email: 'charlie@school.edu', role: 'teacher' },
    { id: 'u9', name: 'Laura Miller (Teacher)', email: 'laura@school.edu', role: 'teacher' },
    { id: 'u1', name: 'Alice Johnson (Student)', email: 'alice@school.edu', role: 'student' },
];

const mockStudentsPerClass = {
  'c1': [{ id: 'stu1', name: 'Alice Johnson' }, { id: 'stu2', name: 'Bob Smith' }],
  'c2': [{ id: 'stu3', name: 'Eve Adams' }, { id: 'stu4', name: 'Grace Hall' }],
  'c3': [{ id: 'stu5', name: 'Henry Ford' }],
};


// Fallback Mock Contexts
const useMockClasses = () => ({
    classes: mockClasses,
    addClass: (data) => console.log(`[MOCK] Adding class:`, data),
    updateClass: (id, data) => console.log(`[MOCK] Updating class ${id} with:`, data),
    deleteClass: (id) => console.log(`[MOCK] Deleting class ${id}`),
});
const useMockUsers = () => ({ 
    users: mockTeachers, 
    getStudentsInClass: (classId) => mockStudentsPerClass[classId] || [],
});

// Using actual context or mock fallback
const useClasses = () => useContext(ClassesContext) || useMockClasses();
const useUsers = () => useContext(UserContext) || useMockUsers();
// --- MOCK DATA/CONTEXT END ---


const DEFAULT_CLASS = { className: '', subject: '', section: '', teacherId: '', schedule: '' };
const SUBJECTS = ['Mathematics', 'Science', 'English', 'Social Studies', 'Computer Science', 'Arts'];

export default function ClassManagement() {
    // Note: If ClassesContext is null, useClasses() provides mock data.
    const { classes, addClass, updateClass, deleteClass } = useClasses();
    const { users: allUsers, getStudentsInClass } = useUsers(); 
    
    // Filter users to only include teachers for the assignment dropdown
    const teachers = allUsers ? allUsers.filter(u => u.role === 'teacher') : mockTeachers.filter(u => u.role === 'teacher');

    const [localClasses, setLocalClasses] = useState(classes);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null); // For detail view
    const [formData, setFormData] = useState(DEFAULT_CLASS);

    useEffect(() => {
        setLocalClasses(classes);
    }, [classes]);

    // Helper to find teacher name by ID
    const getTeacherName = (id) => {
        const teacher = teachers.find(t => t.id === id);
        return teacher ? teacher.name.replace(' (Teacher)', '') : 'Unassigned';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- CRUD Modals ---
    
    const openModal = (classToEdit = null) => {
        if (classToEdit) {
            setEditingClass(classToEdit.id);
            setFormData(classToEdit);
        } else {
            setEditingClass(null);
            setFormData(DEFAULT_CLASS);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingClass(null);
        setFormData(DEFAULT_CLASS);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (editingClass) {
            updateClass(editingClass, formData);
            setLocalClasses(prev => prev.map(c => c.id === editingClass ? { ...c, ...formData } : c));
            alert(`Class ${formData.className} updated.`);
        } else {
            const newClass = { 
                ...formData, 
                id: `c${Date.now()}`, 
                totalStudents: 0, 
            };
            addClass(newClass);
            setLocalClasses(prev => [newClass, ...prev]);
            alert(`New class ${formData.className} added.`);
        }
        closeModal();
    };

    const handleDelete = (classId, name) => {
        if (window.confirm(`Are you sure you want to delete class: ${name}? This cannot be undone.`)) {
            deleteClass(classId);
            setLocalClasses(prev => prev.filter(c => c.id !== classId));
        }
    };
    
    // --- Detail View ---

    const openDetailModal = (classItem) => {
        setSelectedClass(classItem);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedClass(null);
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
                <h2 className="text-xl font-bold text-gray-800">📚 Class Management</h2>
                <button onClick={() => openModal()} className={btnPrimary}>
                    ➕ Create New Class
                </button>
            </div>

            {/* Classes Table */}
            <div className={`bg-white rounded-xl shadow-md overflow-x-auto ${card}`}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject/Section</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {localClasses.length > 0 ? (
                            localClasses.map((classItem) => (
                                <tr key={classItem.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{classItem.className}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {classItem.subject} / {classItem.section}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                                        {getTeacherName(classItem.teacherId)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{classItem.totalStudents}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openDetailModal(classItem)} className="text-gray-600 hover:text-gray-900 mr-4">
                                            View
                                        </button>
                                        <button onClick={() => openModal(classItem)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(classItem.id, classItem.className)} className="text-red-600 hover:text-red-900">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                    No classes have been created yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Class Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={closeModal}>
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold mb-6 border-b pb-4">{editingClass ? '✏️ Edit Class' : ''}</h2>
                        
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Class Name</label>
                                <input type="text" name="className" value={formData.className} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Subject</label>
                                <select name="subject" value={formData.subject} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required>
                                    <option value="">Select Subject</option>
                                    {SUBJECTS.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Section/Code</label>
                                <input type="text" name="section" value={formData.section} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Schedule (e.g., MWF 9:00-10:00)</label>
                                <input type="text" name="schedule" value={formData.schedule} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Assigned Teacher</label>
                                <select name="teacherId" value={formData.teacherId} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required>
                                    <option value="">Select Teacher</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={closeModal} className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                                    {editingClass ? 'Save Changes' : 'Create Class'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Class Detail Modal (View Students) */}
            {isDetailModalOpen && selectedClass && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={closeDetailModal}>
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-2xl font-bold text-gray-800">Class Details: {selectedClass.className}</h2>
                            <button onClick={closeDetailModal} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200">✕</button>
                        </div>
                        
                        <div className="space-y-4">
                            <p><strong>Subject:</strong> {selectedClass.subject}</p>
                            <p><strong>Section:</strong> {selectedClass.section}</p>
                            <p><strong>Schedule:</strong> {selectedClass.schedule}</p>
                            <p><strong>Teacher:</strong> {getTeacherName(selectedClass.teacherId)}</p>
                            
                            <h3 className="text-xl font-bold mt-6 pt-4 border-t">📝 Enrolled Students ({selectedClass.totalStudents})</h3>
                            <div className="max-h-60 overflow-y-auto border rounded p-3">
                                <ul className="space-y-2">
                                    {(getStudentsInClass(selectedClass.id) || []).length > 0 ? (
                                        (getStudentsInClass(selectedClass.id) || []).map(student => (
                                            <li key={student.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                                                <span>{student.name}</span>
                                                <button className="text-red-500 hover:text-red-700 text-xs">Remove</button> {/* Mock Action */}
                                            </li>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm">No students currently enrolled.</p>
                                    )}
                                </ul>
                            </div>
                            <button className={btnSecondary + " w-full mt-4"}>Manage Enrollment (Mock Action)</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}