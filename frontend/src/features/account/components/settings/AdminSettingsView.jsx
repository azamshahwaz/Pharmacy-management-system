import SecuritySettingsSection from "./components/SecuritySettingsSection.jsx";
import NotificationCard from "./components/NotificationCard";
import AdminControlsCard from "./components/AdminControlsCard";
import DangerZoneCard from "./components/DangerZoneCard";

export default function AdminSettingsView({ user }) {

  return (

    <div className="p-6 bg-gray-50 min-h-screen">

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-gray-800">
          Admin Settings
        </h1>

        <p className="text-gray-500 mt-1">
          Manage your account and application settings
        </p>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <SecuritySettingsSection />

        <NotificationCard />

        <AdminControlsCard />

        <DangerZoneCard />

      </div>

    </div>
  );
}