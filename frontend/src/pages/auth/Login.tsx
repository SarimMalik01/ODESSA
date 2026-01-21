import { Mail, Lock, LogIn } from "lucide-react";
import { useState, useRef } from "react";
import LOGO_VIDEO from "../../assets/LOGO_VIDEO.gif";
import { useNavigate,useLocation } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
  
    const redirectTo =
      (location.state as { redirectTo?: string })?.redirectTo || "/dashboard";
  
    console.log(" redirectTo : ",redirectTo);
  const errorTimeoutRef = useRef<number | null>(null);
  const successTimeoutRef = useRef<number | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  /* ---------------- Toast helpers ---------------- */

  const triggerError = (message: string) => {
    setError(message);
    setShowError(true);

    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);

    errorTimeoutRef.current = window.setTimeout(() => {
      setShowError(false);
      setError("");
    }, 5000);
  };

  const triggerSuccess = (message: string, redirectTo?: string) => {
    setSuccess(message);
    setShowSuccess(true);

    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);

    successTimeoutRef.current = window.setTimeout(() => {
      setShowSuccess(false);
      setSuccess("");
      if (redirectTo) navigate(redirectTo);
    }, 3000);
  };

  /* ---------------- Submit ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   
    try {
      const res = await fetch("http://127.0.0.1:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 🍪 cookie session
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
     
      
     
      
      

      if (!res.ok) {
        triggerError(data.message || "Invalid email or password");
        return;
      }

      // ✅ Login success
      console.log("Login success:", data);
      triggerSuccess("Sign in successful", redirectTo);
    } catch (err) {
      console.error(err);
      triggerError("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      className="
        w-full max-w-lg
        rounded-2xl
        border border-white/10
        bg-white/5
        backdrop-blur-xl
        shadow-[0_8px_32px_rgba(0,0,0,0.45)]
        p-8
      "
    >
      {/* 🔴 Error Toast */}
      <div
        className={`
          fixed top-6 left-1/2 z-50
          w-[90%] max-w-md
          -translate-x-1/2
          rounded-xl
          bg-red-500/90
          text-white
          px-4 py-3
          text-sm text-center
          shadow-xl
          backdrop-blur
          transition-all duration-500 ease-in-out
          ${showError ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"}
          pointer-events-none
        `}
      >
        {error}
      </div>

      {/* 🟢 Success Toast */}
      <div
        className={`
          fixed top-6 left-1/2 z-50
          w-[90%] max-w-md
          -translate-x-1/2
          rounded-xl
          bg-green-500/90
          text-white
          px-4 py-3
          text-sm text-center
          shadow-xl
          backdrop-blur
          transition-all duration-500 ease-in-out
          ${showSuccess ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"}
          pointer-events-none
        `}
      >
        {success}
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4 mt-10">
          <img src={LOGO_VIDEO} alt="ODESSA Logo" className="h-40 object-contain" />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="
              w-full pl-10 pr-4 py-2
              rounded-lg
              bg-white/5
              border border-white/10
              text-white placeholder-slate-500
              focus:outline-none
              focus:ring-2 focus:ring-blue-500/60
            "
          />
        </div>

        {/* Password */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="
              w-full pl-10 pr-4 py-2
              rounded-lg
              bg-white/5
              border border-white/10
              text-white placeholder-slate-500
              focus:outline-none
              focus:ring-2 focus:ring-blue-500/60
            "
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="
            w-full flex items-center justify-center gap-2
            rounded-lg py-2
            bg-blue-600/80 hover:bg-blue-600
            border border-blue-400/20
            text-white font-medium
            transition
          "
        >
          <LogIn className="h-4 w-4" />
          Sign In
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-slate-400 mt-6">
        Don’t have an account?{" "}
        <span
          onClick={() => navigate("/signup",{
            state:{
                redirectTo
            }
          })}
          className="text-blue-400 hover:underline cursor-pointer"
        >
          Sign up
        </span>
      </p>
    </div>
  );
}
