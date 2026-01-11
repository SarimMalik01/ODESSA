import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="
      min-h-screen
      flex items-center justify-center
      bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]
      from-slate-900 via-slate-900 to-black
    ">
      {/* Width controller */}
      <div className="w-full max-w-6xl flex justify-center px-6">
        <Outlet />
      </div>
    </div>
  );
}