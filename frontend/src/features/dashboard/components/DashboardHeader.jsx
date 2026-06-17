import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

const ROLE_CONFIG = {
  admin: {
    tagline: "Here's what's happening with your pharmacy today.",
    greeting: "Welcome Back",
  },
  staff: {
    tagline: "Here's what's happening in the pharmacy today.",
    greeting: "Welcome Back",
  },
  customer: {
    tagline: "Stay healthy, stay safe. Order your medicines easily.",
    greeting: "Hello",
  },
};

const DashboardHeader = ({ name, role }) => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.customer;

  const formattedDate = dateTime.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <div className="bg-gradient-to-r from-white via-gray-50 to-white px-4 md:px-6 py-4">
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        {/* 🔥 LEFT */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
            {config.greeting},{" "}
            <span className="text-blue-600">{name}</span> 👋
          </h1>

          <p className="text-gray-500 mt-1 text-sm md:text-base">
            {config.tagline}
          </p>
        </div>

        {/* 🔥 RIGHT (UPDATED CLEAN DATE UI) */}
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
          
          <Calendar size={18} className="text-blue-600" />

          <span className="text-sm font-semibold text-gray-700 tabular-nums whitespace-nowrap">
            {formattedDate}
          </span>

        </div>

      </div>
    </div>
  );
};

export default DashboardHeader;