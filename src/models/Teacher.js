/**
 * OOAD Implementation: Teacher Class
 * Extends User base class with teacher-specific functionality
 * Responsibilities: Manage classes, assignments, view student data, submit grades
 */

import User from './User';

/**
 * Teacher Class - Represents teachers/instructors
 * Inherits from User base class
 */
class Teacher extends User {
  constructor(userId, username, password, email, additionalData = {}) {
    super(userId, username, password, email, 'teacher', additionalData);
    this.assignedClasses = []; // Classes assigned to this teacher
    this.assignments = []; // Assignments created by this teacher
    this.subject = additionalData.subject || '';
    this.department = additionalData.department || '';
  }

  /**
   * Implement abstract login method from User class
   * @returns {Object} Login result with teacher-specific data
   */
  login() {
    return {
      success: true,
      role: this.role,
      user: this.toJSON(),
      redirectTo: '/teacher',
      permissions: this.getPermissions(),
      message: `Teacher ${this.username} logged in successfully`
    };
  }

  /**
   * Get teacher-specific permissions
   * @returns {Array} List of permissions
   */
  getPermissions() {
    return [
      'view_assigned_classes',
      'manage_assignments',
      'create_assignment',
      'update_assignment',
      'delete_assignment',
      'view_students',
      'submit_grades',
      'update_records',
      'view_reports',
      'manage_class_content'
    ];
  }

  /**
   * Teacher Use Case: View Assigned Data (Classes/Students)
   * @param {string} dataType - 'classes' or 'students'
   * @returns {Object} Data view result
   */
  viewData(dataType) {
    if (!this.getPermissions().includes('view_assigned_classes') && 
        !this.getPermissions().includes('view_students')) {
      return {
        success: false,
        message: 'Insufficient permissions'
      };
    }

    return {
      success: true,
      dataType,
      teacherId: this.userId,
      assignedClasses: this.assignedClasses,
      timestamp: new Date()
    };
  }

  /**
   * Teacher Use Case: Update Records (Grades, Attendance, etc.)
   * @param {string} recordType - Type of record to update
   * @param {Object} recordData - Record data
   * @returns {Object} Update result
   */
  updateData(recordType, recordData) {
    if (!this.getPermissions().includes('update_records')) {
      return {
        success: false,
        message: 'Insufficient permissions'
      };
    }

    return {
      success: true,
      recordType,
      recordData,
      updatedBy: this.userId,
      timestamp: new Date()
    };
  }

  /**
   * Teacher Use Case: Submit Information (Assignments, Grades, etc.)
   * @param {string} submissionType - Type of submission
   * @param {Object} submissionData - Submission data
   * @returns {Object} Submission result
   */
  submitData(submissionType, submissionData) {
    if (submissionType === 'assignment' && 
        !this.getPermissions().includes('create_assignment')) {
      return {
        success: false,
        message: 'Insufficient permissions'
      };
    }

    if (submissionType === 'grades' && 
        !this.getPermissions().includes('submit_grades')) {
      return {
        success: false,
        message: 'Insufficient permissions'
      };
    }

    return {
      success: true,
      submissionType,
      submissionData,
      submittedBy: this.userId,
      timestamp: new Date()
    };
  }

  /**
   * Teacher Use Case: Manage Assignments
   * @param {string} action - 'create', 'update', 'delete'
   * @param {Object} assignmentData - Assignment data
   * @returns {Object} Management result
   */
  manageAssignments(action, assignmentData) {
    const permission = `${action}_assignment`;
    if (!this.getPermissions().includes(permission) && 
        !this.getPermissions().includes('manage_assignments')) {
      return {
        success: false,
        message: 'Insufficient permissions'
      };
    }

    if (action === 'create') {
      this.assignments.push(assignmentData);
    }

    return {
      success: true,
      action,
      assignmentData,
      teacherId: this.userId,
      timestamp: new Date()
    };
  }

  /**
   * Teacher Use Case: View Reports
   * @param {string} reportType - Type of report
   * @returns {Object} Report data
   */
  viewReports(reportType) {
    if (!this.getPermissions().includes('view_reports')) {
      return {
        success: false,
        message: 'Insufficient permissions'
      };
    }

    return {
      success: true,
      reportType,
      teacherId: this.userId,
      timestamp: new Date()
    };
  }

  /**
   * Assign a class to this teacher
   * @param {Object} classData - Class information
   */
  assignClass(classData) {
    this.assignedClasses.push(classData);
  }

  /**
   * Override toJSON to include teacher-specific data
   */
  toJSON() {
    return {
      ...super.toJSON(),
      subject: this.subject,
      department: this.department,
      assignedClassesCount: this.assignedClasses.length,
      assignmentsCount: this.assignments.length
    };
  }
}

export default Teacher;
