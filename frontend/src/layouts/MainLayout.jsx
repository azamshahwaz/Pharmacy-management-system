import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  const { user, loading } = useAuth();

  // Auth loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role || "customer";

  // Desktop sidebar collapse
  const [collapsed, setCollapsed] = useState(false);

  // Mobile sidebar overlay
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setCollapsed((prev) => !prev);
    } else {
      setMobileOpen((prev) => !prev);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        role={role}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 w-full">
        {/* Navbar */}
        <Navbar toggleSidebar={handleToggleSidebar} />

        {/* Page Content */}
        <main className="flex-1 px-3 py-4 md:px-6 md:py-6 bg-gray-50 overflow-auto text-black">
          <Outlet />
        </main>
      </div>
    </div>
  );
}