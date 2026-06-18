import { useState } from "react";
import API from "../../../services/apiClient";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import { FaGooglePay, FaCcVisa, FaCreditCard } from "react-icons/fa";
import { MdSecurity, MdVerified } from "react-icons/md";
import { BsCashCoin } from "react-icons/bs";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const paymentData = location.state || {};
  const { user } = useAuth();

  const [selectedMethod, setSelectedMethod] = useState("upi");

  const medicinesTotal = Number(paymentData?.amount || 0);
  const deliveryCharges = 0;
  const discount = 0;
  const totalAmount = Number(paymentData?.amount || 0);

  // =========================
  // RAZORPAY PAYMENT
  // =========================
  const handleRazorpayPayment = async () => {
  try {
    // FETCH KEY FROM BACKEND
    const { data: keyData } = await API.get("/users/razorpay-key");

    // CREATE ORDER
    const { data } = await API.post("/payments/create-order", {
      amount: totalAmount,
    });

    const options = {
      key: keyData.key,  // ✅ backend se aa rahi hai
      amount: data.order.amount,
      currency: data.order.currency,
      name: "A Pharmacy",
      description: "Medicine Order Payment",
      image: "https://cdn-icons-png.flaticon.com/512/4320/4320337.png",
      order_id: data.order.id,

        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
        handler: async function (response) {

          try {

            // VERIFY PAYMENT
            await API.post("/payments/verify-payment", {
              orderId: paymentData.orderId,
              amount: totalAmount,
              razorpay_order_id:
                response?.razorpay_order_id,
              razorpay_payment_id:
                response?.razorpay_payment_id,
              razorpay_signature:
                response?.razorpay_signature,
            });

            // MARK ORDER AS PAID
            await API.put(
              `/orders/${paymentData.orderId}/pay`,
              {}
            );

            toast.success("Payment Verified Successfully");
            setTimeout(() => {
              navigate("/dashboard/track-orders");
            }, 1200);

            localStorage.removeItem("orderData");

            if (user?._id) {
              localStorage.removeItem(
                `reviewOrders_${user._id}`
              );

              localStorage.removeItem(
                `customerBillingRows_${user._id}`
              );
            }

            navigate("/dashboard/track-orders");

          } catch (error) {

            console.log(
              "VERIFY PAYMENT ERROR:",
              error?.response?.data || error
            );

            toast.error(
              error?.response?.data?.message ||
              "Payment verification failed"
            );
          }
        },

        prefill: {
          name: user?.name || "Customer",
          email: user?.email || "customer@gmail.com",
          contact: user?.phone || user?.mobile || "9999999999",
        },

        notes: {
          address: "Medicine Delivery",
        },

        theme: {
          color: "#16a34a",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
        "Payment failed"
      );
    }
  };

  // =========================
  // COD ORDER
  // =========================
  const handleCashOrder = () => {
    toast.success(
      "Cash on delivery order placed successfully"
    );

    localStorage.removeItem("orderData");

    if (user?._id) {
      localStorage.removeItem(
        `reviewOrders_${user._id}`
      );

      localStorage.removeItem(
        `customerBillingRows_${user._id}`
      );
    }

    navigate("/dashboard/track-orders");
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-4 md:p-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">

        <div>

          <h1 className="text-3xl font-bold text-green-900">
            Payment
          </h1>

          <div className="w-16 h-1 bg-green-600 mt-2 rounded-full"></div>

          <p className="text-gray-500 mt-2">
            Complete your medicine order payment securely.
          </p>

        </div>

        {/* SECURITY */}
        <div
          className="
            hidden
            md:flex
            items-center
            gap-3
            bg-green-50
            border
            border-green-200
            px-5
            py-3
            rounded-2xl
          "
        >

          <MdVerified className="text-2xl text-green-700" />

          <div>

            <p className="text-sm font-bold text-green-800">
              100% Secure
            </p>

            <span className="text-xs text-green-700">
              Razorpay Trusted Checkout
            </span>

          </div>

        </div>

      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-6">

        {/* LEFT SIDE */}
        <div
          className="
            bg-white
            rounded-[30px]
            border
            border-gray-100
            shadow-sm
            overflow-hidden
          "
        >

          {/* HEADER */}
          <div
            className="
              px-6
              py-5
              border-b
              border-gray-100
              bg-[#fcfcfc]
            "
          >

            <h2 className="text-xl font-bold">
              Choose Payment Method
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Fast, secure & encrypted checkout.
            </p>

          </div>

          {/* METHODS */}
          <div className="p-5 space-y-4">

            {/* UPI */}
            <div
              onClick={() =>
                setSelectedMethod("upi")
              }
              className={`
                border
                rounded-3xl
                p-5
                cursor-pointer
                transition-all
                ${selectedMethod === "upi"
                  ? "border-green-600 bg-green-50"
                  : "border-gray-200 bg-white"
                }
              `}
            >

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <div
                    className="
                      w-14
                      h-14
                      rounded-2xl
                      bg-blue-100
                      flex
                      items-center
                      justify-center
                    "
                  >

                    <FaGooglePay className="text-3xl text-blue-700" />

                  </div>

                  <div>

                    <h3 className="font-bold text-lg">
                      UPI Payment
                    </h3>

                    <p className="text-sm text-gray-500">
                      Google Pay, PhonePe, Paytm
                    </p>

                  </div>

                </div>

                <input
                  type="radio"
                  checked={
                    selectedMethod === "upi"
                  }
                  readOnly
                  className="w-5 h-5"
                />

              </div>

              {selectedMethod === "upi" && (

                <button
                  onClick={
                    handleRazorpayPayment
                  }
                  className="
                    mt-5
                    w-full
                    bg-green-600
                    hover:bg-green-700
                    text-white
                    py-4
                    rounded-2xl
                    font-bold
                  "
                >
                  Continue With UPI
                </button>

              )}

            </div>

            {/* CARD */}
            <div
              onClick={() =>
                setSelectedMethod("card")
              }
              className={`
                border
                rounded-3xl
                p-5
                cursor-pointer
                transition-all
                ${selectedMethod === "card"
                  ? "border-green-600 bg-green-50"
                  : "border-gray-200 bg-white"
                }
              `}
            >

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <div
                    className="
                      w-14
                      h-14
                      rounded-2xl
                      bg-purple-100
                      flex
                      items-center
                      justify-center
                    "
                  >

                    <FaCcVisa className="text-3xl text-purple-700" />

                  </div>

                  <div>

                    <h3 className="font-bold text-lg">
                      Credit / Debit Card
                    </h3>

                    <p className="text-sm text-gray-500">
                      Visa, Mastercard & Rupay
                    </p>

                  </div>

                </div>

                <input
                  type="radio"
                  checked={
                    selectedMethod === "card"
                  }
                  readOnly
                  className="w-5 h-5"
                />

              </div>

              {selectedMethod === "card" && (

                <button
                  onClick={
                    handleRazorpayPayment
                  }
                  className="
                    mt-5
                    w-full
                    bg-green-600
                    hover:bg-green-700
                    text-white
                    py-4
                    rounded-2xl
                    font-bold
                  "
                >
                  Continue With Card
                </button>

              )}

            </div>

            {/* COD */}
            <div
              onClick={() =>
                setSelectedMethod("cash")
              }
              className={`
                border
                rounded-3xl
                p-5
                cursor-pointer
                transition-all
                ${selectedMethod === "cash"
                  ? "border-green-600 bg-green-50"
                  : "border-gray-200 bg-white"
                }
              `}
            >

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <div
                    className="
                      w-14
                      h-14
                      rounded-2xl
                      bg-yellow-100
                      flex
                      items-center
                      justify-center
                    "
                  >

                    <BsCashCoin className="text-3xl text-yellow-700" />

                  </div>

                  <div>

                    <h3 className="font-bold text-lg">
                      Cash On Delivery
                    </h3>

                    <p className="text-sm text-gray-500">
                      Pay after receiving medicines
                    </p>

                  </div>

                </div>

                <input
                  type="radio"
                  checked={
                    selectedMethod === "cash"
                  }
                  readOnly
                  className="w-5 h-5"
                />

              </div>

              {selectedMethod === "cash" && (
                <button
                  onClick={handleCashOrder}
                  className="
      mt-5
      w-full
      bg-green-600
      hover:bg-green-700
      text-white
      py-4
      rounded-2xl
      font-bold
    "
                >
                  Place COD Order
                </button>
              )}

            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div
          className="
            bg-white
            rounded-[30px]
            border
            border-gray-100
            shadow-sm
            h-fit
            sticky
            top-5
          "
        >

          {/* HEADER */}
          <div
            className="
              p-6
              border-b
              border-gray-100
            "
          >

            <h2 className="text-2xl font-bold">
              Order Summary
            </h2>

          </div>

          {/* CONTENT */}
          <div className="p-6 space-y-5">

            <div className="flex justify-between">

              <span className="text-gray-500">
                Medicines Total
              </span>

              <span className="font-semibold">
                ₹{medicinesTotal.toFixed(2)}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-gray-500">
                Delivery Charges
              </span>

              <span className="font-semibold">
                ₹{deliveryCharges.toFixed(2)}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-gray-500">
                Discount
              </span>

              <span className="font-semibold text-green-600">
                - ₹{discount.toFixed(2)}
              </span>

            </div>

            {/* TOTAL */}
            <div className="border-t border-dashed pt-5">

              <div className="flex justify-between items-center">

                <div>

                  <p className="text-gray-500 text-sm">
                    Total Payable
                  </p>

                  <h1 className="text-4xl font-extrabold text-black">
                    ₹{totalAmount.toFixed(2)}
                  </h1>

                </div>

                <div
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-green-100
                    flex
                    items-center
                    justify-center
                  "
                >

                  <FaCreditCard className="text-2xl text-green-700" />

                </div>

              </div>

            </div>

            {/* SECURITY */}
            <div
              className="
                bg-[#f5f7fb]
                rounded-2xl
                p-4
                flex
                items-start
                gap-3
              "
            >

              <MdSecurity className="text-2xl text-green-700 mt-1" />

              <div>

                <h3 className="font-semibold">
                  Secure Payments
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Your payment information is
                  encrypted and securely processed.
                </p>

              </div>

            </div>

            {/* FINAL BUTTON */}
            <button
              onClick={
                selectedMethod === "cash"
                  ? handleCashOrder
                  : handleRazorpayPayment
              }
              className="
                w-full
                bg-green-600
                hover:bg-green-700
                text-white
                py-4
                rounded-2xl
                font-bold
                text-lg
                transition-all
              "
            >
              {
                selectedMethod === "cash"
                  ? "Place COD Order"
                  : `Pay ₹${totalAmount.toFixed(2)}`
              }
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}