import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { UsersContext } from "../context/UsersContext";
import NextButton, { advanceStep } from "../components/btn";

export default function UserLogin() {
  const navigate = useNavigate();
  const { signIn, register } = useContext(UserContext) || {};
  const { getUserByEmail } = useContext(UsersContext) || {};

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
    regPassword.length >= 6 && regPassword === confirmPassword;

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

    const userData = {
      name,
      username: name, // OOAD expects username
      schoolName,
      phone,
      email: regEmail,
      password: regPassword,
      confirmPassword: confirmPassword, // OOAD validates password match
      dob,
      role: regRole,
    };

    // Use OOAD register method
    if (register) {
      const result = register(userData);
      
      if (result && result.success) {
        // Use setTimeout to ensure state update completes before navigation
        setTimeout(() => {
          navigate(result.redirectTo);
        }, 100);
      } else {
        // Show detailed error messages
        const errorMessage = result.errors && result.errors.length > 0
          ? `Registration failed:\n\n${result.errors.join('\n')}`
          : result.message || 'Registration failed';
        alert(errorMessage);
      }
    }
  }

  function handleExistingSignIn(e) {
    // Existing User Submit
    e.preventDefault();
    
    // Use OOAD signIn method with email, password, role
    if (signIn) {
      const result = signIn(existingEmail, existingPassword, existingRole);
      
      if (result && result.success) {
        // Use setTimeout to ensure state update completes before navigation
        setTimeout(() => {
          navigate(result.redirectTo);
        }, 100);
      } else {
        alert(result.message || 'Login failed');
      }
    }
  }

  // Registration Back Button
  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md transform transition-all hover:shadow-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
            <span className="text-5xl">🎓</span>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Welcome to PPC
          </h2>
          <p className="text-gray-600 text-lg">
            {existingMode ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        {/* Toggle Login/Register Mode */}
        <div className="mb-6 text-center">
          <button
            type="button"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 flex items-center justify-center mx-auto gap-2"
            onClick={() => {
              setExistingMode(!existingMode);
              setStep(0);
              setShowPassword(false);
            }}
          >
            <span className="text-lg">
              {existingMode ? "✨ New here? Create an account" : "👋 Already have an account? Sign in"}
            </span>
          </button>
        </div>

        {/* ================= EXISTING USER FORM ================= */}
        {existingMode ? (
          <form onSubmit={handleExistingSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Your Role
              </label>
              <select
                value={existingRole}
                onChange={(e) => setExistingRole(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              >
                <option value="">Choose your role...</option>
                <option value="admin">👨‍💼 Admin School</option>
                <option value="teacher">👨‍🏫 Teacher</option>
                <option value="student">👨‍🎓 Student</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all outline-none ${
                  existingEmail && !isValidEmail(existingEmail)
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                }`}
                placeholder="your.email@example.com"
                type="email"
                value={existingEmail}
                onChange={(e) => setExistingEmail(e.target.value)}
              />
              {existingEmail && !isValidEmail(existingEmail) && (
                <p className="text-red-500 text-xs mt-1 ml-1">Please enter a valid email</p>
              )}
            </div>

            {/* Password Field with Toggle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 pr-20 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  value={existingPassword}
                  onChange={(e) => setExistingPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈 HIDE" : "👁️ SHOW"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!canExistingSignIn}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform ${
                canExistingSignIn
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {canExistingSignIn ? "🚀 Sign In" : "⏳ Please fill all fields"}
            </button>
          </form>
        ) : (
          /* ================= NEW USER REGISTER FORM ================= */
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* --- Step 0: Basic Info & Password --- */}
            {step === 0 && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder="e.g., John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    School Name
                  </label>
                  <input
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder="e.g., Royal University"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder="e.g., +1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all outline-none ${
                      regEmail && !isValidEmail(regEmail)
                        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    }`}
                    placeholder="your.email@example.com"
                    type="email"
                  />
                  {regEmail && !isValidEmail(regEmail) && (
                    <p className="text-red-500 text-xs mt-1 ml-1">Please enter a valid email</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Your Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  >
                    <option value="">Choose your role...</option>
                    <option value="admin">👨‍💼 Admin School</option>
                    <option value="teacher">👨‍🏫 Teacher</option>
                    <option value="student">👨‍🎓 Student</option>
                  </select>
                </div>

                {/* Create Password Fields */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Create Password
                  </label>
                  <div className="relative">
                    <input
                      className="w-full px-4 py-3 pr-20 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special"
                      type={showPassword ? "text" : "password"}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "🙈 HIDE" : "👁️ SHOW"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all outline-none ${
                      confirmPassword && regPassword !== confirmPassword
                        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    }`}
                    placeholder="Re-enter your password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {confirmPassword && regPassword !== confirmPassword && (
                    <p className="text-red-500 text-sm mt-1 ml-1 flex items-center gap-1">
                      ❌ Passwords do not match
                    </p>
                  )}
                  {confirmPassword && regPassword === confirmPassword && (
                    <p className="text-green-500 text-sm mt-1 ml-1 flex items-center gap-1">
                      ✅ Passwords match
                    </p>
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
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">🎂 When were you born?</h3>
                  <p className="text-gray-600">This helps us personalize your experience</p>
                </div>

                <div className="flex gap-3 mb-6">
                  {/* Day */}
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Day</label>
                    <select
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                      className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    >
                      <option value="">DD</option>
                      {[...Array(31)].map((_, i) => (
                        <option key={i} value={i + 1}>
                          {String(i + 1).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Month */}
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Month</label>
                    <select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    >
                      <option value="">MM</option>
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                        <option key={i} value={String(i + 1)}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Year */}
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Year</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    >
                      <option value="">YYYY</option>
                      {Array.from({ length: 60 }, (_, i) => 2025 - i).map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-1/3 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                  >
                    ← Back
                  </button>

                  <button
                    type="submit"
                    disabled={!canSubmitDob}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all transform ${
                      canSubmitDob
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:scale-[1.02] shadow-lg"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {canSubmitDob ? "🎉 Complete Registration" : "⏳ Select birth date"}
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
