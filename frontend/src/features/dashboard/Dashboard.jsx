import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import AdminView from "./components/AdminView";
import CustomerView from "./components/CustomerView";
import StaffView from "./components/StaffView";
import DashboardHeader from "./components/DashboardHeader";

export default function Dashboard() {
const { user, loading } = useAuth();

const location = useLocation();

useEffect(() => {
}, [location.pathname, user]);

// ✅ Wait until auth check completes
if (loading) {
return ( <div className="min-h-screen flex items-center justify-center"> <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" /> </div>
);
}

// ✅ Not logged in
if (!user) {
return <Navigate to="/login" replace />;
}

const role = user?.role || "customer";
const userName = user?.name || "User";

// Dashboard home?
const isDashboardHome = location.pathname === "/dashboard";

return ( <div className="p-1 bg-gray-50 min-h-screen"> <DashboardHeader
     name={userName}
     role={role}
   />
   
  <div className="mt-6">
    {isDashboardHome && (
      <>
        {role === "admin" && <AdminView />}
        {role === "staff" && <StaffView />}
        {role === "customer" && <CustomerView />}
      </>
    )}

    {!isDashboardHome && <Outlet />}
  </div>
</div>

);
}
