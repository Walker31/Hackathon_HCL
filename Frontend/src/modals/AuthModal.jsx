import React, { useEffect, useMemo, useState } from "react";
import authService from "../services/authService";

const MODES = {
  STUDENT_LOGIN: "student_login",
  ADMIN_LOGIN: "admin_login",
  STUDENT_REGISTER: "student_register",
  ADMIN_REGISTER: "admin_register",
};

export default function AuthModal({
  open,
  initialMode = MODES.STUDENT_LOGIN,
  onClose,
  onSubmit, // (payload) => void
  onAuthSuccess, // (user) => void
}) {
  const [mode, setMode] = useState(initialMode);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    role: "student", // derived from mode
    email: "",
    password: "",
    confirmPassword: "",
    // register-only
    fullName: "",
    studentId: "",
    department: "",
  });

  const isRegister = useMemo(() => mode.includes("register"), [mode]);
  const isAdmin = useMemo(() => mode.includes("admin"), [mode]);

  // reset when opened or mode changes
  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
  }, [open, initialMode]);

  useEffect(() => {
    if (!open) return;

    const role = mode.includes("admin") ? "admin" : "student";
    setForm((p) => ({
      ...p,
      role,
      password: "",
      confirmPassword: "",
    }));
    setErrors({});
    setShowPass(false);
  }, [mode, open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const title =
    mode === MODES.STUDENT_LOGIN
      ? "Student Sign In"
      : mode === MODES.ADMIN_LOGIN
      ? "Admin Sign In"
      : mode === MODES.STUDENT_REGISTER
      ? "Student Registration"
      : "Admin Registration";

  const subtitle = isRegister
    ? "Create an account to access the library system."
    : "Sign in to continue to your dashboard.";

  const setField = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (isRegister) {
      if (!form.fullName.trim()) e.fullName = "Full name is required";
      if (!isAdmin && !form.studentId.trim()) e.studentId = "Student ID is required";
      if (!isAdmin && !form.department.trim()) e.department = "Department is required";
    }
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.password) e.password = "Password is required";
    if (isRegister) {
      if (!form.confirmPassword) e.confirmPassword = "Confirm your password";
      if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
        e.confirmPassword = "Passwords do not match";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const isLogin = !isRegister;
      
      if (isLogin) {
        // Login
        console.log("🔑 [AUTH_MODAL] Attempting login for:", form.email);
        const response = await authService.login(form.email, form.password);
        console.log("✅ [AUTH_MODAL] Login response:", response);
        
        // Check if user role matches the selected mode
        if (isAdmin && response.user.role !== "administrator") {
          console.warn("⚠️ [AUTH_MODAL] Admin mode but student user");
          setErrors({ general: "This account is not an admin account" });
          setIsLoading(false);
          return;
        }
        if (!isAdmin && response.user.role !== "student") {
          console.warn("⚠️ [AUTH_MODAL] Student mode but admin user");
          setErrors({ general: "This account is not a student account" });
          setIsLoading(false);
          return;
        }

        onAuthSuccess?.(response.user);
        onClose?.();
      } else {
        // Register
        console.log("📝 [AUTH_MODAL] Attempting registration for:", form.email);
        const response = await authService.register({
          username: form.email.trim(), // use full email as username for consistency
          email: form.email.trim(),
          password: form.password,
          rollNumber: form.studentId.trim(),
          fullName: form.fullName.trim(),
          department: form.department.trim(),
        });
        console.log("✅ [AUTH_MODAL] Registration successful:", response);
        
        // Show success message
        setErrors({});
        alert("Registration successful! Please login with your credentials.");
        
        // Switch to login mode
        setMode(isAdmin ? MODES.ADMIN_LOGIN : MODES.STUDENT_LOGIN);
      }
    } catch (error) {
      console.error("❌ [AUTH_MODAL] Error:", error);
      const errorMsg = error.response?.data?.detail || error.message || "An error occurred";
      setErrors({ general: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* dialog */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>

            <button
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* role tabs */}
          <div className="px-6 pt-5">
            <div className="flex gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
              <Tab
                active={!isAdmin}
                label="Student"
                onClick={() => setMode(isRegister ? MODES.STUDENT_REGISTER : MODES.STUDENT_LOGIN)}
              />
              <Tab
                active={isAdmin}
                label="Admin"
                onClick={() => setMode( MODES.ADMIN_LOGIN)}
              />
            </div>
          </div>

          {/* body */}
          <div className="px-6 py-5">
            <div className="grid gap-4">
              {errors.general && (
                <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">
                  {errors.general}
                </div>
              )}
              {isRegister ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Full Name"
                    required
                    error={errors.fullName}
                    input={
                      <input
                        className={inputCls(errors.fullName)}
                        value={form.fullName}
                        onChange={(e) => setField("fullName", e.target.value)}
                        placeholder="e.g. Alex Johnson"
                      />
                    }
                  />

                  {/* Only show Student ID for student registration */}
                  {!isAdmin ? (
                    <Field
                      label="Student ID"
                      required
                      error={errors.studentId}
                      input={
                        <input
                          className={inputCls(errors.studentId)}
                          value={form.studentId}
                          onChange={(e) => setField("studentId", e.target.value)}
                          placeholder="e.g. 2023EEE102"
                        />
                      }
                    />
                  ) : (
                    <div className="hidden sm:block" />
                  )}
                </div>
              ) : null}

              {isRegister && !isAdmin ? (
                <Field
                  label="Department"
                  required
                  error={errors.department}
                  input={
                    <input
                      className={inputCls(errors.department)}
                      value={form.department}
                      onChange={(e) => setField("department", e.target.value)}
                      placeholder="e.g. Computer Science"
                    />
                  }
                />
              ) : null}

              <Field
                label="Email Address"
                required
                error={errors.email}
                input={
                  <input
                    className={inputCls(errors.email)}
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="e.g. alex@college.edu"
                  />
                }
              />

              <Field
                label="Password"
                required
                error={errors.password}
                input={
                  <div className="flex items-center gap-2">
                    <input
                      type={showPass ? "text" : "password"}
                      className={inputCls(errors.password)}
                      value={form.password}
                      onChange={(e) => setField("password", e.target.value)}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                      aria-label="Toggle password visibility"
                    >
                      {showPass ? "🙈" : "👁"}
                    </button>
                  </div>
                }
              />

              {isRegister ? (
                <Field
                  label="Confirm Password"
                  required
                  error={errors.confirmPassword}
                  input={
                    <input
                      type={showPass ? "text" : "password"}
                      className={inputCls(errors.confirmPassword)}
                      value={form.confirmPassword}
                      onChange={(e) => setField("confirmPassword", e.target.value)}
                      placeholder="Re-enter password"
                    />
                  }
                />
              ) : null}

              {/* small helper row */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" className="h-4 w-4 accent-blue-600" />
                  Remember me
                </label>
                <button className="font-semibold text-blue-600 hover:text-blue-700">
                  Forgot password?
                </button>
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => setMode(isRegister ? (isAdmin ? MODES.ADMIN_LOGIN : MODES.STUDENT_LOGIN) : (isAdmin ? MODES.ADMIN_LOGIN : MODES.STUDENT_REGISTER))}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              {!isAdmin&& ( isRegister ? "Already have an account? Sign in" : "New here? Register")}
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
              >
                Cancel
              </button>

              <button
                onClick={submit}
                disabled={isLoading}
                className="rounded-2xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : (isRegister ? "Create Account" : "Sign In")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- tiny components ---------- */

function Tab({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full rounded-2xl px-4 py-2 text-sm font-semibold transition",
        active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function Field({ label, input, error, required }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-700">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </p>
      <div className="mt-2">{input}</div>
      {error ? <p className="mt-1 text-xs font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}

function inputCls(hasError) {
  return [
    "h-11 w-full rounded-2xl border bg-white px-4 text-sm text-slate-800 shadow-sm outline-none transition",
    "placeholder:text-slate-400 focus:ring-2",
    hasError ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-blue-200",
  ].join(" ");
}

export { MODES };
