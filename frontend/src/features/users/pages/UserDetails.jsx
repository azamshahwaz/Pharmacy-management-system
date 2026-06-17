import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // ✅ added
import API from "../../../services/apiClient";
import { useAuth } from "../../../context/AuthContext";
import { formatDateTime } from "../../../utils/formatDate";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate(); // ✅ added

  const { user: currentUser } = useAuth();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activity, setActivity] = useState([]);

  const [tab, setTab] = useState("orders");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const userRes = await API.get(`/users/${id}`);
      setUser(userRes.data);

      const [ordersRes, paymentsRes, activityRes] = await Promise.all([
        API.get(`/users/${id}/orders`),
        API.get(`/users/${id}/payments`),
        API.get(`/users/${id}/activity`)
      ]);

      setOrders(ordersRes.data);
      setPayments(paymentsRes.data);
      setActivity(activityRes.data);

    } catch (err) {
      console.error("Error fetching user details:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Split Orders
  const currentOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "accepted"
  );

  const pastOrders = orders.filter(
    (o) => o.status === "delivered" || o.status === "rejected"
  );

  const formatAction = (action) => {
    switch (action) {
      case "USER_APPROVED": return "Approved a user";
      case "USER_REJECTED": return "Rejected a user";
      case "ORDER_ACCEPTED": return "Accepted an order";
      case "ORDER_REJECTED": return "Rejected an order";
      case "ORDER_DELIVERED": return "Delivered an order";
      default: return action;
    }
  };

  const canSeeActivity =
    currentUser?._id === id ||
    currentUser?.role === "admin" ||
    currentUser?.role === "staff";

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">

      {/* USER INFO */}
      <div className="mb-6 border-b pb-4">
        <h1 className="text-xl font-semibold">{user?.name}</h1>
        <p className="text-gray-500">{user?.email}</p>
        <p className="text-gray-400 text-sm capitalize">
          Role: {user?.role}
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-6 mb-6 border-b pb-2 text-sm">
        <button
          onClick={() => setTab("orders")}
          className={tab === "orders" ? "font-semibold border-b-2 border-blue-500" : ""}
        >
          Orders
        </button>

        <button
          onClick={() => setTab("payments")}
          className={tab === "payments" ? "font-semibold border-b-2 border-blue-500" : ""}
        >
          Payments
        </button>

        {canSeeActivity && (
          <button
            onClick={() => setTab("activity")}
            className={tab === "activity" ? "font-semibold border-b-2 border-blue-500" : ""}
          >
            Activity
          </button>
        )}
      </div>

      {/* ORDERS */}
      {tab === "orders" && (
        <div>
          <h2 className="font-semibold mb-2">Current Orders</h2>

          {currentOrders.length === 0 ? (
            <p className="text-gray-400">No current orders</p>
          ) : (
            currentOrders.map((order) => (
              <OrderCard key={order._id} order={order} navigate={navigate} />
            ))
          )}

          <h2 className="font-semibold mt-6 mb-2">Past Orders</h2>

          {pastOrders.length === 0 ? (
            <p className="text-gray-400">No past orders</p>
          ) : (
            pastOrders.map((order) => (
              <OrderCard key={order._id} order={order} navigate={navigate} />
            ))
          )}
        </div>
      )}

      {/* PAYMENTS */}
      {tab === "payments" && (
        <div>
          {payments.length === 0 ? (
            <p className="text-gray-400">No payments found</p>
          ) : (
            payments.map((p) => (
              <div key={p._id} className="border p-4 mb-3 rounded shadow-sm">

                <div className="flex justify-between">
                  <span>Total: ₹{p.amount}</span>
                  <span className="capitalize font-medium">{p.status}</span>
                </div>

                <div className="text-sm mt-2">
                  <p>Paid: ₹{p.amountPaid}</p>
                  <p className="text-red-500">Due: ₹{p.dueAmount}</p>
                </div>

                {(currentUser?.role === "admin" || currentUser?.role === "staff") && (
                  <PaymentUpdate paymentId={p._id} refresh={fetchData} />
                )}

              </div>
            ))
          )}
        </div>
      )}

      {/* ACTIVITY */}
      {tab === "activity" && canSeeActivity && (
        <div>
          {activity.length === 0 ? (
            <p className="text-gray-400">No activity found</p>
          ) : (
            activity.map((a) => (
              <div key={a._id} className="border p-3 mb-3 rounded shadow-sm">
                <p className="font-medium">{formatAction(a.action)}</p>
                <p className="text-sm text-gray-600">Target: {a.targetType}</p>
                <p className="text-xs text-gray-400">
                  {formatDateTime(a.createdAt || a.created_at)}
                </p>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}


// 🔥 ORDER CARD (CLICK ENABLED)
const OrderCard = ({ order, navigate }) => {
  return (
    <div
      className="border p-4 mb-4 rounded shadow-sm cursor-pointer hover:bg-gray-50"
      onClick={() => navigate(`/dashboard/orders/${order._id}`)}
    >
      <div className="flex justify-between mb-2">
        <span className="font-medium">₹{order.grandTotal}</span>
        <span className="capitalize">{order.status}</span>
      </div>

      {order.items.map((item, idx) => (
        <div key={idx} className="flex justify-between text-sm">
          <span>{item.medicineName} × {item.quantity}</span>
          <span>₹{item.total}</span>
        </div>
      ))}
    </div>
  );
};


// PAYMENT UPDATE
const PaymentUpdate = ({ paymentId, refresh }) => {
  const [amount, setAmount] = useState("");

  const handleUpdate = async () => {
    if (!amount) return;

    try {
      await API.put(`/payments/${paymentId}`, {
        amount: Number(amount),
      });

      setAmount("");
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-2 flex gap-2">
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border px-2 py-1 text-sm rounded"
      />
      <button
        onClick={handleUpdate}
        className="bg-blue-500 text-white px-3 py-1 text-sm rounded"
      >
        Update
      </button>
    </div>
  );
};