import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { UsersContext } from "../context/UsersContext";
import NextButton, { advanceStep } from "./btn";

export default function UserLogin() {
  const navigate = useNavigate();
  const { signIn } = useContext(UserContext) || {};
  const { addUser, getUserByEmail } = useContext(UsersContext) || {};

  // --- Registration State (New User) ---
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [phone, setPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regRole, setRegRole] = useState("");
  
  // NEW: Registration Password State
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // DOB State
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // --- Existing User Login State ---
  const [existingMode, setExistingMode] = useState(false);
  const [existingEmail, setExistingEmail] = useState("");
  const [existingPassword, setExistingPassword] = useState("");
  const [existingRole, setExistingRole] = useState("");

  // --- UI Control State ---
  // NEW: Toggle to show/hide password text
  const [showPassword, setShowPassword] = useState(false); 

  // Helper: Email Validation Regex
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // --- Validation Rules ---
  
  // Rule: Password must be at least 6 chars and match confirmation
  const isPasswordValid = 
    regPassword.length >= 6 && 
    regPassword === confirmPassword;

  const canNext =
    name.trim() !== "" &&
    isValidEmail(regEmail) &&
    phone.trim() !== "" &&
    regRole.trim() !== "" &&
    isPasswordValid; // Added password check

  const canSubmitDob = day !== "" && month !== "" && year !== "";

  const canExistingSignIn =
    isValidEmail(existingEmail) &&
    existingPassword.trim() !== "" &&
    existingRole.trim() !== "";

  // Helper: Route Logic
  function getDashboardRoute(role) {
    switch ((role || "").toLowerCase()) {
      case "admin":
      case "adminschool":
        return "/admin";
      case "teacher":
        return "/teacher";
      case "student":
      case "students":
        return "/student";
      default:
        return "/userHome";
    }
  }

  // --- Handlers ---

  function handleSignIn(e) {
    // New User Registration Submit
    e.preventDefault();
    const dob = `${year}-${month.padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const route = getDashboardRoute(regRole);
    
    const userData = {
      name,
      schoolName,
      phone,
      email: regEmail,
      password: regPassword, // NEW: Include password in user data
      dob,
      role: regRole,
    };

    if (signIn) signIn(userData);
    // Add user to UsersContext for teacher/admin selection
    if (addUser) addUser(userData);
    navigate(route);
  }

  function handleExistingSignIn(e) {
    // Existing User Submit
    e.preventDefault();
    if (!getUserByEmail) {
      alert("User lookup not available");
      return;
    }
    const user = getUserByEmail(existingEmail);
    if (!user) {
      alert("User not found. Please register first.");
      return;
    }
    if (user.password !== existingPassword) {
      alert("Incorrect password.");
      return;
    }
    if (user.role !== existingRole) {
      alert("Role mismatch.");
      return;
    }
    const route = getDashboardRoute(existingRole);
    // Sign in with full user data
    if (signIn) signIn(user);
    navigate(route);
  }

  // Registration Back Button
  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:shadow-3xl">
        <div className="text-center mb-6">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-3">
            <span className="text-4xl">🎓</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Welcome to PPC</h2>
          <p className="text-gray-500 mt-2">Sign in to continue</p>
        </div>

        {/* Toggle Login/Register Mode */}
        <div className="mb-4 text-sm text-right">
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={() => {
              setExistingMode(!existingMode);
              setStep(0);
              setShowPassword(false); // Reset visibility on toggle
            }}
          >
            {existingMode
              ? "Register a new account"
              : "I already have an account"}
          </button>
        </div>

        {/* ================= EXISTING USER FORM ================= */}
        {existingMode ? (
          <form onSubmit={handleExistingSignIn}>
            <select
              value={existingRole}
              onChange={(e) => setExistingRole(e.target.value)}
              className="w-full px-3 py-2 mb-3 border rounded"
            >
              <option value="">Select Role</option>
              <option value="admin">AdminSchool</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>

            <input
              className={`w-full px-3 py-2 mb-3 border rounded ${
                existingEmail && !isValidEmail(existingEmail) ? "border-red-500" : ""
              }`}
              placeholder="Email"
              value={existingEmail}
              onChange={(e) => setExistingEmail(e.target.value)}
            />

            {/* Password Field with Toggle */}
            <div className="relative w-full mb-3">
              <input
                className="w-full px-3 py-2 border rounded pr-12"
                placeholder="Password"
                type={showPassword ? "text" : "password"} // Switches type
                value={existingPassword}
                onChange={(e) => setExistingPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 text-xs text-blue-600 font-semibold"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>

            <button
              type="submit"
              disabled={!canExistingSignIn}
              className={`w-full py-3 rounded-lg font-semibold transition-all transform ${
                canExistingSignIn
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {canExistingSignIn ? '🚀 Sign in' : '⏳ Fill all fields'}
            </button>
          </form>
        ) : (
          /* ================= NEW USER REGISTER FORM ================= */
          <form onSubmit={handleSignIn}>
            
            {/* --- Step 0: Basic Info & Password --- */}
            {step === 0 && (
              <>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 mb-3 border rounded"
                  placeholder="Full Name"
                />

                <input
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3 py-2 mb-3 border rounded"
                  placeholder="School Name"
                />

                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 mb-3 border rounded"
                  placeholder="Phone"
                />

                <input
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className={`w-full px-3 py-2 mb-3 border rounded ${
                    regEmail && !isValidEmail(regEmail) ? "border-red-500" : ""
                  }`}
                  placeholder="Email"
                />

                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full px-3 py-2 mb-3 border rounded"
                >
                  <option value="">Select Role</option>
                  <option value="admin">AdminSchool</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>

                {/* NEW: Create Password Fields */}
                <div className="relative w-full mb-3">
                  <input
                    className="w-full px-3 py-2 border rounded pr-12"
                    placeholder="Create Password (min 6 chars)"
                    type={showPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                  {/* Show/Hide Toggle */}
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 text-xs text-blue-600 font-semibold"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>

                <div className="w-full mb-3">
                  <input
                    className={`w-full px-3 py-2 border rounded ${
                      confirmPassword && regPassword !== confirmPassword 
                        ? "border-red-500" 
                        : ""
                    }`}
                    placeholder="Confirm Password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {confirmPassword && regPassword !== confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>

                <NextButton
                  onNext={() => advanceStep(step, setStep)}
                  disabled={!canNext}
                />
              </>
            )}

            {/* --- Step 1: Date of Birth --- */}
            {step === 1 && (
              <>
                <label className="block text-gray-700 mb-1 font-medium">
                  Birth Date
                </label>

                <div className="flex gap-2 mb-3">
                  {/* Day */}
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="w-1/3 px-2 py-2 border rounded"
                  >
                    <option value="">Day</option>
                    {[...Array(31)].map((_, i) => (
                      <option key={i} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>

                  {/* Month */}
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-1/3 px-2 py-2 border rounded"
                  >
                    <option value="">Month</option>
                    {["01","02","03","04","05","06","07","08","09","10","11","12"].map(
                      (m, i) => (
                        <option key={i} value={String(i + 1)}>{m}</option>
                      )
                    )}
                  </select>

                  {/* Year */}
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-1/3 px-2 py-2 border rounded"
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 60 }, (_, i) => 2025 - i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-1/3 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={!canSubmitDob}
                    className={`w-2/3 py-2 rounded transition-colors ${
                      canSubmitDob
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    Register & Sign in
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}