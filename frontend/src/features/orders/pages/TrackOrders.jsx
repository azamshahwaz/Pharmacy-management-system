import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../services/apiClient";
import {
  FiPackage, FiCheckCircle, FiClock, FiXCircle, FiTruck, FiDownload,
} from "react-icons/fi";

const statusSteps = ["pending", "accepted", "delivered"];

const TrackOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      // ✅ Token nahi — cookie jayegi automatically
      const { data } = await API.get("/orders/my-orders");
      setOrders(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading Orders...</p>
        </div>
      </div>
    );
  }

  // JSX same as before — no changes needed below this line
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-green-900">Track Orders</h1>
        <div className="w-24 h-1.5 bg-green-600 mt-3 rounded-full" />
        <p className="text-gray-500 mt-3 text-lg">Track your recent medicine orders and delivery status.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 shadow-sm border text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <FiPackage className="text-5xl text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-700 mt-5">No Orders Found</h2>
          <p className="text-gray-500 mt-3">Your placed orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => {
            const isPaid = order.isPaid === true || order.paymentStatus === "paid";
            const currentStep = statusSteps.indexOf(order.status);

            return (
              <div key={order._id} className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 max-w-6xl mx-auto">
                {/* TOP HEADER */}
                <div className="bg-gradient-to-r from-green-600 via-emerald-500 to-green-500 px-4 py-2 md:px-5 md:py-4 text-white relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                  <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    <div>
                      <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/20">
                        <FiPackage /> Medicine Order
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold mt-2 tracking-wide">
                        #{order._id.slice(-6).toUpperCase()}
                      </h2>
                      <p className="mt-1 text-green-50 text-sm">
                        Placed on {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-4 py-2 rounded-2xl text-sm font-semibold shadow-md border backdrop-blur-md transition-all duration-300 ${isPaid ? "bg-white text-green-700 border-white" : "bg-red-100 text-red-700 border-red-200"}`}>
                        {isPaid ? "Paid" : "Unpaid"}
                      </span>
                      <span className={`px-4 py-2 rounded-2xl text-sm font-semibold shadow-md capitalize border ${order.status === "delivered" ? "bg-green-100 text-green-700 border-green-200" : order.status === "rejected" ? "bg-red-100 text-red-700 border-red-200" : order.status === "accepted" ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-yellow-100 text-yellow-700 border-yellow-200"}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-6">
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-4 mb-8">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <FiTruck className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Delivery Update</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {order.status === "delivered" ? "Your order has been delivered successfully."
                          : order.status === "accepted" ? "Your order is being prepared for delivery."
                          : "Your order is waiting for confirmation."}
                      </p>
                    </div>
                  </div>

                  {/* TRACKER */}
                  <div className="mb-10">
                    <h3 className="text-xl font-bold text-gray-800 mb-8">Order Progress</h3>
                    {order.status === "rejected" ? (
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                          <FiXCircle className="text-red-600 text-2xl" />
                        </div>
                        <div>
                          <h4 className="font-bold text-red-700 text-lg">Order Rejected</h4>
                          <p className="text-red-500 text-sm mt-1">Your order could not be processed.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="absolute top-5 left-0 w-full h-1.5 bg-gray-200 rounded-full" />
                        <div className={`absolute top-5 left-0 h-1 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-700 ease-in-out ${order.status === "pending" ? "w-[10%]" : order.status === "accepted" ? "w-[55%]" : "w-full"}`} />
                        <div className="relative flex justify-between">
                          {statusSteps.map((step, index) => {
                            const active = index <= currentStep;
                            return (
                              <div key={step} className="flex flex-col items-center z-10">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${active ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                                  {step === "pending" ? <FiClock /> : <FiCheckCircle />}
                                </div>
                                <p className={`mt-3 text-sm font-semibold capitalize ${active ? "text-green-600" : "text-gray-500"}`}>{step}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ITEMS */}
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-xl font-bold text-gray-800">Order Items</h3>
                      <span className="text-sm text-gray-500">{order.items?.length} Items</span>
                    </div>
                    <div className="space-y-4">
                      {order.items?.map((item, index) => (
                        <div key={index} className="bg-gray-50 hover:bg-white hover:border-green-200 hover:shadow-md border rounded-2xl px-5 py-4 transition-all duration-300">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h4 className="font-bold text-lg text-gray-800 capitalize">{item.medicineName}</h4>
                              <p className="text-sm text-gray-700 mt-1">Quantity: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400">Total</p>
                              <h3 className="text-xl font-bold text-green-700">₹{(item.price * item.quantity).toFixed(2)}</h3>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TOTAL */}
                  <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-3xl p-6 shadow-md">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                      <div>
                        <p className="text-lg font-bold text-black">Total Amount</p>
                        <h2 className="text-4xl font-bold text-green-700 mt-2">
                          ₹{(order.grandTotal || order.items?.reduce((acc, item) => acc + item.price * item.quantity, 0)).toFixed(2)}
                        </h2>
                      </div>
                      <button onClick={() => navigate(`/dashboard/invoice/${order._id}`)} className="bg-white border border-green-200 text-green-700 text-2xl px-5 py-3 rounded-2xl font-bold hover:bg-green-100 transition flex items-center gap-2">
                        <FiDownload className="text-2xl font-bold stroke-[2.5]" /> Invoice
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrackOrders;