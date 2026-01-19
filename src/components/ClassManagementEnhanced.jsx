import React, { useState, useEffect, useContext } from 'react';
import { ClassesContext } from '../context/ClassesContext';
import { UsersContext } from '../context/UsersContext';
import { UserContext } from '../context/UserContext';
import { 
  WorkflowProgress, 
  WorkflowNavigation, 
  WorkflowContainer,
  FormField,
  ConfirmationStep 
} from './WorkflowComponents';
import { btnPrimary, btnSecondary, card } from './ui/styles';

/**
 * Enhanced ClassManagement with Multi-Step Workflow
 * Implements the class creation flow from diagrams:
 * Step 1: Basic Info (name, subject, section, schedule)
 * Step 2: Teacher Assignment
 * Step 3: Student Enrollment  
 * Step 4: Review & Confirm
 */

const SUBJECTS = ['Mathematics', 'Science', 'English', 'Social Studies', 'Computer Science', 'Arts', 'History', 'Physics', 'Chemistry', 'Biology'];
const WORKFLOW_STEPS = ['Basic Info', 'Teacher', 'Students', 'Review'];

export default function ClassManagementEnhanced() {
  const { classes = [], addClass, updateClass, deleteClass } = useContext(ClassesContext) || {};
  const { allUsers = [], getUsersByRole } = useContext(UsersContext) || {};
  const { user } = useContext(UserContext) || {};

  // Local state
  const [localClasses, setLocalClasses] = useState(classes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  
  // Multi-step workflow state
  const [workflowStep, setWorkflowStep] = useState(0);
  const [formData, setFormData] = useState({
    className: '',
    subject: '',
    section: '',
    schedule: '',
    teacherId: '',
    studentList: [],
    description: '',
    capacity: 30
  });

  // Get teachers and students from UsersContext
  const teachers = getUsersByRole ? getUsersByRole('teacher') : allUsers.filter(u => u.role === 'teacher');
  const students = getUsersByRole ? getUsersByRole('student') : allUsers.filter(u => u.role === 'student');
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    setLocalClasses(classes);
  }, [classes]);

  // Workflow Step Validation
  const canProceedStep = () => {
    switch (workflowStep) {
      case 0: // Basic Info
        return formData.className.trim() && 
               formData.subject && 
               formData.section.trim() && 
               formData.schedule.trim();
      case 1: // Teacher Assignment
        return formData.teacherId !== '';
      case 2: // Student Enrollment
        return true; // Optional - can proceed with no students
      case 3: // Review
        return true;
      default:
        return false;
    }
  };

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStudentToggle = (studentEmail) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentEmail)) {
        return prev.filter(email => email !== studentEmail);
      } else {
        // Check capacity
        if (prev.length >= formData.capacity) {
          alert(`Class capacity is ${formData.capacity} students`);
          return prev;
        }
        return [...prev, studentEmail];
      }
    });
  };

  const nextStep = () => {
    if (workflowStep < WORKFLOW_STEPS.length - 1 && canProceedStep()) {
      setWorkflowStep(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (workflowStep > 0) {
      setWorkflowStep(prev => prev - 1);
    }
  };

  const openModal = (classToEdit = null) => {
    if (classToEdit) {
      setEditingClass(classToEdit.id);
      setFormData({
        className: classToEdit.className || '',
        subject: classToEdit.subject || '',
        section: classToEdit.section || '',
        schedule: classToEdit.schedule || '',
        teacherId: classToEdit.teacherId || '',
        studentList: classToEdit.studentList || [],
        description: classToEdit.description || '',
        capacity: classToEdit.capacity || 30
      });
      setSelectedStudents(classToEdit.studentList || []);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setWorkflowStep(0);
    resetForm();
  };

  const resetForm = () => {
    setEditingClass(null);
    setFormData({
      className: '',
      subject: '',
      section: '',
      schedule: '',
      teacherId: '',
      studentList: [],
      description: '',
      capacity: 30
    });
    setSelectedStudents([]);
  };

  const handleSubmit = () => {
    const finalData = {
      ...formData,
      studentList: selectedStudents,
      totalStudents: selectedStudents.length,
      createdBy: user?.email || user?.id,
      createdAt: editingClass ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingClass) {
      updateClass(editingClass, finalData);
      setLocalClasses(prev => prev.map(c => 
        c.id === editingClass ? { ...c, ...finalData } : c
      ));
      alert(`✅ Class "${finalData.className}" updated successfully!`);
    } else {
      const newClass = {
        ...finalData,
        id: `c${Date.now()}`,
      };
      addClass(newClass);
      setLocalClasses(prev => [newClass, ...prev]);
      alert(`✅ Class "${finalData.className}" created successfully!`);
    }
    
    closeModal();
  };

  const handleDelete = (classId, name) => {
    if (window.confirm(`⚠️ Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deleteClass(classId);
      setLocalClasses(prev => prev.filter(c => c.id !== classId));
    }
  };

  const openDetailModal = (classItem) => {
    setSelectedClass(classItem);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedClass(null);
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId || t.email === teacherId);
    return teacher ? teacher.name : 'Unassigned';
  };

  // Render workflow steps
  const renderWorkflowStep = () => {
    switch (workflowStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-4">
            <FormField
              label="Class Name"
              name="className"
              value={formData.className}
              onChange={handleInputChange}
              placeholder="e.g., Advanced Calculus"
              required
            />
            <FormField
              label="Subject"
              type="select"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              options={SUBJECTS.map(s => ({ value: s, label: s }))}
              required
            />
            <FormField
              label="Section/Code"
              name="section"
              value={formData.section}
              onChange={handleInputChange}
              placeholder="e.g., A, B, CS-101"
              required
            />
            <FormField
              label="Schedule"
              name="schedule"
              value={formData.schedule}
              onChange={handleInputChange}
              placeholder="e.g., MWF 9:00-10:30 AM"
              required
            />
            <FormField
              label="Description (Optional)"
              type="textarea"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of the class..."
            />
            <FormField
              label="Class Capacity"
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              required
            />
          </div>
        );

      case 1: // Teacher Assignment
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
              <p className="text-blue-800 font-medium">
                👨‍🏫 Assign a teacher to this class
              </p>
            </div>
            
            <FormField
              label="Assigned Teacher"
              type="select"
              name="teacherId"
              value={formData.teacherId}
              onChange={handleInputChange}
              options={teachers.map(t => ({ 
                value: t.id || t.email, 
                label: `${t.name} (${t.email})` 
              }))}
              required
            />

            {formData.teacherId && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <p className="text-green-800">
                  ✓ Teacher selected: <strong>{getTeacherName(formData.teacherId)}</strong>
                </p>
              </div>
            )}

            {teachers.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-800">⚠️ No teachers available. Please create teacher accounts first.</p>
              </div>
            )}
          </div>
        );

      case 2: // Student Enrollment
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
              <p className="text-blue-800 font-medium">
                👥 Select students to enroll ({selectedStudents.length}/{formData.capacity})
              </p>
            </div>

            {students.length > 0 ? (
              <div className="max-h-96 overflow-y-auto border rounded-lg divide-y">
                {students.map(student => {
                  const isSelected = selectedStudents.includes(student.email || student.id);
                  const isDisabled = !isSelected && selectedStudents.length >= formData.capacity;
                  
                  return (
                    <label
                      key={student.id || student.email}
                      className={`
                        flex items-center p-4 cursor-pointer transition-colors
                        ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleStudentToggle(student.email || student.id)}
                        disabled={isDisabled}
                        className="w-5 h-5 rounded"
                      />
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                      {isSelected && (
                        <span className="text-blue-600 font-medium">✓ Enrolled</span>
                      )}
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-800">⚠️ No students available. Proceed to create the class.</p>
              </div>
            )}
          </div>
        );

      case 3: // Review & Confirm
        const teacher = teachers.find(t => (t.id || t.email) === formData.teacherId);
        const enrolledStudents = students.filter(s => selectedStudents.includes(s.email || s.id));
        
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-blue-800 font-medium">
                📋 Review class details before {editingClass ? 'updating' : 'creating'}
              </p>
            </div>

            <div className="bg-white border rounded-lg divide-y">
              <div className="p-4">
                <span className="font-medium text-gray-700">Class Name:</span>
                <span className="ml-2 text-gray-900">{formData.className}</span>
              </div>
              <div className="p-4">
                <span className="font-medium text-gray-700">Subject:</span>
                <span className="ml-2 text-gray-900">{formData.subject}</span>
              </div>
              <div className="p-4">
                <span className="font-medium text-gray-700">Section:</span>
                <span className="ml-2 text-gray-900">{formData.section}</span>
              </div>
              <div className="p-4">
                <span className="font-medium text-gray-700">Schedule:</span>
                <span className="ml-2 text-gray-900">{formData.schedule}</span>
              </div>
              <div className="p-4">
                <span className="font-medium text-gray-700">Teacher:</span>
                <span className="ml-2 text-gray-900">{teacher?.name || 'N/A'}</span>
              </div>
              <div className="p-4">
                <span className="font-medium text-gray-700">Capacity:</span>
                <span className="ml-2 text-gray-900">{formData.capacity} students</span>
              </div>
              <div className="p-4">
                <span className="font-medium text-gray-700">Enrolled Students:</span>
                <span className="ml-2 text-gray-900">{selectedStudents.length}</span>
              </div>
            </div>

            {selectedStudents.length > 0 && (
              <div className="bg-gray-50 border rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">Enrolled Students:</h4>
                <ul className="space-y-1 text-sm">
                  {enrolledStudents.map((student, idx) => (
                    <li key={idx} className="text-gray-600">• {student.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gradient-to-r from-blue-500 to-purple-500">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-3xl">📚</span>
            Class Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">Create and manage classes with ease</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <span className="text-xl">➕</span>
          Create New Class
        </button>
      </div>

      {/* Classes Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">🎯 Class Name</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">📚 Subject/Section</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">👨‍🏫 Teacher</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">👥 Students</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">⚙️ Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {localClasses.length > 0 ? (
              localClasses.map((classItem) => (
                <tr key={classItem.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{classItem.className}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {classItem.subject}
                      </span>
                      <span className="text-sm text-gray-500">/ {classItem.section}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                    {getTeacherName(classItem.teacherId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {classItem.totalStudents || (classItem.studentList || []).length} / {classItem.capacity || 30}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => openDetailModal(classItem)} 
                      className="text-blue-600 hover:text-blue-900 mr-4 font-medium hover:underline transition-all"
                    >
                      👁️ View
                    </button>
                    <button 
                      onClick={() => openModal(classItem)} 
                      className="text-indigo-600 hover:text-indigo-900 mr-4 font-medium hover:underline transition-all"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(classItem.id, classItem.className)} 
                      className="text-red-600 hover:text-red-900 font-medium hover:underline transition-all"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                      <span className="text-5xl">📚</span>
                    </div>
                    <p className="text-gray-600 font-medium text-lg mb-2">No classes yet</p>
                    <p className="text-gray-400 text-sm">Click "Create New Class" to get started</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Multi-Step Class Creation/Edit Modal */}
      {isModalOpen && (
        <WorkflowContainer
          title={editingClass ? '✏️ Edit Class' : '➕ Create New Class'}
          onCancel={closeModal}
        >
          {/* Progress Indicator */}
          <WorkflowProgress
            currentStep={workflowStep}
            totalSteps={WORKFLOW_STEPS.length}
            steps={WORKFLOW_STEPS}
          />

          {/* Step Content */}
          <div className="my-6">
            {renderWorkflowStep()}
          </div>

          {/* Navigation */}
          <WorkflowNavigation
            currentStep={workflowStep}
            totalSteps={WORKFLOW_STEPS.length}
            onNext={nextStep}
            onPrevious={previousStep}
            onSubmit={handleSubmit}
            canProceed={canProceedStep()}
            submitLabel={editingClass ? 'Update Class' : 'Create Class'}
          />
        </WorkflowContainer>
      )}

      {/* Class Detail Modal */}
      {isDetailModalOpen && selectedClass && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={closeDetailModal}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">📖 {selectedClass.className}</h2>
              <button onClick={closeDetailModal} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200">✕</button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Subject</p>
                  <p className="font-medium">{selectedClass.subject}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Section</p>
                  <p className="font-medium">{selectedClass.section}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Schedule</p>
                  <p className="font-medium">{selectedClass.schedule}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teacher</p>
                  <p className="font-medium text-blue-600">{getTeacherName(selectedClass.teacherId)}</p>
                </div>
              </div>

              {selectedClass.description && (
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-gray-700 mt-1">{selectedClass.description}</p>
                </div>
              )}
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold">👥 Enrolled Students</h3>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {(selectedClass.studentList || []).length} / {selectedClass.capacity || 30}
                  </span>
                </div>
                
                <div className="max-h-60 overflow-y-auto border rounded-lg">
                  {(selectedClass.studentList || []).length > 0 ? (
                    <ul className="divide-y">
                      {(selectedClass.studentList || []).map((studentEmail, idx) => {
                        const student = students.find(s => (s.email || s.id) === studentEmail);
                        return (
                          <li key={idx} className="p-3 hover:bg-gray-50 flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{student?.name || studentEmail}</p>
                              {student && <p className="text-sm text-gray-500">{student.email}</p>}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <p>No students enrolled yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
