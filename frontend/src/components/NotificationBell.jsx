import { useState, useEffect, useCallback, useRef } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../services/apiClient";

export default function NotificationBell({ user }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const role = user?.role || "customer";
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // ===============================
  // CLOSE ON OUTSIDE CLICK
  // ===============================
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // ===============================
  // FETCH — ADMIN / STAFF
  // ===============================
const fetchAdminStaff = useCallback(async () => {
  try {
    const [usersRes, ordersRes] = await Promise.all([
      API.get("/admin/users"),
API.get("/orders"),
    ]);

    const allUsers =
      usersRes.data?.users || usersRes.data || [];

    const allOrders =
      ordersRes.data?.data ||
      ordersRes.data?.orders ||
      ordersRes.data ||
      [];

    const pendingUsers = allUsers.filter(
      (u) => u.status === "pending"
    );

    const pendingOrders = allOrders.filter(
      (o) => o.status === "pending"
    );

    const notifs = [];

    if (pendingUsers.length > 0) {
      notifs.push({
        id: "pending-users",
        type: "yellow",
        label: `${pendingUsers.length} Pending User${
          pendingUsers.length > 1 ? "s" : ""
        }`,
        sub: "Waiting for approval",
        icon: "👤",
        onClick: () =>
          navigate("/dashboard/users?status=pending"),
      });
    }

    if (pendingOrders.length > 0) {
      notifs.push({
        id: "pending-orders",
        type: "blue",
        label: `${pendingOrders.length} Pending Order${
          pendingOrders.length > 1 ? "s" : ""
        }`,
        sub: "Waiting to be accepted",
        icon: "📦",
        onClick: () =>
          navigate("/dashboard/orders?status=pending"),
      });
    }

    setNotifications(notifs);
  } catch (err) {
    console.error("Bell fetch error:", err);
  }
}, [navigate]);

  // ===============================
  // FETCH — CUSTOMER
  // ===============================
  const fetchCustomer = useCallback(async () => {
  try {
    const res = await API.get("/orders/my-orders");

    const orders =
      res.data?.data ||
      res.data?.orders ||
      res.data ||
      [];

    const notifs = [];

    const acceptedOrders = orders.filter(
      (o) => o.status === "accepted"
    );

    const deliveredOrders = orders.filter(
      (o) => o.status === "delivered"
    );

    const rejectedOrders = orders.filter(
      (o) => o.status === "rejected"
    );

    rejectedOrders.forEach((o) => {
      notifs.push({
        id: o._id,
        type: "red",
        label: `Order #${o._id
          .slice(-6)
          .toUpperCase()} Rejected`,
        sub: "Your order was rejected",
        icon: "❌",
        onClick: () =>
          navigate(
            "/dashboard/orders?status=rejected"
          ),
      });
    });

    deliveredOrders.forEach((o) => {
      notifs.push({
        id: o._id,
        type: "green",
        label: `Order #${o._id
          .slice(-6)
          .toUpperCase()} Delivered`,
        sub: "Your order has been delivered",
        icon: "✅",
        onClick: () =>
          navigate(
            "/dashboard/orders?status=delivered"
          ),
      });
    });

    acceptedOrders.forEach((o) => {
      notifs.push({
        id: o._id,
        type: "blue",
        label: `Order #${o._id
          .slice(-6)
          .toUpperCase()} Accepted`,
        sub: "Your order is being prepared",
        icon: "🔵",
        onClick: () =>
          navigate(
            "/dashboard/orders?status=accepted"
          ),
      });
    });

    setNotifications(notifs);
  } catch (err) {
    console.error("Bell fetch error:", err);
  }
}, [navigate]);

  // ===============================
  // EFFECT + POLLING
  // ===============================
  useEffect(() => {
  if (!user) return;

  const fetchFn =
    role === "admin" || role === "staff"
      ? fetchAdminStaff
      : fetchCustomer;

  fetchFn();

  const interval = setInterval(fetchFn, 30000);

  return () => clearInterval(interval);
}, [
  user,
  role,
  fetchAdminStaff,
  fetchCustomer,
]);

  // ===============================
  // DOT COLOR — highest priority
  // ===============================
  const getDotColor = () => {
    if (notifications.length === 0) return null;
    if (notifications.some((n) => n.type === "red")) return "#E24B4A";
    if (notifications.some((n) => n.type === "yellow")) return "#EF9F27";
    if (notifications.some((n) => n.type === "green")) return "#639922";
    if (notifications.some((n) => n.type === "blue")) return "#378ADD";
    return null;
  };

  const dotColor = getDotColor();

  // ===============================
  // TYPE → STYLES
  // ===============================
  const typeStyle = {
    yellow: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      sub: "text-yellow-600",
      dot: "#EF9F27",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      sub: "text-blue-500",
      dot: "#378ADD",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      sub: "text-green-600",
      dot: "#639922",
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      sub: "text-red-500",
      dot: "#E24B4A",
    },
  };

  return (
    <div ref={dropdownRef} className="relative">

      {/* ================= BELL ICON ================= */}
      <div
        className="relative cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell className="text-gray-600 hover:text-black transition" />

        {/* DOT */}
        {dotColor && (
          <span
            style={{
              position: "absolute",
              top: -3,
              right: -3,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: dotColor,
              border: "2px solid white",
            }}
          />
        )}
      </div>

      {/* ================= DROPDOWN ================= */}
      {open && (
        <div className="absolute right-0 top-10 w-80 max-w-[90vw] bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">

          {/* HEADER */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 text-sm">
              🔔 Notifications
            </h3>
            {notifications.length > 0 && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {notifications.length}
              </span>
            )}
          </div>

          {/* ITEMS */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                <p className="text-2xl mb-2">🎉</p>
                No new notifications
              </div>
            ) : (
              notifications.map((n) => {
                const s = typeStyle[n.type];
                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      n.onClick();
                      setOpen(false);
                    }}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:brightness-95 transition ${s.bg} border-l-4 ${s.border}`}
                  >
                    {/* COLOR DOT */}
                    <span
                      style={{
                        marginTop: 4,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: s.dot,
                        flexShrink: 0,
                      }}
                    />

                    {/* TEXT */}
                    <div>
                      <p className={`text-sm font-semibold ${s.text}`}>
                        {n.icon} {n.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${s.sub}`}>
                        {n.sub}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* FOOTER */}
          {notifications.length > 0 && (
            <div
              className="px-4 py-2.5 border-t border-gray-100 text-center text-xs text-green-700 font-medium cursor-pointer hover:bg-green-50 transition"
              onClick={() => {
                navigate(
                  role === "customer"
                    ? "/dashboard/track-orders"
                    : "/dashboard/orders"
                );
                setOpen(false);
              }}
            >
              View all →
            </div>
          )}
        </div>
      )}
    </div>
  );
}