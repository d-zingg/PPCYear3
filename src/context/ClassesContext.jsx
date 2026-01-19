import React, { createContext, useState, useEffect } from 'react';

// 1. Define the Context
export const ClassesContext = createContext();

// 2. Define the Provider Component
export const ClassesProvider = ({ children }) => {
    
    // --- Initial Data (with test data for all user types) ---
    const initialClasses = [
        { 
            id: 'c201', 
            className: 'Advanced React Development', 
            subject: 'Computer Science', 
            section: 'A',
            schedule: 'Mon/Wed/Fri 9:00 AM',
            teacherId: 'teacher1@school.edu',
            studentList: ['student@example.com', 'alice@school.edu', 'bob@school.edu']
        },
        { 
            id: 'c202', 
            className: 'World History', 
            subject: 'History', 
            section: 'B',
            schedule: 'Tue/Thu 1:00 PM',
            teacherId: 'teacher2@school.edu',
            studentList: ['student@example.com', 'charlie@school.edu']
        },
        { 
            id: 'c203', 
            className: 'Introduction to Python', 
            subject: 'Programming', 
            section: 'C',
            schedule: 'Mon/Wed 3:00 PM',
            teacherId: 'teacher1@school.edu',
            studentList: ['diana@school.edu', 'eve@school.edu']
        },
    ];

    // --- State ---
    const [classes, setClasses] = useState(initialClasses);
    // You would typically use useEffect to fetch data from a backend here

    // --- CRUD Functions ---

    // 1. CREATE
    const addClass = (newClassData) => {
        const newClass = {
            id: `c${Date.now()}`, // Simple unique ID
            ...newClassData,
            createdAt: new Date().toISOString(),
        };
        // IMMUTABLE: Create a new array by spreading the old array and adding the new item
        setClasses(prevClasses => [newClass, ...prevClasses]);
    };

    // 2. UPDATE (The function fixed for immutability and re-rendering)
    const updateClass = (classId, updatedFields) => {
        
        console.log(`Updating class ${classId} with fields:`, updatedFields); 
        
        // FIX: Use .map() to create a NEW array reference
        setClasses(prevClasses => 
            prevClasses.map(cls => {
                if (cls.id === classId) {
                    // FIX: Create a NEW class object by merging old properties and new fields
                    return { 
                        ...cls, 
                        ...updatedFields,
                        updatedAt: new Date().toISOString() 
                    }; 
                }
                return cls; // Return unmodified class for all others
            })
        );
        // This ensures a re-render in the AdminSchool component.
    };

    // 3. DELETE
    const deleteClass = (classId) => {
        // IMMUTABLE: Use .filter() to create a NEW array without the deleted item
        setClasses(prevClasses => prevClasses.filter(cls => cls.id !== classId));
    };


    // 4. Expose the data and functions
    const contextValue = {
        classes,
        addClass,
        updateClass, // This is the fixed function
        deleteClass,
    };

    return (
        <ClassesContext.Provider value={contextValue}>
            {children}
        </ClassesContext.Provider>
    );
};