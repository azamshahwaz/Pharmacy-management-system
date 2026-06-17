import { useNavigate } from "react-router-dom";

import { formatDateTime } from "../../utils/formatDate";

export default function UsersTable({
  users = [],
  loading,
  onApprove,
  onReject,
}) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow border p-8 text-center text-gray-500">
        Loading users...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border p-3 w-full overflow-x-auto">

      <table className="w-full min-w-[750px] text-sm border-separate border-spacing-y-3">

        <thead>
          <tr className="bg-green-900 text-white text-left">

            <th className="p-3 rounded-tl-xl">
              #
            </th>

            <th className="p-3">
              Name
            </th>

            <th className="p-3">
              Email
            </th>

            <th className="p-3">
              Phone
            </th>

            <th className="p-3">
              Role
            </th>

            <th className="p-3">
              Status
            </th>

            <th className="p-3">
              Action By
            </th>

            <th className="p-3 rounded-tr-xl">
              Address
            </th>

          </tr>
        </thead>

        <tbody>
          {users.length === 0 ? (
            <tr>
              <td
                colSpan="8"
                className="text-center py-6 text-gray-400"
              >
                No users found
              </td>
            </tr>
          ) : (
            users.map((user, index) => (
              <tr
                key={user._id}
                onClick={() =>
                  navigate(
                    `/dashboard/users/${user._id}`
                  )
                }
                className="bg-white shadow-sm hover:shadow-md hover:bg-gray-50 cursor-pointer transition"
              >

                <td className="p-3 text-gray-500 font-medium rounded-l-lg">
                  {index + 1}
                </td>

                <td className="font-medium text-blue-600">
                  {user.name}
                </td>

                <td>
                  {user.email}
                </td>

                <td>
                  {user.phone || "-"}
                </td>

                <td className="capitalize">
                  {user.role}
                </td>

                <td>
                  {user.status === "approved" ? (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                      Approved
                    </span>
                  ) : user.status ===
                    "rejected" ? (
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-medium">
                      Rejected
                    </span>
                  ) : (
                    <div className="flex gap-2 items-center">

                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-medium">
                        Pending
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onApprove(user._id);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                      >
                        ✔
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReject(user._id);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                      >
                        ✖
                      </button>

                    </div>
                  )}
                </td>

                <td>
                  {user.actionBy?.name ? (
                    <div className="text-xs leading-5">

                      <p className="font-medium">
                        {user.actionBy.name}
                      </p>

                      <p className="text-gray-500">
                        {user.actionBy.email}
                      </p>

                      <p className="text-gray-400">
                        {user.actionBy.actionAt
                          ? formatDateTime(
                              user.actionBy.actionAt
                            )
                          : "-"}
                      </p>

                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">
                      No action yet
                    </span>
                  )}
                </td>

                <td className="rounded-r-lg">
                  {user.address ? (
                    <div className="text-xs leading-5">

                      <p className="font-medium">
                        {user.address.shopName}
                      </p>

                      <p className="text-gray-500">
                        {user.address.street},{" "}
                        {user.address.city}
                      </p>

                    </div>
                  ) : (
                    "-"
                  )}
                </td>

              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}