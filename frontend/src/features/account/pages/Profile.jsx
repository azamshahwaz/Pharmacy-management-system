import { useEffect, useState } from "react";
import API from "../../../services/apiClient";

import AdminProfileView from "../components/profile/AdminProfileView";
import StaffProfileView from "../components/profile/StaffProfileView";
import CustomerProfileView from "../components/profile/CustomerProfileView";

export default function Profile() {

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [activities, setActivities] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const loadProfile = async () => {

      try {
        setLoading(true);

        // ── 1. Fetch logged-in user ──────────────────────────────────────
        const profileRes = await API.get("/users/profile");
        const profileUser =
          profileRes.data.user ||
          profileRes.data.data ||
          profileRes.data;

        setUser(profileUser)

        const { _id: userId, role } = profileUser;

        // ── 2. Fetch stats ───────────────────────────────────────────────
        const statsRes = await API.get("/users/profile/stats");
        const statsData = statsRes.data?.data || statsRes.data || {};

        // ── 3. Fetch activity ────────────────────────────────────────────
        // 3. Fetch activity
        let activitiesData = [];

        try {
          const activityRes = await API.get(`/users/${userId}/activity`);

          activitiesData =
            activityRes.data.activities ||
            activityRes.data.data ||
            [];
        } catch (err) {
          console.error(err);
        }

        setActivities(activitiesData);

        // ── 4. Role-specific data ────────────────────────────────────────
        if (role === "customer") {
          let orders = [];
          try {
            const ordersRes = await API.get(`/users/${userId}/orders`);
            orders =
              ordersRes.data.orders ||
              ordersRes.data.data ||
              [];
          } catch (ordErr) {
            console.warn("Orders fetch failed:", ordErr?.response?.data || ordErr.message);
          }
          setRecentOrders(orders.slice(0, 5));

          setStats({
            totalOrders: statsData.totalOrders ?? orders.length,
            totalSpent:
              statsData.totalSpent ??
              Number(
                orders
                  .filter((o) => o.status === "delivered")
                  .reduce((sum, o) => sum + (o?.grandTotal || 0), 0)
                  .toFixed(2)
              ),
            rewardPoints: statsData.rewardPoints ?? profileUser?.rewardPoints ?? 0,
            savedAddresses: statsData.savedAddresses ?? profileUser?.savedAddresses?.length ?? 0,
          });

        } else if (role === "staff") {
          setStats({
            usersManaged: statsData.usersManaged ?? 0,
            ordersManaged: statsData.ordersManaged ?? 0,
          });

        } else if (role === "admin") {
          setStats({
            usersManaged: statsData.usersManaged ?? 0,
            ordersManaged: statsData.ordersManaged ?? 0,
          });
        }

      } catch (err) {
        console.error("PROFILE ERROR =>", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-lg font-semibold text-gray-500">
        Loading Profile...
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500 font-medium">{error}</div>;
  }

  if (!user) {
    return <div className="p-6 text-red-500">User not found.</div>;
  }

  const commonProps = { user, setUser, stats, activities, recentOrders };

  switch (user.role) {
    case "admin":
      return <AdminProfileView {...commonProps} />;
    case "staff":
      return <StaffProfileView {...commonProps} />;
    case "customer":
      return <CustomerProfileView {...commonProps} />;
    default:
      return (
        <div className="p-6 text-red-500 font-medium">
          Invalid role: {user.role}
        </div>
      );
  }
}