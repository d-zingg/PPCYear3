import React, { useState, useEffect, useContext } from "react";
import { ClassesContext } from "../../context/ClassesContext";
import { UsersContext } from "../../context/UsersContext";
import { UserContext } from "../../context/UserContext";
import {
  WorkflowProgress,
  WorkflowNavigation,
  WorkflowContainer,
  FormField,
} from "../teacher/WorkflowComponents";

/**
 * Enhanced ClassManagement with Multi-Step Workflow
 * Implements the class creation flow from diagrams:
 * Step 1: Basic Info (name, subject, section, schedule)
 * Step 2: Teacher Assignment
 * Step 3: Student Enrollment
 * Step 4: Review & Confirm
 */

const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "Social Studies",
  "Computer Science",
  "Arts",
  "History",
  "Physics",
  "Chemistry",
  "Biology",
];
const WORKFLOW_STEPS = ["Basic Info", "Teacher", "Students", "Review"];

export default function ClassManagementEnhanced() {
  const {
    classes = [],
    addClass,
    updateClass,
    deleteClass,
  } = useContext(ClassesContext) || {};
  const { allUsers = [], getUsersByRole, addUser } = useContext(UsersContext) || {};
  const { user } = useContext(UserContext) || {};

  // Local state
  const [localClasses, setLocalClasses] = useState(classes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [isManageMembersModalOpen, setIsManageMembersModalOpen] = useState(false);
  const [managingClass, setManagingClass] = useState(null);
  const [isCreateStudentModalOpen, setIsCreateStudentModalOpen] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    schoolName: user?.schoolName || '',
  });

  // Multi-step workflow state
  const [workflowStep, setWorkflowStep] = useState(0);
  const [formData, setFormData] = useState({
    className: "",
    subject: "",
    section: "",
    schedule: "",
    teacherId: "",
    studentList: [],
    description: "",
    capacity: 30,
  });

  // Get teachers and students from UsersContext
  const teachers = getUsersByRole
    ? getUsersByRole("teacher")
    : allUsers.filter((u) => u.role === "teacher");
  const students = getUsersByRole
    ? getUsersByRole("student")
    : allUsers.filter((u) => u.role === "student");
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    setLocalClasses(classes);
  }, [classes]);

  // Workflow Step Validation
  const canProceedStep = () => {
    switch (workflowStep) {
      case 0: // Basic Info
        return (
          formData.className.trim() &&
          formData.subject &&
          formData.section.trim() &&
          formData.schedule.trim()
        );
      case 1: // Teacher Assignment
        return formData.teacherId !== "";
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStudentToggle = (studentEmail) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentEmail)) {
        return prev.filter((email) => email !== studentEmail);
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
      setWorkflowStep((prev) => prev + 1);
    }
  };

  const previousStep = () => {
    if (workflowStep > 0) {
      setWorkflowStep((prev) => prev - 1);
    }
  };

  const openModal = (classToEdit = null) => {
    if (classToEdit) {
      setEditingClass(classToEdit.id);
      setFormData({
        className: classToEdit.className || "",
        subject: classToEdit.subject || "",
        section: classToEdit.section || "",
        schedule: classToEdit.schedule || "",
        teacherId: classToEdit.teacherId || "",
        studentList: classToEdit.studentList || [],
        description: classToEdit.description || "",
        capacity: classToEdit.capacity || 30,
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
      className: "",
      subject: "",
      section: "",
      schedule: "",
      teacherId: "",
      studentList: [],
      description: "",
      capacity: 30,
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
      updatedAt: new Date().toISOString(),
    };

    if (editingClass) {
      updateClass(editingClass, finalData);
      setLocalClasses((prev) =>
        prev.map((c) => (c.id === editingClass ? { ...c, ...finalData } : c)),
      );
      alert(`✅ Class "${finalData.className}" updated successfully!`);
    } else {
      const newClass = {
        ...finalData,
        id: `c${Date.now()}`,
      };
      addClass(newClass);
      setLocalClasses((prev) => [newClass, ...prev]);
      alert(`✅ Class "${finalData.className}" created successfully!`);
    }

    closeModal();
  };

  const handleDelete = (classId, name) => {
    if (
      window.confirm(
        `⚠️ Are you sure you want to delete "${name}"? This action cannot be undone.`,
      )
    ) {
      deleteClass(classId);
      setLocalClasses((prev) => prev.filter((c) => c.id !== classId));
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
    const teacher = teachers.find(
      (t) => t.id === teacherId || t.email === teacherId,
    );
    return teacher ? teacher.name : "Unassigned";
  };

  // Manage Members Modal Handlers
  const openManageMembersModal = (classItem) => {
    setManagingClass(classItem);
    setIsManageMembersModalOpen(true);
  };

  const closeManageMembersModal = () => {
    setIsManageMembersModalOpen(false);
    setManagingClass(null);
  };

  const handleAddStudent = (studentEmail) => {
    if (!managingClass) return;

    const currentStudents = managingClass.studentList || [];
    if (currentStudents.includes(studentEmail)) {
      alert('This student is already enrolled in this class');
      return;
    }

    if (currentStudents.length >= managingClass.capacity) {
      alert(`Class capacity is ${managingClass.capacity} students`);
      return;
    }

    const updatedStudents = [...currentStudents, studentEmail];
    const updatedClass = {
      ...managingClass,
      studentList: updatedStudents,
      totalStudents: updatedStudents.length,
      updatedAt: new Date().toISOString(),
    };

    updateClass(managingClass.id, updatedClass);
    setManagingClass(updatedClass);
    setLocalClasses((prev) =>
      prev.map((c) => (c.id === managingClass.id ? updatedClass : c)),
    );
  };

  const handleRemoveStudent = (studentEmail) => {
    if (!managingClass) return;

    if (window.confirm('Are you sure you want to remove this student from the class?')) {
      const updatedStudents = (managingClass.studentList || []).filter(
        (email) => email !== studentEmail,
      );
      const updatedClass = {
        ...managingClass,
        studentList: updatedStudents,
        totalStudents: updatedStudents.length,
        updatedAt: new Date().toISOString(),
      };

      updateClass(managingClass.id, updatedClass);
      setManagingClass(updatedClass);
      setLocalClasses((prev) =>
        prev.map((c) => (c.id === managingClass.id ? updatedClass : c)),
      );
    }
  };

  const handleChangeTeacher = (newTeacherId) => {
    if (!managingClass) return;

    const updatedClass = {
      ...managingClass,
      teacherId: newTeacherId,
      updatedAt: new Date().toISOString(),
    };

    updateClass(managingClass.id, updatedClass);
    setManagingClass(updatedClass);
    setLocalClasses((prev) =>
      prev.map((c) => (c.id === managingClass.id ? updatedClass : c)),
    );
    alert('Teacher updated successfully!');
  };

  // Create new student handlers
  const openCreateStudentModal = () => {
    setNewStudentData({
      name: '',
      email: '',
      password: '',
      phone: '',
      schoolName: user?.schoolName || '',
    });
    setIsCreateStudentModalOpen(true);
  };

  const closeCreateStudentModal = () => {
    setIsCreateStudentModalOpen(false);
    setNewStudentData({
      name: '',
      email: '',
      password: '',
      phone: '',
      schoolName: user?.schoolName || '',
    });
  };

  const handleNewStudentChange = (e) => {
    const { name, value } = e.target;
    setNewStudentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateStudent = () => {
    if (!newStudentData.name || !newStudentData.email || !newStudentData.password) {
      alert('Please fill in all required fields (Name, Email, Password)');
      return;
    }

    try {
      const studentDataToAdd = {
        ...newStudentData,
        role: 'student',
      };
      
      addUser && addUser(studentDataToAdd);
      
      // If we're in the manage members modal, auto-add to class
      if (managingClass && newStudentData.email) {
        setTimeout(() => {
          handleAddStudent(newStudentData.email);
        }, 500);
      }
      
      alert(`✅ Student "${newStudentData.name}" created successfully!`);
      closeCreateStudentModal();
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
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
              options={SUBJECTS.map((s) => ({ value: s, label: s }))}
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
              options={teachers.map((t) => ({
                value: t.id || t.email,
                label: `${t.name} (${t.email})`,
              }))}
              required
            />

            {formData.teacherId && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <p className="text-green-800">
                  ✓ Teacher selected:{" "}
                  <strong>{getTeacherName(formData.teacherId)}</strong>
                </p>
              </div>
            )}

            {teachers.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-800">
                  ⚠️ No teachers available. Please create teacher accounts
                  first.
                </p>
              </div>
            )}
          </div>
        );

      case 2: // Student Enrollment
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
              <p className="text-blue-800 font-medium">
                👥 Select students to enroll ({selectedStudents.length}/
                {formData.capacity})
              </p>
            </div>

            {students.length > 0 ? (
              <div className="max-h-96 overflow-y-auto border rounded-lg divide-y">
                {students.map((student) => {
                  const isSelected = selectedStudents.includes(
                    student.email || student.id,
                  );
                  const isDisabled =
                    !isSelected && selectedStudents.length >= formData.capacity;

                  return (
                    <label
                      key={student.id || student.email}
                      className={`
                        flex items-center p-4 cursor-pointer transition-colors
                        ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"}
                        ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          handleStudentToggle(student.email || student.id)
                        }
                        disabled={isDisabled}
                        className="w-5 h-5 rounded"
                      />
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-gray-900">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.email}
                        </div>
                      </div>
                      {isSelected && (
                        <span className="text-blue-600 font-medium">
                          ✓ Enrolled
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-800">
                  ⚠️ No students available. Proceed to create the class.
                </p>
              </div>
            )}
          </div>
        );

      case 3: // Review & Confirm
        const teacher = teachers.find(
          (t) => (t.id || t.email) === formData.teacherId,
        );
        const enrolledStudents = students.filter((s) =>
          selectedStudents.includes(s.email || s.id),
        );

        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-blue-800 font-medium">
                📋 Review class details before{" "}
                {editingClass ? "updating" : "creating"}
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
                <span className="ml-2 text-gray-900">
                  {teacher?.name || "N/A"}
                </span>
              </div>
              <div className="p-4">
                <span className="font-medium text-gray-700">Capacity:</span>
                <span className="ml-2 text-gray-900">
                  {formData.capacity} students
                </span>
              </div>
              <div className="p-4">
                <span className="font-medium text-gray-700">
                  Enrolled Students:
                </span>
                <span className="ml-2 text-gray-900">
                  {selectedStudents.length}
                </span>
              </div>
            </div>

            {selectedStudents.length > 0 && (
              <div className="bg-gray-50 border rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">
                  Enrolled Students:
                </h4>
                <ul className="space-y-1 text-sm">
                  {enrolledStudents.map((student, idx) => (
                    <li key={idx} className="text-gray-600">
                      • {student.name}
                    </li>
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-bold flex items-center gap-3 mb-2">
              <span className="text-5xl">📚</span>
              Class Management
            </h2>
            <p className="text-blue-100 text-lg">
              Create and manage classes with ease • {localClasses.length} {localClasses.length === 1 ? 'class' : 'classes'} total
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center gap-3 text-lg"
          >
            <span className="text-2xl">➕</span>
            Create New Class
          </button>
        </div>
      </div>

      {/* Classes Grid */}
      {localClasses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {localClasses.map((classItem) => (
            <div
              key={classItem.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-300"
            >
              <div className="p-6">
                {/* Class Information */}
                <div className="flex flex-wrap items-center gap-6 mb-6">
                  {/* Class Name */}
                  <div className="flex items-center gap-3 min-w-[250px]">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
                      {classItem.className.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Class Name</p>
                      <h3 className="text-lg font-bold text-gray-900 truncate">{classItem.className}</h3>
                    </div>
                  </div>

                  {/* Subject/Section */}
                  <div className="min-w-[160px]">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Subject/Section</p>
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 w-fit">
                        {classItem.subject}
                      </span>
                      <span className="text-sm text-gray-600 font-medium">Section {classItem.section}</span>
                    </div>
                  </div>

                  {/* Teacher */}
                  <div className="min-w-[140px]">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Teacher</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {getTeacherName(classItem.teacherId).charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {getTeacherName(classItem.teacherId)}
                      </span>
                    </div>
                  </div>

                  {/* Students */}
                  <div className="min-w-[180px] flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Students</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden min-w-[60px]">
                        <div
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-full transition-all duration-500"
                          style={{
                            width: `${Math.min(((classItem.studentList || []).length / (classItem.capacity || 30)) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                        {(classItem.studentList || []).length} / {classItem.capacity || 30}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => openDetailModal(classItem)}
                    className="px-4 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                    title="View Details"
                  >
                    <span>👁️</span> View
                  </button>
                  <button
                    onClick={() => openManageMembersModal(classItem)}
                    className="px-4 py-2.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                    title="Manage Members"
                  >
                    <span>👥</span> Manage
                  </button>
                  <button
                    onClick={() => openModal(classItem)}
                    className="px-4 py-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                    title="Edit Class"
                  >
                    <span>✏️</span> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(classItem.id, classItem.className)}
                    className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                    title="Delete Class"
                  >
                    <span>🗑️</span> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <span className="text-7xl">📚</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              No Classes Yet
            </h3>
            <p className="text-gray-600 mb-6 text-lg max-w-md">
              Get started by creating your first class. Click the "Create New Class" button above to begin.
            </p>
            <button
              onClick={() => openModal()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-3"
            >
              <span className="text-2xl">➕</span>
              Create Your First Class
            </button>
          </div>
        </div>
      )}

      {/* Multi-Step Class Creation/Edit Modal */}
      {isModalOpen && (
        <WorkflowContainer
          title={editingClass ? "✏️ Edit Class" : "➕ Create New Class"}
          onCancel={closeModal}
        >
          {/* Progress Indicator */}
          <WorkflowProgress
            currentStep={workflowStep}
            totalSteps={WORKFLOW_STEPS.length}
            steps={WORKFLOW_STEPS}
          />

          {/* Step Content */}
          <div className="my-6">{renderWorkflowStep()}</div>

          {/* Navigation */}
          <WorkflowNavigation
            currentStep={workflowStep}
            totalSteps={WORKFLOW_STEPS.length}
            onNext={nextStep}
            onPrevious={previousStep}
            onSubmit={handleSubmit}
            canProceed={canProceedStep()}
            submitLabel={editingClass ? "Update Class" : "Create Class"}
          />
        </WorkflowContainer>
      )}

      {/* Class Detail Modal */}
      {isDetailModalOpen && selectedClass && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={closeDetailModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                📖 {selectedClass.className}
              </h2>
              <button
                onClick={closeDetailModal}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200"
              >
                ✕
              </button>
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
                  <p className="font-medium text-blue-600">
                    {getTeacherName(selectedClass.teacherId)}
                  </p>
                </div>
              </div>

              {selectedClass.description && (
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-gray-700 mt-1">
                    {selectedClass.description}
                  </p>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold">👥 Enrolled Students</h3>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {(selectedClass.studentList || []).length} /{" "}
                    {selectedClass.capacity || 30}
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto border rounded-lg">
                  {(selectedClass.studentList || []).length > 0 ? (
                    <ul className="divide-y">
                      {(selectedClass.studentList || []).map(
                        (studentEmail, idx) => {
                          const student = students.find(
                            (s) => (s.email || s.id) === studentEmail,
                          );
                          return (
                            <li
                              key={idx}
                              className="p-3 hover:bg-gray-50 flex items-center justify-between"
                            >
                              <div>
                                <p className="font-medium text-gray-900">
                                  {student?.name || studentEmail}
                                </p>
                                {student && (
                                  <p className="text-sm text-gray-500">
                                    {student.email}
                                  </p>
                                )}
                              </div>
                            </li>
                          );
                        },
                      )}
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

      {/* Manage Members Modal */}
      {isManageMembersModalOpen && managingClass && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={closeManageMembersModal}
        >
          <div
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-blue-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gradient-to-r from-blue-500 to-purple-500">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-4xl">👥</span> Manage Class Members
                </h2>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <span className="font-semibold text-blue-600">{managingClass.className}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm">{managingClass.subject} / {managingClass.section}</span>
                </p>
              </div>
              <button
                onClick={closeManageMembersModal}
                className="w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all text-red-600 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            {/* Teacher Section */}
            <div className="mb-6 p-5 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">👨‍🏫</span> Assigned Teacher
              </h3>
              <div className="space-y-3">
                <select
                  value={managingClass.teacherId || ''}
                  onChange={(e) => handleChangeTeacher(e.target.value)}
                  className="w-full border-2 border-purple-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white font-medium transition-all"
                >
                  <option value="">🔍 Select a teacher...</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.email || teacher.id} value={teacher.email || teacher.id}>
                      👤 {teacher.name} • {teacher.email}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Current Teacher:</span>
                  <span className="font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                    {getTeacherName(managingClass.teacherId)}
                  </span>
                </div>
              </div>
            </div>

            {/* Students Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">🎓</span> Student Management
                </h3>
                <div className="flex items-center gap-2">
                  <span className="bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold">
                    {(managingClass.studentList || []).length} / {managingClass.capacity || 30}
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full text-sm">
                    {managingClass.capacity - (managingClass.studentList || []).length} slots left
                  </span>
                </div>
              </div>

              {/* Enrolled Students */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-blue-600">📋</span> Currently Enrolled
                </h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {(managingClass.studentList || []).length > 0 ? (
                    (managingClass.studentList || []).map((studentEmail) => {
                      const student = students.find(
                        (s) => (s.email || s.id) === studentEmail,
                      );
                      return (
                        <div
                          key={studentEmail}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                              {(student?.name || studentEmail).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {student?.name || studentEmail}
                              </p>
                              {student && (
                                <p className="text-sm text-gray-500">{student.email}</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveStudent(studentEmail)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-1"
                          >
                            <span>✖</span> Remove
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-3xl mb-2">📭</p>
                      <p>No students enrolled yet</p>
                      <p className="text-sm mt-1">Add students from the section below</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Available Students to Add */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-800 flex items-center gap-2">
                    <span className="text-green-600">✨</span> Add Students to Class
                  </h4>
                  <button
                    onClick={openCreateStudentModal}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
                  >
                    <span>➕</span> Create New Student
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {students
                    .filter((student) => !(managingClass.studentList || []).includes(student.email || student.id))
                    .map((student) => (
                      <div
                        key={student.email || student.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200 hover:border-green-400 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-500">{student.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddStudent(student.email || student.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-1"
                          disabled={(managingClass.studentList || []).length >= managingClass.capacity}
                        >
                          <span>➕</span> Add
                        </button>
                      </div>
                    ))}
                  {students.filter((student) => !(managingClass.studentList || []).includes(student.email || student.id)).length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-2">✅ All existing students are enrolled</p>
                      <button
                        onClick={openCreateStudentModal}
                        className="text-green-600 hover:text-green-700 font-medium underline"
                      >
                        Create a new student to add them
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Student Modal */}
      {isCreateStudentModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={closeCreateStudentModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-3xl">🎓</span> Create New Student
              </h2>
              <button
                onClick={closeCreateStudentModal}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={newStudentData.name}
                  onChange={handleNewStudentChange}
                  placeholder="Enter student's full name"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={newStudentData.email}
                  onChange={handleNewStudentChange}
                  placeholder="student@example.com"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={newStudentData.password}
                  onChange={handleNewStudentChange}
                  placeholder="Create a secure password"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={newStudentData.phone}
                  onChange={handleNewStudentChange}
                  placeholder="Optional phone number"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Name
                </label>
                <input
                  type="text"
                  name="schoolName"
                  value={newStudentData.schoolName}
                  onChange={handleNewStudentChange}
                  placeholder="School or institution name"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                <p className="text-sm text-blue-800">
                  💡 <strong>Note:</strong> The student will be created with role "student" and {managingClass ? 'automatically added to this class.' : 'can be added to classes later.'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeCreateStudentModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateStudent}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  ✨ Create Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
