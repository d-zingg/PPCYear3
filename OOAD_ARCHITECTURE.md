# OOAD Architecture Documentation

## System Overview

This system implements a complete **Object-Oriented Analysis and Design (OOAD)** architecture for a role-based user management system. The implementation strictly follows OOAD principles including abstraction, encapsulation, inheritance, and polymorphism.

---

## 1. Object-Oriented Analysis (OOA)

### 1.1 Problem Domain

The system manages user access and operations through role-based structure supporting three user roles:
- **Administrator**: System management, user management, data configuration
- **Teacher**: Class management, assignment creation, grade submission
- **Student**: View personal data, submit assignments, view grades

### 1.2 Actors

- **Administrator** (Admin)
- **Teacher** (Teacher)
- **Student** (Student)
- **System Services** (Authentication, Validation, Session, Database, Registration)

### 1.3 Use Cases

#### Common Use Cases (All Users)
- Login
- Logout
- Register
- View Dashboard
- Update Profile

#### Administrator Use Cases
- Manage Users (Create, Read, Update, Delete)
- Manage System Data
- Configure System Settings
- View System Reports

#### Teacher Use Cases
- View Assigned Classes
- Manage Assignments
- Update Records (Grades, Attendance)
- Submit Data
- View Reports

#### Student Use Cases
- View Profile
- Submit Assignments
- View Grades/Status
- View Enrolled Classes

---

## 2. Object-Oriented Design (OOD)

### 2.1 Class Hierarchy

```
User (Abstract Base Class)
├── Admin
├── Teacher
└── Student
```

### 2.2 Core Classes

#### User (Abstract Class)
**Location**: `src/models/User.js`

**Attributes**:
- userId: string
- username: string
- password: string
- email: string
- role: string
- name: string
- schoolName: string
- phone: string
- dob: Date
- profileImage: string
- createdAt: Date

**Methods**:
- `login()` - Abstract method
- `logout()` - Common logout functionality
- `updateProfile(updatedData)` - Update user information
- `getPermissions()` - Abstract method
- `validate()` - Validate user data
- `toJSON()` - Serialize user object

#### Admin (Extends User)
**Location**: `src/models/Admin.js`

**Additional Attributes**:
- managedUsers: Array
- systemConfig: Object

**Methods**:
- `login()` - Implements abstract method
- `getPermissions()` - Returns admin permissions
- `manageUsers(action, userData)` - User management operations
- `manageData(dataType, operation, data)` - Data management
- `configureSystem(configKey, configValue)` - System configuration
- `viewReports(reportType)` - Report viewing

**Permissions**:
- manage_users, create_user, update_user, delete_user
- manage_data, view_all_data
- configure_system, view_reports
- manage_schools, manage_classes, manage_assignments
- full_access

#### Teacher (Extends User)
**Location**: `src/models/Teacher.js`

**Additional Attributes**:
- assignedClasses: Array
- assignments: Array
- subject: string
- department: string

**Methods**:
- `login()` - Implements abstract method
- `getPermissions()` - Returns teacher permissions
- `viewData(dataType)` - View assigned data
- `updateData(recordType, recordData)` - Update records
- `submitData(submissionType, submissionData)` - Submit information
- `manageAssignments(action, assignmentData)` - Assignment management
- `viewReports(reportType)` - View reports
- `assignClass(classData)` - Assign class to teacher

**Permissions**:
- view_assigned_classes, view_students
- manage_assignments, create_assignment, update_assignment, delete_assignment
- submit_grades, update_records
- view_reports, manage_class_content

#### Student (Extends User)
**Location**: `src/models/Student.js`

**Additional Attributes**:
- enrolledClasses: Array
- submissions: Array
- grades: Object
- studentId: string
- grade: string
- guardianInfo: Object

**Methods**:
- `login()` - Implements abstract method
- `getPermissions()` - Returns student permissions
- `viewProfile()` - View profile information
- `submitForm(submissionType, submissionData)` - Submit assignments
- `viewStatus(statusType)` - View grades/progress
- `viewClasses()` - View enrolled classes
- `enrollInClass(classData)` - Enroll in class
- `addGrade(subject, grade)` - Add grade
- `getAcademicStatus()` - Get academic summary

**Permissions**:
- view_profile, view_enrolled_classes
- submit_assignments, view_grades, view_status
- view_announcements, update_profile, view_schedule

---

### 2.3 Service Classes (Singleton Pattern)

#### AuthenticationService
**Location**: `src/services/AuthenticationService.js`

**Responsibilities**:
- User authentication and credential verification
- Login attempt tracking and account lockout
- Session verification
- Password management

**Methods**:
- `getInstance()` - Get singleton instance
- `authenticate(email, password, role)` - Authenticate user
- `createUserInstance(userData)` - Create role-based user object
- `verifySession(userData)` - Verify user session
- `logout(userData)` - Logout user
- `changePassword(userId, oldPassword, newPassword)` - Change password
- `resetPassword(email, newPassword)` - Reset password (admin)

