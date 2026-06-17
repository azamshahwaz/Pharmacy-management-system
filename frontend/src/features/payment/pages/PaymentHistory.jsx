import { useEffect, useState } from "react";
import API from "../../../services/apiClient";

import {
  FiCreditCard,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiSearch,
} from "react-icons/fi";

import {
  BsCashCoin,
} from "react-icons/bs";

import {
  FaGooglePay,
  FaCcVisa,
} from "react-icons/fa";

export default function PaymentHistory() {

  // =========================
  // STATES
  // =========================
  const [payments, setPayments] =
    useState([]);

  const [search, setSearch] =
    useState("");

  // =========================
  // LOAD PAYMENTS
  // =========================
  useEffect(() => {

    const fetchPayments = async () => {
      try {

        const { data } =
          await API.get("/payments/history");

        setPayments(data.payments || []);

      } catch (err) {
        console.error(
          "Failed to load payments",
          err
        );
      }
    };

    fetchPayments();

  }, []);

  // =========================
  // FILTER PAYMENTS
  // =========================
  const filteredPayments =
    payments.filter((item) => {

      const text =
        search.toLowerCase();

      return (
        (item.paymentMethod || "")
          .toLowerCase()
          .includes(text) ||

        (item.razorpay_payment_id || "")
          .toLowerCase()
          .includes(text) ||

        item.amount
          ?.toString()
          .includes(text)
      );
    });

  // =========================
  // PAYMENT ICON
  // =========================
  const getPaymentIcon = (
    method
  ) => {

    switch (method) {
      case "razorpay":
        return (
          <FaGooglePay className="text-[22px] text-blue-600" />
        );

      case "cod":
        return (
          <BsCashCoin className="text-[22px] text-yellow-600" />
        );

      default:
        return (
          <FiCreditCard className="text-[22px]" />
        );
    }
  };

  return (

    <div className="min-h-screen bg-[#f5f7fb] p-5 md:p-8">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">

        <div>

          <h1 className="text-3xl font-bold text-green-900">
            Payment History
          </h1>

          <div className="w-16 h-1 bg-green-600 mt-2 rounded-full"></div>

          <p className="text-gray-500 mt-2">
            View all successful medicine payments.
          </p>

        </div>

        {/* SEARCH */}
        <div
          className="
            flex
            items-center
            gap-3
            bg-white
            border
            border-gray-200
            rounded-2xl
            px-4
            h-14
            w-full
            lg:w-[320px]
            shadow-sm
          "
        >

          <FiSearch className="text-gray-400 text-[18px]" />

          <input
            type="text"
            placeholder="Search payment..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="
              flex-1
              outline-none
              bg-transparent
              text-[15px]
            "
          />

        </div>

      </div>

      {/* EMPTY */}
      {filteredPayments.length === 0 ? (

        <div
          className="
            bg-white
            rounded-[30px]
            border
            border-gray-100
            shadow-sm
            min-h-[70vh]
            flex
            flex-col
            items-center
            justify-center
            text-center
            p-10
          "
        >

          <div
            className="
              h-28
              w-28
              rounded-full
              bg-[#eef7f1]
              flex
              items-center
              justify-center
              mb-6
            "
          >

            <FiCreditCard className="text-[50px] text-[#0f5c2e]" />

          </div>

          <h2 className="text-[36px] font-extrabold text-[#111827]">
            No Payment History
          </h2>

          <p className="text-gray-500 mt-3 max-w-[450px] text-[16px]">
            Successful payments will appear here.
          </p>

        </div>

      ) : (

        <div className="space-y-5">

          {filteredPayments.map(
            (payment) => (

              <div
                key={payment._id}
                className="
                  bg-white
                  rounded-[28px]
                  border
                  border-gray-100
                  shadow-sm
                  p-5
                  hover:shadow-md
                  duration-200
                "
              >

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                  {/* LEFT */}
                  <div className="flex items-center gap-4">

                    {/* ICON */}
                    <div
                      className="
                        h-16
                        w-16
                        rounded-2xl
                        bg-[#eef7f1]
                        flex
                        items-center
                        justify-center
                      "
                    >

                      {getPaymentIcon(
                        payment.paymentMethod
                      )}

                    </div>

                    {/* DETAILS */}
                    <div>

                      <div className="flex items-center gap-3 flex-wrap">

                        <h2 className="text-[22px] font-bold text-[#111827]">
                          ₹ {payment.amount}
                        </h2>

                        <span
                          className="
                            px-3
                            py-1
                            rounded-full
                            bg-green-100
                            text-green-700
                            text-[12px]
                            font-semibold
                          "
                        >
                          {payment.status}
                        </span>

                      </div>

                      <p className="text-gray-500 mt-1 text-[15px]">
                        Payment Method:
                        <span className="font-semibold text-[#111827] ml-2">
                          {
                            payment.paymentMethod === "razorpay"
                              ? "Online Payment"
                              : "Cash On Delivery"
                          }
                        </span>
                      </p>

                      <p className="text-gray-500 mt-1 text-[14px] break-all">
                        Payment ID:
                        <span className="font-medium text-[#111827] ml-2">
                          {payment.razorpay_payment_id || "N/A"}
                        </span>
                      </p>

                    </div>

                  </div>

                  {/* RIGHT */}
                  <div className="flex flex-wrap items-center gap-5">

                    {/* DATE */}
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        bg-[#f8fafc]
                        px-4
                        py-3
                        rounded-2xl
                      "
                    >

                      <FiCalendar className="text-[#0f5c2e]" />

                      <span className="font-medium text-[#111827]">
                        {new Date(
                          payment.createdAt
                        ).toLocaleDateString()}
                      </span>

                    </div>

                    {/* TIME */}
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        bg-[#f8fafc]
                        px-4
                        py-3
                        rounded-2xl
                      "
                    >

                      <FiClock className="text-[#0f5c2e]" />

                      <span className="font-medium text-[#111827]">
                        {new Date(
                          payment.createdAt
                        ).toLocaleTimeString()}
                      </span>

                    </div>

                    {/* SUCCESS */}
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        bg-green-50
                        px-4
                        py-3
                        rounded-2xl
                      "
                    >

                      <FiCheckCircle className="text-green-600" />

                      <span className="font-semibold text-green-700">
                        {payment.status}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
}