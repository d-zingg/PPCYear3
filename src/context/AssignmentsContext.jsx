import React, { createContext, useState, useEffect } from 'react';

export const AssignmentsContext = createContext(null);

const STORAGE_KEY = 'ppc_assignments_v1';

// Mock test assignments
const mockAssignments = [
  {
    id: 1001,
    classId: 'c201',
    title: 'Build a React Counter Component',
    description: 'Create a functional React component that increments and decrements a counter. Include state management and event handlers.',
    dueDate: '2026-01-15',
    points: 100,
    submissions: []
  },
  {
    id: 1002,
    classId: 'c201',
    title: 'React Hooks Deep Dive',
    description: 'Explain useState, useEffect, and useContext hooks with code examples. Write a 500-word response.',
    dueDate: '2026-01-20',
    points: 50,
    submissions: []
  },
  {
    id: 1003,
    classId: 'c202',
    title: 'Essay: Industrial Revolution Impact',
    description: 'Write a 1500-word essay discussing the social, economic, and political impacts of the Industrial Revolution.',
    dueDate: '2026-01-18',
    points: 100,
    submissions: []
  },
];

export function AssignmentsProvider({ children, initial = [] }) {
  const [assignments, setAssignments] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Assignments load failed', e);
    }
    // Use mock data if no localStorage data exists
    return initial.length > 0 ? initial : mockAssignments;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    } catch (e) {
      console.warn('Assignments save failed', e);
    }
  }, [assignments]);

  const addAssignment = (data) => {
    const id = Date.now();
    const a = { ...data, id, submissions: [] };
    setAssignments(prev => [a, ...prev]);
    return a;
  };

  const updateAssignment = (id, updated) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
  };

  const deleteAssignment = (id) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  const submitAssignment = (assignmentId, submission) => {
    setAssignments(prev => prev.map(a => {
      if (a.id !== assignmentId) return a;
      const s = { id: Date.now(), timestamp: new Date().toISOString(), ...submission };
      return { ...a, submissions: [...(a.submissions || []), s] };
    }));
    return true;
  };

  const getStudentSubmission = (assignmentId, studentEmail) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return null;
    return (assignment.submissions || []).find(s => s.studentEmail === studentEmail);
  };

  const value = {
    assignments,
    setAssignments,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    submitAssignment,
    getStudentSubmission,
  };

  return (
    <AssignmentsContext.Provider value={value}>{children}</AssignmentsContext.Provider>
  );
}

export default AssignmentsProvider;
