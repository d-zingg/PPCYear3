/**
 * OOAD Implementation: Student Class
 * Extends User base class with student-specific functionality
 * Responsibilities: View personal info, submit assignments, view grades/status
 */

import User from './User';

/**
 * Student Class - Represents students/learners
 * Inherits from User base class
 */
class Student extends User {
  constructor(userId, username, password, email, additionalData = {}) {
    super(userId, username, password, email, 'student', additionalData);
    this.enrolledClasses = []; // Classes student is enrolled in
    this.submissions = []; // Assignment submissions
    this.grades = {}; // Student grades
    this.studentId = additionalData.studentId || userId;
    this.grade = additionalData.grade || ''; // Grade level/year
    this.guardianInfo = additionalData.guardianInfo || {};
  }

  /**
   * Implement abstract login method from User class
   * @returns {Object} Login result with student-specific data
   */
  login() {
    return {
      success: true,
      role: this.role,
      user: this.toJSON(),
      redirectTo: '/student',
      permissions: this.getPermissions(),
      message: `Student ${this.username} logged in successfully`
    };
  }

  /**
   * Get student-specific permissions
   * @returns {Array} List of permissions
   */
  getPermissions() {
    return [
      'view_profile',
      'view_enrolled_classes',
      'submit_assignments',
      'view_grades',
      'view_status',
      'view_announcements',
      'update_profile',
      'view_schedule'
    ];
  }

  /**
   * Student Use Case: View Profile Information
   * @returns {Object} Profile data
   */
  viewProfile() {
    if (!this.getPermissions().includes('view_profile')) {
      return {
        success: false,
        message: 'Insufficient permissions'
      };
    }

    return {
      success: true,
      profile: this.toJSON(),
      timestamp: new Date()
    };
  }

  /**
   * Student Use Case: Submit Form/Assignment
   * @param {string} submissionType - 'assignment' or 'form'
   * @param {Object} submissionData - Submission data
   * @returns {Object} Submission result
   */
  submitForm(submissionType, submissionData) {
    if (!this.getPermissions().includes('submit_assignments')) {
      return {
        success: false,
        message: 'Insufficient permissions'
      };
    }

    const submission = {
      id: Date.now(),
      type: submissionType,
      data: submissionData,
      studentId: this.userId,
      submittedAt: new Date(),
      status: 'submitted'
    };

    this.submissions.push(submission);

    return {
      success: true,
      submission,
      message: 'Submission successful',
      timestamp: new Date()
    };
  }

  /**
   * Student Use Case: View Status (Grades, Progress, Attendance)
   * @param {string} statusType - Type of status to view
   * @returns {Object} Status data
   */
  viewStatus(statusType) {
    if (!this.getPermissions().includes('view_status') && 
        !this.getPermissions().includes('view_grades')) {
      return {
        success: false,
        message: 'Insufficient permissions'
      };
    }

    let statusData = {};

    switch (statusType) {
      case 'grades':
        statusData = this.grades;
        break;
      case 'submissions':
        statusData = this.submissions;
        break;
      case 'enrollment':
        statusData = {
          enrolledClasses: this.enrolledClasses,
          totalClasses: this.enrolledClasses.length
        };
        break;
      default:
        statusData = {
          grades: this.grades,
          submissions: this.submissions.length,
          enrolledClasses: this.enrolledClasses.length
        };
    }

    return {
      success: true,
      statusType,
      statusData,
      studentId: this.userId,
      timestamp: new Date()
    };
  }

  /**
   * Student Use Case: View Enrolled Classes
   * @returns {Object} Classes data
   */
  viewClasses() {
    if (!this.getPermissions().includes('view_enrolled_classes')) {
      return {
        success: false,
        message: 'Insufficient permissions'
      };
    }

    return {
      success: true,
      classes: this.enrolledClasses,
      totalClasses: this.enrolledClasses.length,
      timestamp: new Date()
    };
  }

  /**
   * Enroll student in a class
   * @param {Object} classData - Class information
   */
  enrollInClass(classData) {
    if (!this.enrolledClasses.find(c => c.id === classData.id)) {
      this.enrolledClasses.push(classData);
    }
  }

  /**
   * Add a grade for a subject/assignment
   * @param {string} subject - Subject or assignment name
   * @param {number} grade - Grade value
   */
  addGrade(subject, grade) {
    this.grades[subject] = grade;
  }

  /**
   * Get overall academic status
   * @returns {Object} Academic status summary
   */
  getAcademicStatus() {
    const gradeValues = Object.values(this.grades);
    const average = gradeValues.length > 0
      ? gradeValues.reduce((sum, g) => sum + g, 0) / gradeValues.length
      : 0;

    return {
      averageGrade: average,
      totalSubjects: Object.keys(this.grades).length,
      enrolledClasses: this.enrolledClasses.length,
      totalSubmissions: this.submissions.length,
      status: average >= 70 ? 'Good Standing' : 'Needs Attention'
    };
  }

  /**
   * Override toJSON to include student-specific data
   */
  toJSON() {
    return {
      ...super.toJSON(),
      studentId: this.studentId,
      grade: this.grade,
      enrolledClassesCount: this.enrolledClasses.length,
      submissionsCount: this.submissions.length,
      academicStatus: this.getAcademicStatus()
    };
  }
}

export default Student;
