import { Mail, Lock, LogIn } from "lucide-react";
import { useState,useRef } from "react";
import LOGO_VIDEO from "../../assets/LOGO_VIDEO.gif";
import { useNavigate, useLocation } from "react-router-dom";


export default function Signup() {
  const navigate = useNavigate();
const location = useLocation();

const redirectTo =
  (location.state as { redirectTo?: string })?.redirectTo || "/dashboard";

  const errorTimeoutRef = useRef<number | null>(null);
  const successTimeoutRef = useRef<number | null>(null);
  const [success, setSuccess] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  
  const [showError, setShowError] = useState(false);

  const triggerError = (message: string) => {
    setError(message);
    setShowError(true);
  
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
  
    errorTimeoutRef.current = window.setTimeout(() => {
      setShowError(false);
      setError("");
    }, 5000);
  };
  const triggerSuccess = (message: string, redirectTo?: string) => {
    setSuccess(message);
    setShowSuccess(true);
  
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
  
    successTimeoutRef.current = window.setTimeout(() => {
      setShowSuccess(false);
      setSuccess("");
  
      if (redirectTo) {
        navigate(redirectTo);
      }
    }, 3000);
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (password !== confirmPassword) {
      triggerError("Passwords do not match");
      return;
    }
  
    setError("");
  
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 🍪 IMPORTANT for cookies
        body: JSON.stringify({
          email,
          password,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        // Backend sends 409 for existing user
        if (res.status === 409) {
          triggerError("User already exists. Please login.");
        } else {
          triggerError(data.message || "Signup failed");
        }
        return;
      }
  
      // ✅ Signup successful
      console.log("Signup success:", data);
      triggerSuccess("Sign up successful", redirectTo);
      // Redirect user (example)
      // navigate("/dashboard");
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
      {/* Top Error Dropdown */}
{/* Top Error Toast */}
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
{/* Top Success Toast */}
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
          <img
            src={LOGO_VIDEO}
            alt="ODESSA Logo"
            className="h-40
             object-contain"
          />
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

        {/* Confirm Password */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
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
            disabled:opacity-50
          "
          disabled={password !== confirmPassword}
        >
          <LogIn className="h-4 w-4" />
          Sign Up
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-slate-400 mt-6">
        Already have an account?{" "}
        <span
          onClick={() => navigate("/login",{
            state:{
              redirectTo
            }
          })}
          className="text-blue-400 hover:underline cursor-pointer"
        >
          Sign in
        </span>
      </p>
    </div>
  );
}
