import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL;

export default function AdminControlsSection() {

  // ================= STATES =================
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [statsFilter, setStatsFilter] = useState("all");
  const [roleModal, setRoleModal] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [deleteModal, setDeleteModal] = useState(null); // { userId }

  // ================= FETCH USERS =================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API}/admin/users`,
          { credentials: "include" }
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch users");
        setUsers(data.users || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // ================= CHANGE ROLE =================
  const changeRole = async () => {
    if (!selectedRole || !roleModal) return;
    try {
      setActionLoading("role-" + roleModal.userId);
      const response = await fetch(
        `${API}/admin/users/change-role`,
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
      toast.success(data.message);
      setRoleModal(null);
      setSelectedRole("");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
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
        `${API}/admin/users/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      toast.success(data.message);
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, isBlocked: !isBlocked } : user
        )
      );
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setActionLoading("");
    }
  };

  // ================= SOFT DELETE =================
  const softDeleteUser = async (userId) => {
    try {
      setActionLoading("delete-" + userId);
      const response = await fetch(
        `${API}/admin/users/soft-delete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      const tenDaysFromNow = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, deleteAt: tenDaysFromNow.toISOString(), deletionRequested: true }
            : user
        )
      );
      toast.success(data.message);
      setDeleteModal(null);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setActionLoading("");
    }
  };

  // ================= RESTORE USER =================
  const restoreUser = async (userId) => {
    try {
      setActionLoading("restore-" + userId);
      const response = await fetch(
        `${API}/admin/users/restore`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      toast.success(data.message);
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, deleteAt: null, deletionRequested: false }
            : user
        )
      );
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setActionLoading("");
    }
  };

  // ================= FILTER =================
  const filteredUsers = users.filter((user) => {

  // Role Filter
  const roleMatch =
    activeFilter === "All"
      ? true
      : user.role?.toLowerCase() === activeFilter.toLowerCase();

  // Stats Card Filter
  const statsMatch =
    statsFilter === "all"
      ? true
      : statsFilter === "blocked"
      ? user.isBlocked
      : statsFilter === "pending"
      ? user.deletionRequested
      : true;

  return roleMatch && statsMatch;
});

  // ================= COUNTS =================
  const totalUsers = users.length;
  const blockedUsers = users.filter((u) => u.isBlocked).length;
  const pendingDelete = users.filter((u) => u.deletionRequested).length;

  // ================= DAYS REMAINING =================
  const getDaysRemaining = (deleteAt) => {
    if (!deleteAt) return null;
    const diff = new Date(deleteAt) - new Date();
    return Math.max(
      0,
      Math.ceil(diff / (1000 * 60 * 60 * 24))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* ===== Change Role Modal ===== */}
      {roleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-96 overflow-hidden">

            {/* Header */}
            <div className="bg-green-800 px-6 py-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg leading-tight">Change User Role</h3>
                <p className="text-green-200 text-sm mt-0.5">
                  Current:{" "}
                  <span className="capitalize font-bold text-white bg-white/20 px-2 py-0.5 rounded-lg">
                    {roleModal.currentRole}
                  </span>
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">

              <p className="text-sm font-semibold text-gray-700 mb-3">
                Select a new role to assign
              </p>

              <div className="flex flex-col gap-2 mb-6">
                {[
                  { value: "admin", label: "Admin", desc: "Full access to all features", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-600", dot: "bg-blue-600" },
                  { value: "staff", label: "Staff", desc: "Can manage orders and medicines", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-600", dot: "bg-purple-600" },
                  { value: "customer", label: "Customer", desc: "Standard customer access", color: "text-green-700", bg: "bg-green-50", border: "border-green-600", dot: "bg-green-600" },
                ].map((r) => {
                  const isSelected = selectedRole === r.value;
                  const isCurrent = r.value === roleModal.currentRole;
                  return (
                    <button
                      key={r.value}
                      onClick={() => setSelectedRole(r.value)}
                      className={`
                  flex items-center gap-4 px-4 py-3.5 rounded-2xl border-2 text-left transition w-full
                  ${isSelected
                          ? `${r.bg} ${r.border}`
                          : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100"
                        }
                `}
                    >
                      {/* Radio dot */}
                      <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                  ${isSelected ? r.border : "border-gray-400"}
                `}>
                        {isSelected && (
                          <div className={`w-2.5 h-2.5 rounded-full ${r.dot}`} />
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${isSelected ? r.color : "text-gray-800"}`}>
                          {r.label}
                        </p>
                        <p className={`text-xs mt-0.5 ${isSelected ? r.color : "text-gray-500"} opacity-80`}>
                          {r.desc}
                        </p>
                      </div>

                      {/* Current badge */}
                      {isCurrent && (
                        <span className="shrink-0 text-xs font-bold text-green-700 bg-green-100 border border-green-300 px-2.5 py-1 rounded-xl">
                          Current
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={changeRole}
                  disabled={
                    !selectedRole ||
                    selectedRole === roleModal.currentRole ||
                    actionLoading === "role-" + roleModal.userId
                  }
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-green-700 text-white text-sm font-bold hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  {actionLoading === "role-" + roleModal.userId ? "Saving..." : "Confirm Change"}
                </button>
                <button
                  onClick={() => { setRoleModal(null); setSelectedRole(""); }}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ===== Delete Confirmation Modal ===== */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-96 overflow-hidden">

            {/* Header */}
            <div className="bg-red-600 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base">Delete User?</h3>
                  <p className="text-red-200 text-xs mt-0.5">This action can be undone within 10 days</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">

              {/* Info Box */}
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-5">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-orange-700 mb-1">Soft Delete — 10 Day Window</p>
                    <p className="text-xs text-orange-600 leading-relaxed">
                      User will be <strong>hidden immediately</strong> but permanently deleted only after{" "}
                      <strong>10 days</strong>. You can restore them anytime before that.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => softDeleteUser(deleteModal.userId)}
                  disabled={actionLoading === "delete-" + deleteModal.userId}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition disabled:opacity-50"
                >
                  {actionLoading === "delete-" + deleteModal.userId ? "Deleting..." : "Yes, Delete"}
                </button>
                <button
                  onClick={() => setDeleteModal(null)}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ===== Header ===== */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-900">Admin Controls</h1>
        <div className="w-16 h-1 bg-green-600 mt-1 rounded"></div>
        <p className="text-gray-500 mt-3">Block, unblock, change roles or delete users</p>
      </div>

      {/* ===== Stats ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
  {[
    {
      label: "Total Users",
      value: totalUsers,
      border: "border-green-700",
      text: "text-green-700",
      filter: "all",
    },
    {
      label: "Blocked Users",
      value: blockedUsers,
      border: "border-orange-500",
      text: "text-orange-500",
      filter: "blocked",
    },
    {
      label: "Pending Deletion",
      value: pendingDelete,
      border: "border-red-500",
      text: "text-red-500",
      filter: "pending",
    },
  ].map((stat) => (
    <button
      key={stat.label}
      onClick={() => setStatsFilter(stat.filter)}
      className={`
        bg-white border-l-4 ${stat.border}
        rounded-2xl p-5 shadow-sm text-left transition
        hover:shadow-lg hover:-translate-y-1
        ${
          statsFilter === stat.filter
            ? "ring-2 ring-green-600"
            : ""
        }
      `}
    >
      <p className="text-sm text-gray-500">{stat.label}</p>

      <h2 className={`text-3xl font-bold ${stat.text} mt-2`}>
        {stat.value}
      </h2>
    </button>
  ))}
</div>

      {/* ===== Filter Tabs ===== */}
      <div className="flex flex-wrap gap-3 mb-6">
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

      {/* ===== Loading / Error ===== */}
      {loading && <div className="text-gray-500 text-sm">Loading users...</div>}
      {error && <div className="text-red-500 text-sm">{error}</div>}

      {/* ===== Table ===== */}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="min-w-full text-sm">

            <thead className="bg-green-800 text-white">
              <tr>
                {["#", "Name", "Email", "Phone", "Role", "Status", "Blocked", "Deletion", "Actions"].map((h) => (
                  <th key={h} className="p-4 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user, index) => {
                const daysLeft = getDaysRemaining(user.deleteAt);
                const isPendingDelete = !!user.deleteAt;

                return (
                  <tr
                    key={user._id || index}
                    className={`border-t transition ${isPendingDelete ? "bg-red-50" : "hover:bg-gray-50"
                      }`}
                  >
                    <td className="p-4 text-gray-500">{index + 1}</td>

                    <td className="p-4 font-semibold text-blue-600 whitespace-nowrap">
                      {user.name || user.username}
                    </td>

                    <td className="p-4">{user.email}</td>

                    <td className="p-4">{user.phone}</td>

                    <td className="p-4 capitalize">{user.role}</td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${user.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : user.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                        {user.status}
                      </span>
                    </td>

                    {/* Blocked */}
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${user.isBlocked
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                        }`}>
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>

                    {/* Deletion countdown */}
                    <td className="p-4 whitespace-nowrap">
                      {isPendingDelete ? (
                        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-orange-100 text-orange-700">
                          🗑 {daysLeft}d left
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2 min-w-[220px]">

                        {/* Change Role */}
                        <button
                          onClick={() => {
                            setRoleModal({ userId: user._id, currentRole: user.role });
                            setSelectedRole(user.role || "");
                          }}
                          disabled={user.deletionRequested}
                          className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Change Role
                        </button>

                        {/* Block / Unblock */}
                        <button
                          onClick={() => toggleBlock(user._id, user.isBlocked)}
                          disabled={actionLoading === "block-" + user._id || user.deletionRequested}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition disabled:opacity-50 ${user.isBlocked
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                            }`}
                        >
                          {actionLoading === "block-" + user._id
                            ? "..." : user.isBlocked ? "Unblock" : "Block"}
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
                            onClick={() => setDeleteModal({ userId: user._id })}
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

    </div>
  );
}