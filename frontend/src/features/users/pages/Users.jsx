import {
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import { toast } from "react-toastify";

import {
  getAllUsers,
  updateUserStatus,
} from "../../../services/commonAPI";

import UsersTable from "../../../components/tables/UsersTable";

export default function Users({
  role,
  title = "Users",
}) {

  // =========================
  // STATES
  // =========================
  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  // ✅ ROLE FILTER
  const [roleFilter, setRoleFilter] =
    useState("all");

  // ✅ STATUS FILTER
  const [statusFilter, setStatusFilter] =
    useState("all");

  // ✅ QUERY PARAMS
  const [searchParams] =
    useSearchParams();

  // ✅ MANAGED USERS PARAM
  const managedBy =
    searchParams.get(
      "managedBy"
    );

  // ✅ STATUS PARAM FROM URL
const statusFromUrl =
  searchParams.get(
    "status"
  );

  // =========================
  // FETCH USERS
  // =========================
  useEffect(() => {
    fetchUsers();
  }, [role, managedBy]);

  const fetchUsers = async () => {

    try {

      setLoading(true);

      const data =
        await getAllUsers();

      let filteredUsers =
        data.users || [];

      // =========================
      // PAGE ROLE FILTER
      // =========================
      if (role) {

        filteredUsers =
          filteredUsers.filter(
            (u) =>
              u.role === role
          );
      }

      // =========================
      // APPROVED CUSTOMERS ONLY
      // =========================
      if (role === "customer") {
        filteredUsers =
          filteredUsers.filter(
            (u) =>
              u.status === "approved"
          );
      }
      
// =========================
// MANAGED USERS FILTER
// =========================
if (managedBy) {

  filteredUsers =
    filteredUsers.filter(
      (u) =>
        String(
          u.actionBy?.userId?._id ||
          u.actionBy?.userId
        ) === String(managedBy)
    );
}

      setUsers(filteredUsers);

    } catch (err) {

      console.error(err);

      toast.error(
        "Failed to load users"
      );

    } finally {

      setLoading(false);

    }
  };

  // =========================
  // RESET SEARCH
  // =========================
  useEffect(() => {

    setSearch("");

  }, [
    statusFilter,
    roleFilter,
  ]);

  // =========================
// APPLY URL STATUS FILTER
// =========================
useEffect(() => {

  if (statusFromUrl) {

    setStatusFilter(
      statusFromUrl
    );

  }

}, [statusFromUrl]);

  // =========================
  // STATUS UPDATE
  // =========================
  const handleStatusChange =
    async (
      id,
      status
    ) => {

      try {

        const res =
          await updateUserStatus(
            id,
            status
          );

        toast.success(
          `User ${status}`
        );

        const updatedUser =
          res.user;

        setUsers((prev) =>
          prev.map((u) =>
            u._id === id
              ? updatedUser
              : u
          )
        );

      } catch (err) {

        console.error(err);

        toast.error(
          "Action failed"
        );
      }
    };

  const handleApprove = (id) => {

    handleStatusChange(
      id,
      "approved"
    );
  };

  const handleReject = (id) => {

    if (
      !window.confirm(
        "Reject this user?"
      )
    ) {
      return;
    }

    handleStatusChange(
      id,
      "rejected"
    );
  };

  // =========================
  // FILTERED USERS
  // =========================
  const filteredUsers = users

    // SEARCH
    .filter((u) =>
      u.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    )

    // ROLE FILTER
    .filter((u) =>
      roleFilter === "all"
        ? true
        : u.role === roleFilter
    )

    // STATUS FILTER
    .filter((u) =>
      statusFilter === "all"
        ? true
        : u.status === statusFilter
    )

    // SORT
    .sort((a, b) =>
      a.name.localeCompare(
        b.name
      )
    );

  // =========================
  // STATS
  // =========================
  const total =
    users.length;

  const approved =
    users.filter(
      (u) =>
        u.status ===
        "approved"
    ).length;

  const pending =
    users.filter(
      (u) =>
        u.status ===
        "pending"
    ).length;

  const rejected =
    users.filter(
      (u) =>
        u.status ===
        "rejected"
    ).length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">

        <div>

          <h1 className="text-2xl font-bold text-green-900">
            {title}
          </h1>

          <div className="w-16 h-1 bg-green-600 mt-1 rounded"></div>

        </div>

        <input
          type="text"
          placeholder="Search users..."
          className="border px-4 py-2 rounded-xl w-full lg:w-72 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </div>

      {/* ========================= */}
      {/* ROLE FILTER */}
      {/* ========================= */}
      <div className="flex flex-wrap gap-3 mb-6">

        {[
          "all",
          "admin",
          "staff",
          "customer",
        ].map((item) => (

          <button
            key={item}
            onClick={() =>
              setRoleFilter(item)
            }
            className={`px-5 py-2 rounded-xl text-sm font-medium transition

            ${roleFilter === item
                ? "bg-green-700 text-white shadow"
                : "bg-white border hover:bg-gray-100"
              }
          `}
          >
            {item
              .charAt(0)
              .toUpperCase() +
              item.slice(1)}
          </button>

        ))}

      </div>

      {/* ========================= */}
      {/* STATS */}
      {/* ========================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        {/* TOTAL */}
        <div
          onClick={() =>
            setStatusFilter(
              "all"
            )
          }
          className={`cursor-pointer bg-white p-5 rounded-2xl shadow-sm border-l-4 transition hover:shadow-md

          ${statusFilter ===
              "all"
              ? "border-green-800 scale-[1.02]"
              : "border-green-600"
            }
        `}
        >

          <p className="text-sm text-gray-500">
            Total Users
          </p>

          <h2 className="text-2xl font-bold text-green-700 mt-1">
            {total}
          </h2>

        </div>

        {/* APPROVED */}
        <div
          onClick={() =>
            setStatusFilter(
              "approved"
            )
          }
          className={`cursor-pointer bg-white p-5 rounded-2xl shadow-sm border-l-4 transition hover:shadow-md

          ${statusFilter ===
              "approved"
              ? "border-green-800 scale-[1.02]"
              : "border-green-600"
            }
        `}
        >

          <p className="text-sm text-gray-500">
            Approved
          </p>

          <h2 className="text-2xl font-bold text-green-700 mt-1">
            {approved}
          </h2>

        </div>

        {/* PENDING */}
        <div
          onClick={() =>
            setStatusFilter(
              "pending"
            )
          }
          className={`cursor-pointer bg-white p-5 rounded-2xl shadow-sm border-l-4 transition hover:shadow-md

          ${statusFilter ===
              "pending"
              ? "border-yellow-600 scale-[1.02]"
              : "border-yellow-500"
            }
        `}
        >

          <p className="text-sm text-gray-500">
            Pending
          </p>

          <h2 className="text-2xl font-bold text-yellow-500 mt-1">
            {pending}
          </h2>

        </div>

        {/* REJECTED */}
        <div
          onClick={() =>
            setStatusFilter(
              "rejected"
            )
          }
          className={`cursor-pointer bg-white p-5 rounded-2xl shadow-sm border-l-4 transition hover:shadow-md

          ${statusFilter ===
              "rejected"
              ? "border-red-700 scale-[1.02]"
              : "border-red-500"
            }
        `}
        >

          <p className="text-sm text-gray-500">
            Rejected
          </p>

          <h2 className="text-2xl font-bold text-red-500 mt-1">
            {rejected}
          </h2>

        </div>

      </div>

      {/* ========================= */}
      {/* USERS TABLE */}
      {/* ========================= */}
      <UsersTable
        users={filteredUsers}
        loading={loading}
        onApprove={handleApprove}
        onReject={handleReject}
      />

    </div>
  );
}