**Security Features**:
- Login attempt limiting (5 attempts)
- 15-minute lockout after max attempts
- Role verification
- Password validation

#### RegistrationService
**Location**: `src/services/RegistrationService.js`

**Responsibilities**:
- New user registration
- Multi-step registration validation
- Email availability checking
- User creation and initialization

**Methods**:
- `getInstance()` - Get singleton instance
- `register(userData)` - Register new user
- `validateStep(step, stepData)` - Validate registration step
- `checkEmailAvailability(email)` - Check if email is available
- `getProgress(currentStep, totalSteps)` - Calculate progress
- `getRequirements()` - Get registration requirements

#### ValidationService
**Location**: `src/services/ValidationService.js`

**Responsibilities**:
- Input validation
- Data sanitization
- Format verification
- Security validation

**Methods**:
- `getInstance()` - Get singleton instance
- `validateEmail(email)` - Validate email format
- `validatePassword(password)` - Validate password strength
- `validatePasswordMatch(password, confirmPassword)` - Check password match
- `validateUsername(username)` - Validate username
- `validatePhone(phone)` - Validate phone number
- `validateDOB(dob)` - Validate date of birth
- `validateRole(role)` - Validate user role
- `validateRegistrationData(userData)` - Complete validation
- `validateLoginCredentials(email, password, role)` - Login validation
- `sanitizeInput(input)` - Sanitize to prevent XSS

#### DatabaseManager
**Location**: `src/services/DatabaseManager.js`

**Responsibilities**:
- Data persistence (localStorage abstraction)
- CRUD operations
- Data retrieval and queries
- Storage management

**Methods**:
- `getInstance()` - Get singleton instance
- `save(table, data)` - Save data to storage
- `load(table, defaultValue)` - Load data from storage
- `delete(table)` - Delete data
- `exists(table)` - Check if data exists
- `getAllUsers()` - Get all users
- `saveAllUsers(users)` - Save all users
- `findUserById(userId)` - Find user by ID
- `findUserByEmail(email)` - Find user by email
- `findUsersByRole(role)` - Find users by role
- `addUser(userData)` - Add new user
- `updateUser(userId, updatedData)` - Update user
- `deleteUser(userId)` - Delete user
- `saveCurrentUser(userData)` - Save current session
- `getCurrentUser()` - Get current session
- `clearCurrentUser()` - Clear session

#### SessionManager
**Location**: `src/services/SessionManager.js`

**Responsibilities**:
- Session creation and management
- Session validation and expiration
- Activity tracking
- Secure session handling

**Methods**:
- `getInstance()` - Get singleton instance
- `createSession(userData)` - Create new session
- `getCurrentSession()` - Get active session
- `isSessionValid(session)` - Check session validity
- `updateActivity()` - Update activity timestamp
- `updateSession(updatedData)` - Update session data
- `destroySession()` - Destroy session (logout)
- `validateSession()` - Comprehensive validation
- `extendSession(additionalMinutes)` - Extend session timeout
- `getTimeUntilExpiry()` - Get remaining time

**Session Features**:
- 1-hour default timeout
- Automatic expiration
- Activity-based refresh
- Secure session IDs

---

## 3. Design Patterns Used

### 3.1 Singleton Pattern
All service classes implement the Singleton pattern to ensure only one instance exists throughout the application.

**Benefits**:
- Consistent state management
- Resource efficiency
- Global access point

### 3.2 Factory Pattern (Implicit)
User instance creation based on role:
- `AuthenticationService.createUserInstance()`
- `RegistrationService.createUserInstance()`

### 3.3 Abstract Class Pattern
User class serves as abstract base with:
- Abstract methods (`login()`, `getPermissions()`)
- Concrete implementations in subclasses
- Shared behavior in base class

---

## 4. Class Relationships

### 4.1 Inheritance Hierarchy
```
User (Abstract)
  ↓
├─ Admin
├─ Teacher
└─ Student
```

### 4.2 Dependency Relationships
```
AuthenticationService
  ↓
├─ ValidationService (dependency)
├─ DatabaseManager (dependency)
└─ Creates: Admin, Teacher, Student (factory)

RegistrationService
  ↓
├─ ValidationService (dependency)
├─ DatabaseManager (dependency)
└─ Creates: Admin, Teacher, Student (factory)

SessionManager
  ↓
├─ DatabaseManager (dependency)
└─ AuthenticationService (lazy dependency)
```

---

## 5. Use Case Implementations

### 5.1 Login Sequence
1. User enters credentials (email, password, role)
2. ValidationService validates input format
3. AuthenticationService checks login attempts
4. DatabaseManager retrieves user by email
5. AuthenticationService verifies role and password
6. User instance created based on role (Admin/Teacher/Student)
7. User.login() called (polymorphism)
8. SessionManager creates session
9. User redirected to role-specific dashboard

