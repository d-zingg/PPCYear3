# 🎓 PPC School Management System

A modern, comprehensive school management system built with React, featuring role-based dashboards, multi-step workflows, and intuitive UI/UX.

![React](https://img.shields.io/badge/React-18.2-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🎯 Multi-Role Support
- **👨‍💼 Admin Dashboard** - Complete school management, user control, reports
- **👨‍🏫 Teacher Dashboard** - Class management, assignments, grading
- **👨‍🎓 Student Dashboard** - Course enrollment, assignments, grades

### 🚀 Key Capabilities
- ✅ Multi-step workflow for class creation
- ✅ Role-based authentication & authorization
- ✅ Protected routes with automatic redirection
- ✅ Real-time form validation
- ✅ Student enrollment management
- ✅ Assignment distribution & submission
- ✅ Social posts with likes & comments
- ✅ User profile management
- ✅ Responsive modern UI/UX
- ✅ LocalStorage persistence

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd ppcProject

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

## 📁 Project Structure

```
ppcProject/
├── src/
│   ├── components/          # React components
│   │   ├── AdminSchool.jsx
│   │   ├── TeacherDashboard.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── ClassManagementEnhanced.jsx
│   │   ├── WorkflowComponents.jsx
│   │   ├── UserLogin.jsx
│   │   └── ui/              # Shared UI utilities
│   ├── context/             # React Context providers
│   │   ├── UserContext.jsx
│   │   ├── UsersContext.jsx
│   │   ├── ClassesContext.jsx
│   │   ├── PostsContext.jsx
│   │   └── AssignmentsContext.jsx
│   ├── utils/               # Utility functions
│   │   ├── RouteGuard.jsx
│   │   └── WorkflowHelpers.js
│   ├── App.jsx              # Main app with routes
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html               # HTML template
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
├── tailwind.config.cjs      # Tailwind CSS config
└── postcss.config.js        # PostCSS config
```

## 🎨 Tech Stack

- **Frontend Framework**: React 18.2
- **Build Tool**: Vite 5.0
- **Styling**: TailwindCSS 3.4
- **Routing**: React Router v7
- **State Management**: React Context API
- **Persistence**: LocalStorage API
- **Icons**: Emoji-based (no dependencies)

## 🔐 Getting Started

### Create Your First Account

1. Open the app at `http://localhost:5173`
2. Click "Register a new account"
3. Fill in registration form:
   - Choose your role (Admin/Teacher/Student)
   - Set email and password
   - Complete the multi-step form
4. Login with your credentials

### Sample Usage Flow

**As Admin:**
1. Login → Navigate to Classes
2. Click "Create New Class"
3. Follow 4-step workflow:
   - Basic info → Teacher assignment → Student enrollment → Review
4. Submit to create class

**As Teacher:**
1. Login → View assigned classes
2. Create assignments for students
3. Grade submissions

**As Student:**
1. Login → View enrolled courses
2. Submit assignments
3. Check grades

## 🛠️ Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Structure Guidelines

#### Protected Routes
```jsx
<ProtectedRoute requiredRole="admin">
  <AdminSchool />
</ProtectedRoute>
```

#### Using Contexts
```jsx
const { user, signIn, signOut } = useContext(UserContext);
const { classes, addClass, updateClass } = useContext(ClassesContext);
```

#### Multi-Step Workflows
```jsx
import { 
  WorkflowProgress, 
  WorkflowNavigation, 
  WorkflowContainer 
} from './WorkflowComponents';
```

## 🎯 Key Features Deep Dive

### Multi-Step Class Creation
Guided 4-step process:
1. **Basic Info** - Name, subject, section, schedule
2. **Teacher Assignment** - Select from available teachers
3. **Student Enrollment** - Multi-select with capacity control
4. **Review** - Confirm all details before creation

### Role-Based Access Control
- Routes protected by authentication state
- Role validation on navigation
- Automatic redirect to appropriate dashboard
- Session persistence across browser refreshes

### Modern UI/UX
- Gradient backgrounds and buttons
- Smooth animations and transitions
- Progress indicators for workflows
- Toast notifications for actions
- Responsive design for all devices

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Output will be in `dist/` folder.

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Deploy to GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to `package.json`:
```json
{
  "homepage": "https://yourusername.github.io/ppcProject",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Deploy:
```bash
npm run deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 Environment Variables

Copy `.env.example` to `.env` for local configuration:

```bash
cp .env.example .env
```

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill process on port 5173
npx kill-port 5173

# Or change port in vite.config.js
```

### Build errors
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### LocalStorage issues
```bash
# Clear browser storage in DevTools > Application > LocalStorage
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

PPC Development Team

## 🙏 Acknowledgments

- React team for the amazing framework
- TailwindCSS for utility-first CSS
- Vite for blazing fast build tool
- The open-source community

## 📞 Support

For support, email support@ppc-project.com or open an issue in the repository.

---

Made with ❤️ by PPC Team

