import {
  Phone,
  Mail,
  Printer,
  Trash2,
  ArrowLeft,
  CreditCard,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import API from "../../../services/apiClient";

const Invoice = ({
  order,
  isEditable = false,
  onIncreaseQty,
  onDecreaseQty,
  onRemoveItem,
}) => {

  const navigate = useNavigate();
  const { orderId } = useParams();
  const [orderData, setOrderData] =
    useState(null);
  const invoiceRef = useRef();

  useEffect(() => {
    const fetchOrder = async () => {
      try {

        const response =
          await API.get(
            `/orders/${orderId}`
          );
        setOrderData(
          response.data.order ||
          response.data.data ||
          response.data
        );

      } catch (error) {

        console.error(
          "Error fetching order:",
          error
        );
      }
    };

    if (orderId) {
      fetchOrder();
    }

  }, [orderId]);

  const currentOrder =
    order || orderData;

  // =========================
  // PRINT
  // =========================
  const handlePrint = () => window.print();

  // =========================
  // ADDRESS FORMAT
  // =========================
  const formatAddress = (addr) => {
    if (!addr) return "-";

    if (typeof addr === "string") return addr;

    return [
      addr.shopName,
      addr.street,
      addr.city,
    ]
      .filter(Boolean)
      .join(", ");
  };

  // =========================
  // TOTALS
  // =========================
  const subtotal = useMemo(() => {
    return (
      currentOrder?.items?.reduce(
        (acc, item) =>
          acc + item.mrp * item.quantity,
        0
      ) || 0
    );
  }, [currentOrder]);

  const totalAfterDiscount = useMemo(() => {
    return (
      currentOrder?.items?.reduce(
        (acc, item) =>
          acc + item.price * item.quantity,
        0
      ) || 0
    );
  }, [currentOrder]);

  const discount =
    subtotal - totalAfterDiscount;

  const packing = 20;

  const grandTotal =
    totalAfterDiscount + packing;

  if (!currentOrder) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading Invoice...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-[#f4f7f6] min-h-screen">

      {/* TOP ACTIONS */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">

        {/* LEFT */}
        <div className="flex items-center gap-3">

          {/* BACK */}
          {isEditable && (
            <button
              onClick={() => navigate(-1)}
              className="h-11 px-5 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center gap-2 hover:scale-[1.02] duration-200"
            >
              <ArrowLeft size={18} />
              Back To Billing
            </button>
          )}

          {/* PRINT */}
          {!isEditable && (
            <button
              onClick={handlePrint}
              className="h-11 px-5 rounded-xl bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 duration-200"
            >
              <Printer size={18} />
              Print
            </button>
          )}
        </div>

        {/* RIGHT */}
        {isEditable && (
          <button
            onClick={() =>
              navigate("/dashboard/payments")
            }
            className="h-11 px-6 rounded-xl bg-[#0f5c2e] hover:bg-[#0d4f28] text-white font-semibold flex items-center gap-2 duration-200 shadow-lg shadow-green-100"
          >
            <CreditCard size={18} />
            Proceed Payment
          </button>
        )}
      </div>

      {/* MAIN INVOICE */}
      <div ref={invoiceRef}
        id="invoice"
        className="bg-white border border-[#e5e7eb] rounded-[28px] shadow-sm overflow-hidden"
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >

        {/* HEADER */}
        <div className="p-2 border-b border-[#e5e7eb]">

          <div className="grid grid-cols-2 gap-4 items-start">

            {/* LEFT */}
            <div className="flex items-start gap-4">

              <div className="bg-gradient-to-br from-[#22c55e] to-[#14b8a6] p-3 rounded-2xl shadow-md">
                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="9"
                    y="3"
                    width="6"
                    height="18"
                    rx="3"
                    fill="white"
                  />

                  <rect
                    x="3"
                    y="9"
                    width="18"
                    height="6"
                    rx="3"
                    fill="white"
                  />
                </svg>
              </div>

              <div>
                <h1 className="text-[32px] leading-none font-extrabold text-teal-700">
                  New Drug
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Health is Our Priority
                </p>



                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    Patna, Bihar
                  </p>

                  <p className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} />
                    9091909190
                  </p>

                  <p className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={14} />
                    newdrug89@gmail.com
                  </p>
                </div>
              </div>
            </div>



            {/* RIGHT */}
            <div className="bg-[#f8faf9] border border-[#e5e7eb] rounded-2xl p-4 text-sm">

              <div className="grid grid-cols-[100px_10px_1fr] gap-y-2">

                <span className="text-gray-500">
                  Invoice No
                </span>

                <span>:</span>

                <span className="font-semibold">
                  INV-{currentOrder?._id?.slice(-6)}
                </span>

                <span className="text-gray-500">
                  Order ID
                </span>

                <span>:</span>

                <span>{currentOrder?._id}</span>

                <span className="text-gray-500">
                  Date
                </span>

                <span>:</span>

                <span>
                  {currentOrder?.createdAt &&
                    !isNaN(new Date(currentOrder.createdAt).getTime())
                    ? new Date(
                      currentOrder.createdAt
                    ).toLocaleString("en-IN")
                    : "-"}
                </span>

                <span className="text-gray-500">
                  Payment
                </span>

                <span>:</span>

                <span>
                  {currentOrder?.paymentMethod ===
                    "cod"
                    ? "Cash"
                    : "Online"}
                </span>

                <span className="text-gray-500">
                  Status
                </span>

                <span>:</span>

                <span className="font-bold text-green-600">
                  {isEditable
                    ? "Pending"
                    : currentOrder?.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CUSTOMER DETAILS */}
        <div className="p-2 pt-1 pb-0">

          <div className="grid grid-cols-2 gap-2">

            {/* CUSTOMER */}
            <div className="border border-[#e5e7eb] rounded-xl p-4 bg-[#f9fbfa]">

              <h3 className="text-[30px] font-bold text-teal-700 border-b border-[#e5e7eb] pb-2 mb-4">
                Customer Details
              </h3>

              <div className="grid grid-cols-[90px_1fr] gap-y-2 text-sm">

                <span className="text-gray-500">
                  Name:
                </span>

                <span className="font-semibold">
                  {currentOrder?.user?.name || "-"}
                </span>

                <span className="text-gray-500">
                  Email:
                </span>

                <span>
                  {currentOrder?.user?.email || "-"}
                </span>

                <span className="text-gray-500">
                  Phone:
                </span>

                <span>
                  {currentOrder?.user?.phone || "-"}
                </span>

                <span className="text-gray-500">
                  Address:
                </span>

                <span>
                  {formatAddress(
                    currentOrder?.user?.address
                  )}
                </span>
              </div>
            </div>

            {/* BILLING */}
            <div className="border border-[#e5e7eb] rounded-xl p-4 bg-[#f9fbfa]">

              <h3 className="text-[30px] font-bold text-teal-700 border-b border-[#e5e7eb] pb-2 mb-4">
                Billing Details
              </h3>

              <div className="grid grid-cols-[90px_1fr] gap-y-2 text-sm">

                <span className="text-gray-500">
                  Pharmacy:
                </span>

                <span className="font-semibold">
                  New Drug
                </span>

                <span className="text-gray-500">
                  GSTIN:
                </span>

                <span>22AAAA0000A1Z5</span>

                <span className="text-gray-500">
                  Payment:
                </span>

                <span>
                  {currentOrder?.paymentMethod ===
                    "cod"
                    ? "Cash"
                    : "Online"}
                </span>

                <span className="text-gray-500">
                  Status:
                </span>

                <span className="font-semibold text-green-600">
                  {isEditable
                    ? "Pending"
                    : currentOrder?.status}
                </span>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto mt-4 rounded-3xl border border-[#e5e7eb]">

            <table className="w-full min-w-[900px]">

              <thead className="bg-[#0f5c2e] text-white">

                <tr>
                  <th className="p-4 text-left">
                    SL
                  </th>

                  <th className="p-4 text-left">
                    Medicine
                  </th>

                  <th className="p-4 text-left">
                    MRP
                  </th>

                  <th className="p-4 text-left">
                    Disc%
                  </th>

                  <th className="p-4 text-left">
                    Price
                  </th>

                  <th className="p-4 text-center">
                    Qty
                  </th>

                  <th className="p-4 text-left">
                    Total
                  </th>

                  {isEditable && (
                    <th className="p-4 text-center">
                      Action
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>

                {currentOrder?.items?.map(
                  (item, i) => (

                    <tr
                      key={i}
                      className="border-b border-[#edf1ef] hover:bg-[#fafcfa]"
                    >

                      <td className="p-4 font-semibold">
                        {i + 1}
                      </td>

                      <td className="p-4 font-semibold text-[#111827]">
                        {item.medicineName}
                      </td>

                      <td className="p-4">
                        ₹ {item.mrp}
                      </td>

                      <td className="p-4">
                        {item.discount || 0}%
                      </td>

                      <td className="p-4">
                        ₹ {Number(item.price).toFixed(2)}
                      </td>

                      {/* QTY */}
                      <td className="p-4 text-center">

                        {isEditable ? (

                          <div className="inline-flex items-center border border-[#dbe4de] rounded-xl overflow-hidden">

                            <button
                              onClick={() =>
                                onDecreaseQty(i)
                              }
                              className="h-10 w-10 bg-red-50 hover:bg-red-100 text-red-500 font-bold text-[20px]"
                            >
                              -
                            </button>

                            <div className="w-12 text-center font-bold">
                              {item.quantity}
                            </div>

                            <button
                              onClick={() =>
                                onIncreaseQty(i)
                              }
                              className="h-10 w-10 bg-green-50 hover:bg-green-100 text-green-600 font-bold text-[20px]"
                            >
                              +
                            </button>
                          </div>

                        ) : (
                          <span className="font-bold">
                            {item.quantity}
                          </span>
                        )}
                      </td>

                      {/* TOTAL */}
                      <td className="p-4 font-bold text-[#0f5c2e]">
                        ₹{" "}
                        {(
                          item.price *
                          item.quantity
                        ).toFixed(2)}
                      </td>

                      {/* ACTION */}
                      {isEditable && (
                        <td className="p-4 text-center">

                          <button
                            onClick={() =>
                              onRemoveItem(i)
                            }
                            className="h-10 w-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 inline-flex items-center justify-center duration-200"
                          >
                            <Trash2 size={18} />
                          </button>

                        </td>
                      )}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* TOTAL CARD */}
          <div className="flex flex-col items-end">

            <div className="billing-summary w-full max-w-[380px] rounded-2xl border border-[#e5e7eb] overflow-hidden">

              <div className="bg-[#f4f7f6] px-5 py-4 border-b border-[#e5e7eb]">
                <h3 className="text-[30px] font-bold text-[#0f5c2e]">
                  Billing Summary
                </h3>
              </div>

              <div className="p-5 space-y-4">

                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-600">
                    Sub Total
                  </span>

                  <span className="font-bold">
                    ₹ {subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-600">
                    Discount
                  </span>

                  <span className="font-bold text-red-500">
                    - ₹ {discount.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-600">
                    Packing
                  </span>

                  <span className="font-bold">
                    ₹ {packing}
                  </span>
                </div>

                <div className="bg-[#eef7f1] rounded-2xl p-5 flex items-center justify-between">

                  <div>
                    <p className="text-[26px] font-bold text-[#0f5c2e]">
                      Grand Total
                    </p>

                    <span className="text-sm text-gray-800">
                      Including discounts &
                      charges
                    </span>
                  </div>

                  <span className="text-[30px] leading-none font-bold text-[#067a35]">
                    ₹ {grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="mt-8 mb-0 text-center pt-4">
            <p className="text-teal-700 font-semibold">
              Thank you for shopping with us!
            </p>

            <p className="text-sm text-gray-500 mt-1">
              This is a computer generated invoice.
            </p>
          </div>

        </div>
      </div>

      {/* PRINT CSS */}
      <style>
        {`
    @media print {

      @page {
        size: A4 landscape;
        margin: 8mm;
      }

      html,
      body {
        width: 100%;
        height: auto;
        overflow: visible !important;
        background: white !important;
      }

      body * {
        visibility: hidden;
      }

      #invoice,
      #invoice * {
        visibility: visible;
      }

      #invoice {
        position: absolute;
        left: 0;
        top: 0;
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        background: white !important;
      }

      table {
        width: 100% !important;
        min-width: 100% !important;
        border-collapse: collapse;
      }

      table,
      tr,
      td,
      th {
        page-break-inside: avoid !important;
      }

      .billing-summary {
        page-break-inside: avoid !important;
      }

      .print\\:hidden {
        display: none !important;
      }

      button,
      nav,
      aside,
      header,
      footer {
        display: none !important;
      }

      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `}
      </style>
    </div>
  );
};

export default Invoice;