### 5.2 Registration Sequence
1. User selects account type (role)
2. User enters registration data (multi-step)
3. ValidationService validates each step
4. RegistrationService checks email availability
5. ValidationService sanitizes all inputs
6. User instance created based on role
7. User.validate() called
8. DatabaseManager persists user data
9. Registration confirmation returned

### 5.3 Session Management Sequence
1. User logs in
2. SessionManager.createSession() called
3. Session data stored (localStorage + memory)
4. Session timeout set (1 hour)
5. Activity tracked on user actions
6. Session validated on each request
7. Expired sessions automatically cleared
8. Logout destroys session completely

---

## 6. Security Features

### 6.1 Authentication Security
- Login attempt limiting (5 max)
- 15-minute lockout after failed attempts
- Role verification
- Password validation (minimum 6 chars)

### 6.2 Input Security
- XSS prevention through sanitization
- Email format validation
- SQL injection prevention (parameterized)
- Input length validation

### 6.3 Session Security
- Secure session IDs
- Automatic expiration
- Activity-based refresh
- Secure storage

---

## 7. Extensibility

### 7.1 Adding New User Roles
1. Create new class extending User
2. Implement abstract methods
3. Define role-specific permissions
4. Add to factory methods in services

### 7.2 Adding New Services
1. Create service class
2. Implement singleton pattern
3. Define responsibilities
4. Integrate with existing services

### 7.3 Adding New Use Cases
1. Define use case method in appropriate user class
2. Check permissions
3. Implement business logic
4. Return standardized result

---

## 8. Benefits of OOAD Implementation

### 8.1 Modularity
- Clear separation of concerns
- Independent service classes
- Isolated business logic

### 8.2 Maintainability
- Well-defined class responsibilities
- Easy to locate and fix bugs
- Clear code organization

### 8.3 Scalability
- Easy to add new roles
- Simple service extension
- Clear integration points

### 8.4 Reusability
- Service classes reusable across application
- Common user behavior in base class
- Shared validation logic

### 8.5 Testability
- Singleton services easy to mock
- Clear method interfaces
- Isolated functionality

---

## 9. Integration with React

The OOAD architecture integrates with React through:

### 9.1 Context API
- UserContext wraps service layer
- Provides clean API to components
- Manages React state

### 9.2 Components
- Components call service methods
- Services handle all business logic
- Components handle UI logic only

### 9.3 Separation of Concerns
- Models: Data structures
- Services: Business logic
- Components: UI logic
- Contexts: State management

---

## 10. Usage Examples

### 10.1 Login
```javascript
import { AuthenticationService, SessionManager } from '../services';

const authService = AuthenticationService.getInstance();
const sessionManager = SessionManager.getInstance();

const result = authService.authenticate(email, password, role);
if (result.success) {
  sessionManager.createSession(result.user);
  navigate(result.redirectTo);
}
```

### 10.2 Registration
```javascript
import { RegistrationService } from '../services';

const registrationService = RegistrationService.getInstance();

const result = registrationService.register({
  name, email, password, role, schoolName, phone, dob
});

if (result.success) {
  navigate(result.redirectTo);
}
```

### 10.3 Check Permissions
```javascript
const user = authService.createUserInstance(userData);
const permissions = user.getPermissions();

if (permissions.includes('manage_users')) {
  // Allow user management
}
```

---

## 11. File Structure

```
src/
├── models/
│   ├── User.js          (Abstract base class)
│   ├── Admin.js         (Admin implementation)
│   ├── Teacher.js       (Teacher implementation)
│   ├── Student.js       (Student implementation)
│   └── index.js         (Exports)
│
├── services/
│   ├── AuthenticationService.js   (Authentication logic)
│   ├── RegistrationService.js     (Registration logic)
│   ├── ValidationService.js       (Validation logic)
│   ├── DatabaseManager.js         (Data persistence)
│   ├── SessionManager.js          (Session management)
│   └── index.js                   (Exports)
│
├── context/
│   ├── UserContext.jsx            (React Context wrapper)
│   ├── UsersContext.jsx           (Users management context)
│   ├── ClassesContext.jsx         (Classes context)
│   ├── AssignmentsContext.jsx     (Assignments context)
│   └── PostsContext.jsx           (Posts context)
│
└── pages/
    ├── UserLogin.jsx              (Login page)
    ├── AdminSchool.jsx            (Admin dashboard)
    ├── TeacherDashboard.jsx       (Teacher dashboard)
    └── StudentDashboard.jsx       (Student dashboard)
```

---

## Conclusion

This implementation demonstrates a complete OOAD-based system with:
- Clear object hierarchies
- Well-defined responsibilities
- Proper encapsulation
- Extensible architecture
- Security-first design
- Maintainable codebase

The system can be easily extended with new roles, services, and use cases while maintaining clean architecture and separation of concerns.
