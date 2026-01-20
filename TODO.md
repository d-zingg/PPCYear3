# Folder Structure Reorganization TODO

## Completed

- [x] Create directories: src/features/admin, src/features/teacher, src/pages/profiles, src/backend
- [x] Move admin components to src/features/admin/: AdminReports.jsx, SchoolManagement.jsx, UserManagement.jsx, ClassManagement.jsx, ClassManagementEnhanced.jsx, AssignmentsContext.jsx, ClassesContext.jsx
- [x] Move WorkflowComponents.jsx to src/features/teacher/
- [x] Move page components to src/pages/: UserLogin.jsx, UserHome.jsx, AdminSchool.jsx, TeacherDashboard.jsx, StudentDashboard.jsx
- [x] Move profile components to src/pages/profiles/: AdminProfile.jsx, TeacherProfile.jsx, StudentProfile.jsx, UserProfile.jsx, PublicProfile.jsx
- [x] Update imports in App.jsx for pages and features
- [x] Update imports in AdminSchool.jsx for features and components
- [x] Update imports in AdminReports.jsx for context paths

## Remaining

- [ ] Update imports in other moved components (UserManagement, SchoolManagement, etc.) if they import contexts or other components
- [ ] Update imports in profile components if they import contexts
- [ ] Move backend files to src/backend/ and update any imports
- [ ] Test the app to ensure no broken imports
- [ ] Clean up any remaining files in old locations

## Notes

- Contexts are kept in src/context/ as they are shared
- Utils kept in src/utils/
- Shared components in src/components/
