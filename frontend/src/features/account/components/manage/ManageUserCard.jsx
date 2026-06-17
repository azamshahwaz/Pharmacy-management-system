import { useEffect, useState } from "react";
import SectionCard from "../common/SectionCard";

export default function ManageUsersCard() {

  // ================= STATES =================
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [roleModal, setRoleModal] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  // ================= FETCH USERS =================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:5000/api/v1/admin/managed-users",
          { credentials: "include" }
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch users");
        setUsers(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // ================= UPDATE USER STATUS =================
  const updateUserStatus = async (id, status) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/admin/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update user");
      setUsers((prev) =>
        prev.map((user) => (user._id === id ? { ...user, status } : user))
      );
    } catch (error) {
      console.error(error);
    }
  };

  // ================= CHANGE ROLE =================
  const changeRole = async () => {
    if (!selectedRole || !roleModal) return;
    try {
      setActionLoading("role-" + roleModal.userId);
      const response = await fetch(
        "http://localhost:5000/api/v1/admin/users/change-role",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId: roleModal.userId, role: selectedRole }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to change role");
      setUsers((prev) =>
        prev.map((user) =>
          user._id === roleModal.userId ? { ...user, role: selectedRole } : user
        )
      );
      setRoleModal(null);
      setSelectedRole("");
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading("");
    }
  };

  // ================= BLOCK / UNBLOCK =================
  const toggleBlock = async (userId, isBlocked) => {
    try {
      setActionLoading("block-" + userId);
      const endpoint = isBlocked ? "unblock" : "block";
      const response = await fetch(
        `http://localhost:5000/api/v1/admin/users/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, isBlocked: !isBlocked } : user
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading("");
    }
  };

  // ================= SOFT DELETE =================
  const softDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure? User will be permanently deleted after 10 days."))
      return;
    try {
      setActionLoading("delete-" + userId);
      const response = await fetch(
        "http://localhost:5000/api/v1/admin/users/soft-delete",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Set deleteAt 10 days from now in UI
      const tenDaysFromNow = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, deleteAt: tenDaysFromNow.toISOString(), deletionRequested: true }
            : user
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading("");
    }
  };

  // ================= RESTORE USER =================
  const restoreUser = async (userId) => {
    try {
      setActionLoading("restore-" + userId);
      const response = await fetch(
        "http://localhost:5000/api/v1/admin/users/restore",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, deleteAt: null, deletionRequested: false }
            : user
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading("");
    }
  };

  // ================= FILTER USERS =================
  const filteredUsers =
    activeFilter === "All"
      ? users
      : users.filter(
          (user) => user.role?.toLowerCase() === activeFilter.toLowerCase()
        );

  // ================= COUNTS =================
  const totalUsers = users.length;
  const approvedUsers = users.filter((u) => u.status === "approved").length;
  const pendingUsers = users.filter((u) => u.status === "pending").length;
  const rejectedUsers = users.filter((u) => u.status === "rejected").length;

  // ================= DAYS REMAINING =================
  const getDaysRemaining = (deleteAt) => {
    if (!deleteAt) return null;
    const diff = new Date(deleteAt) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <SectionCard title="Manage Users" subtitle="View and manage all users">

      {/* ===== Change Role Modal ===== */}
      {roleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-80">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Change Role
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Current: <span className="capitalize font-medium text-gray-600">{roleModal.currentRole}</span>
            </p>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select a role</option>
              {["admin", "staff", "customer"].map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={changeRole}
                disabled={!selectedRole || actionLoading === "role-" + roleModal.userId}
                className="flex-1 px-4 py-2 rounded-xl bg-green-700 text-white text-sm font-medium hover:bg-green-800 disabled:opacity-50 transition"
              >
                {actionLoading === "role-" + roleModal.userId ? "Saving..." : "Confirm"}
              </button>
              <button
                onClick={() => { setRoleModal(null); setSelectedRole(""); }}
                className="flex-1 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Top Controls ===== */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={() => setShowTable(!showTable)}
          className="px-5 py-2.5 rounded-xl bg-green-700 text-white text-sm font-medium hover:bg-green-800 transition"
        >
          {showTable ? "Hide Users" : "Manage Users"}
        </button>

        {["All", "Admin", "Staff", "Customer"].map((role) => (
          <button
            key={role}
            onClick={() => setActiveFilter(role)}
            className={`
              px-4 py-2 rounded-xl border text-sm font-medium transition
              ${activeFilter === role
                ? "bg-green-700 text-white border-green-700"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }
            `}
          >
            {role}
          </button>
        ))}
      </div>

      {/* ===== Stats ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Users",  value: totalUsers,    border: "border-green-700", text: "text-green-700" },
          { label: "Approved",     value: approvedUsers, border: "border-green-500", text: "text-green-600" },
          { label: "Pending",      value: pendingUsers,  border: "border-yellow-500", text: "text-yellow-500" },
          { label: "Rejected",     value: rejectedUsers, border: "border-red-500",   text: "text-red-500" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-white border-l-4 ${stat.border} rounded-2xl p-5 shadow-sm`}
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <h2 className={`text-3xl font-bold ${stat.text} mt-2`}>{stat.value}</h2>
          </div>
        ))}
      </div>

      {/* ===== Loading ===== */}
      {loading && (
        <div className="text-gray-500 text-sm">Loading users...</div>
      )}

      {/* ===== Error ===== */}
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {/* ===== Users Table ===== */}
      {!loading && !error && showTable && (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="min-w-full text-sm">

            {/* Head */}
            <thead className="bg-green-800 text-white">
              <tr>
                {[
                  "#", "Name", "Email", "Phone",
                  "Role", "Status", "Blocked",
                  "Deletion", "Address", "Date", "Actions",
                ].map((h) => (
                  <th key={h} className="p-4 text-left whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {filteredUsers.map((user, index) => {
                const daysLeft = getDaysRemaining(user.deleteAt);
                const isPendingDelete = !!user.deleteAt;

                return (
                  <tr
                    key={user._id || index}
                    className={`border-t transition ${
                      isPendingDelete ? "bg-red-50" : "hover:bg-gray-50"
                    }`}
                  >

                    {/* # */}
                    <td className="p-4 text-gray-500">{index + 1}</td>

                    {/* Name */}
                    <td className="p-4 font-semibold text-blue-600 whitespace-nowrap">
                      {user.name || user.username}
                    </td>

                    {/* Email */}
                    <td className="p-4">{user.email}</td>

                    {/* Phone */}
                    <td className="p-4">{user.phone}</td>

                    {/* Role */}
                    <td className="p-4 capitalize">{user.role}</td>

                    {/* Status */}
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          user.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : user.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    {/* Blocked */}
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          user.isBlocked
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>

                    {/* Deletion Countdown */}
                    <td className="p-4 whitespace-nowrap">
                      {isPendingDelete ? (
                        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-orange-100 text-orange-700">
                          🗑 {daysLeft}d left
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Address */}
                    <td className="p-4 text-gray-500">
                      {user.address?.city || user.address || "—"}
                    </td>

                    {/* Date */}
                    <td className="p-4 text-gray-500 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2 min-w-[280px]">

                        {/* Approve */}
                        <button
                          onClick={() => updateUserStatus(user._id, "approved")}
                          className="px-3 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 transition"
                        >
                          Approve
                        </button>

                        {/* Reject */}
                        <button
                          onClick={() => updateUserStatus(user._id, "rejected")}
                          className="px-3 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition"
                        >
                          Reject
                        </button>

                        {/* Change Role */}
                        <button
                          onClick={() => {
                            setRoleModal({ userId: user._id, currentRole: user.role });
                            setSelectedRole(user.role || "");
                          }}
                          className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition"
                        >
                          Change Role
                        </button>

                        {/* Block / Unblock */}
                        <button
                          onClick={() => toggleBlock(user._id, user.isBlocked)}
                          disabled={actionLoading === "block-" + user._id}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition disabled:opacity-50 ${
                            user.isBlocked
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                          }`}
                        >
                          {actionLoading === "block-" + user._id
                            ? "..."
                            : user.isBlocked ? "Unblock" : "Block"}
                        </button>

                        {/* Delete / Restore */}
                        {isPendingDelete ? (
                          <button
                            onClick={() => restoreUser(user._id)}
                            disabled={actionLoading === "restore-" + user._id}
                            className="px-3 py-1 rounded-lg bg-purple-100 text-purple-700 text-xs font-semibold hover:bg-purple-200 transition disabled:opacity-50"
                          >
                            {actionLoading === "restore-" + user._id ? "..." : "Restore"}
                          </button>
                        ) : (
                          <button
                            onClick={() => softDeleteUser(user._id)}
                            disabled={actionLoading === "delete-" + user._id}
                            className="px-3 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition disabled:opacity-50"
                          >
                            {actionLoading === "delete-" + user._id ? "..." : "Delete"}
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </SectionCard>
  );
}