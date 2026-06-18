import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import API from "../../../services/apiClient";
import { useNavigate } from "react-router-dom";

import {
  FiArrowLeft,
  FiTrash2,
  FiShoppingCart,
  FiPackage,
  FiPlus,
  FiMinus,
  FiCheckCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";

export default function ReviewOrders() {

  const navigate = useNavigate();

  const { user } = useAuth();

  const userId =
    user?._id || user?.id;

  // =========================
  // STATES
  // =========================
  const [cartItems, setCartItems] =
    useState([]);

  const [placingOrder, setPlacingOrder] =
    useState(false);

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {
    if (!userId) return;

    try {
      const savedCart = localStorage.getItem(
        `reviewOrders_${userId}`
      );

      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (err) {
      console.error("Invalid cart data", err);

      localStorage.removeItem(
        `reviewOrders_${userId}`
      );
    }
  }, [userId]);

  // =========================
  // UPDATE STORAGE
  // =========================
  const updateStorage = (updated) => {
    setCartItems(updated);

    if (!userId) return;

    try {
      localStorage.setItem(
        `reviewOrders_${userId}`,
        JSON.stringify(updated)
      );
    } catch (err) {
      console.error("Failed to save cart", err);
    }
  };

  // =========================
  // REMOVE ITEM
  // =========================
  const removeItem = (
    index
  ) => {

    const updated =
      cartItems.filter(
        (_, i) =>
          i !== index
      );

    updateStorage(updated);
  };

  // =========================
  // CLEAR CART
  // =========================
  const clearCart = () => {

    setCartItems([]);

    if (!userId) return;

    localStorage.removeItem(
      `reviewOrders_${userId}`
    );

    localStorage.removeItem(
      `customerBillingRows_${userId}`
    );

    localStorage.removeItem(
      "orderData"
    );
  };

  // =========================
  // INCREASE QTY
  // =========================
  const increaseQty = (
    index
  ) => {

    const updated = [
      ...cartItems,
    ];

    updated[index].qty += 1;

    updated[index].total =
      updated[index].price *
      updated[index].qty;

    updateStorage(updated);
  };

  // =========================
  // DECREASE QTY
  // =========================
  const decreaseQty = (
    index
  ) => {

    const updated = [
      ...cartItems,
    ];

    if (
      updated[index].qty > 1
    ) {

      updated[index].qty -= 1;

      updated[index].total =
        updated[index].price *
        updated[index].qty;

      updateStorage(updated);
    }
  };

  // =========================
  // TOTALS
  // =========================
  const subtotal =
    useMemo(() => {

      return cartItems.reduce(
        (acc, item) =>
          acc +
          Number(
            item.mrp || 0
          ) *
          Number(
            item.qty || 0
          ),
        0
      );

    }, [cartItems]);

  const totalAfterDiscount =
    useMemo(() => {

      return cartItems.reduce(
        (acc, item) =>
          acc +
          Number(
            item.price || 0
          ) *
          Number(
            item.qty || 0
          ),
        0
      );

    }, [cartItems]);

  const discount =
    subtotal -
    totalAfterDiscount;

  const packing = 20;

  const grandTotal =
    totalAfterDiscount +
    packing;

  // =========================
  // PLACE ORDER
  // =========================
  const handlePlaceOrder =
    async () => {

      try {

        setPlacingOrder(true);

        // ✅ ORDER ITEMS
        const items =
          cartItems.map(
            (item) => ({

              medicineId:
                item.medicineId,

              medicineName:
                item.medicine ||
                item.name,

              mrp:
                Number(item.mrp || 0),

              discount:
                Number(item.discount || 0),

              price:
                Number(item.price || 0),

              quantity:
                Number(item.qty || 1),

              total:
                Number(item.price || 0) *
                Number(item.qty || 1),
            })
          );

        const { data } = await API.post(
          "/orders",
          {
            items,
            grandTotal,
            paymentMethod: "online",
          }
        );

        // ✅ SUCCESS
        if (
          data.success
        ) {

          toast.success(
            "Order placed successfully!"
          );

          setTimeout(() => {
            navigate(
              "/dashboard/orders"
            );
          }, 1500);


          // CLEAR STORAGE
          setCartItems([]);

          if (userId) {
            localStorage.removeItem(
              `reviewOrders_${userId}`
            );

            localStorage.removeItem(
              `customerBillingRows_${userId}`
            );
          }

          localStorage.removeItem(
            "orderData"
          );

        } else {
          toast.error(
            data.message ||
            "Failed to place order"
          );
        }

      } catch (err) {

        console.log(
          "Place order error:",
          err
        );

      } finally {

        setPlacingOrder(
          false
        );
      }
    };

  return (

    <div className="min-h-screen bg-[#f5f7f9] p-5 md:p-8">

      {/* TOP BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

        {/* LEFT */}
        <div className="flex items-center gap-3">

          <button
            onClick={() =>
              navigate(-1)
            }
            className="h-11 w-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:scale-[1.03] duration-200"
          >
            <FiArrowLeft className="text-[20px]" />
          </button>

          <div>

            <h1 className="text-3xl font-bold text-green-900">
              Order Review
            </h1>

            <div className="w-16 h-1 bg-green-600 mt-1 rounded"></div>

            <p className="text-gray-500 mt-1">
              Review medicines before placing the order
            </p>

          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {cartItems.length >
            0 && (

              <button
                onClick={
                  clearCart
                }
                className="h-11 px-5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center gap-2 duration-200"
              >
                <FiTrash2 />
                Clear Cart
              </button>
            )}

          {cartItems.length >
            0 && (

              <button
                onClick={
                  handlePlaceOrder
                }
                disabled={
                  placingOrder
                }
                className="h-11 px-6 rounded-xl bg-[#0f5c2e] hover:bg-[#0c4d27] disabled:opacity-60 text-white font-semibold flex items-center gap-2 duration-200 shadow-lg shadow-green-100"
              >
                <FiCheckCircle />

                {placingOrder
                  ? "Placing..."
                  : "Place Order"}
              </button>
            )}
        </div>
      </div>

      {/* EMPTY STATE */}
      {cartItems.length ===
        0 ? (

        <div className="bg-white rounded-[30px] border border-[#e5e7eb] shadow-sm min-h-[70vh] flex flex-col items-center justify-center text-center p-10">

          <div className="h-28 w-28 rounded-full bg-[#eef7f1] flex items-center justify-center mb-6">

            <FiShoppingCart className="text-[48px] text-[#0f5c2e]" />

          </div>

          <h2 className="text-[36px] font-extrabold text-[#111827]">
            Cart is Empty
          </h2>

          <p className="text-gray-500 mt-3 max-w-[450px] text-[16px]">
            No medicines added yet.
            Go back and add medicines
            to continue billing.
          </p>

          <button
            onClick={() =>
              navigate("/dashboard/medicines")
            }
            className="mt-7 h-12 px-7 rounded-2xl bg-[#0f5c2e] hover:bg-[#0c4d27] text-white font-semibold duration-200"
          >
            Back To Billing
          </button>
        </div>

      ) : (

        <div className="space-y-6">

          {/* TABLE */}
          <div className="overflow-x-auto rounded-[30px] border border-[#e7ece9] bg-white shadow-sm">

            <table className="w-full min-w-[1100px]">

              {/* HEADER */}
              <thead className="bg-[#0f5c2e] text-white">

                <tr>

                  <th className="px-5 py-5 text-left text-[15px] font-bold">
                    SL
                  </th>

                  <th className="px-5 py-5 text-left text-[15px] font-bold">
                    PRODUCT
                  </th>

                  <th className="px-5 py-5 text-left text-[15px] font-bold">
                    CATEGORY
                  </th>

                  <th className="px-5 py-5 text-left text-[15px] font-bold">
                    MRP
                  </th>

                  <th className="px-5 py-5 text-left text-[15px] font-bold">
                    DISC%
                  </th>

                  <th className="px-5 py-5 text-left text-[15px] font-bold">
                    PRICE
                  </th>

                  <th className="px-5 py-5 text-center text-[15px] font-bold">
                    QTY
                  </th>

                  <th className="px-5 py-5 text-left text-[15px] font-bold">
                    TOTAL
                  </th>

                  <th className="px-5 py-5 text-center text-[15px] font-bold">
                    ACTION
                  </th>

                </tr>
              </thead>

              {/* BODY */}
              <tbody>

                {cartItems.map(
                  (
                    item,
                    index
                  ) => (

                    <tr
                      key={index}
                      className="border-b border-[#edf1ef] hover:bg-[#fafcfa] duration-150"
                    >

                      <td className="px-5 py-5">

                        <div className="h-11 w-11 rounded-xl bg-[#eef7f1] text-[#0f5c2e] font-bold text-[18px] flex items-center justify-center">
                          {index + 1}
                        </div>

                      </td>

                      <td className="px-5 py-5">

                        <div className="flex items-center gap-3">

                          <div className="h-12 w-12 rounded-xl bg-[#eef7f1] flex items-center justify-center">

                            <FiPackage className="text-[#0f5c2e] text-[20px]" />

                          </div>

                          <div>

                            <p className="font-bold text-[#111827] text-[16px]">
                              {item.medicine ||
                                "N/A"}
                            </p>

                          </div>
                        </div>

                      </td>

                      <td className="px-5 py-5 text-[#374151] font-medium">
                        {item.category ||
                          "-"}
                      </td>

                      <td className="px-5 py-5 font-semibold text-[#111827]">
                        ₹{" "}
                        {item.mrp ||
                          0}
                      </td>

                      <td className="px-5 py-5 text-[#059669] font-bold">
                        {item.discount ||
                          0}
                        %
                      </td>

                      <td className="px-5 py-5 font-semibold text-[#111827]">
                        ₹ {Number(item.price || 0).toFixed(2)}
                      </td>

                      <td className="px-5 py-5">

                        <div className="flex items-center justify-center">

                          <div className="inline-flex items-center border border-[#dbe4de] rounded-2xl overflow-hidden">

                            <button
                              onClick={() =>
                                decreaseQty(
                                  index
                                )
                              }
                              className="h-11 w-11 bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center duration-200"
                            >
                              <FiMinus />
                            </button>

                            <div className="w-14 text-center font-bold text-[18px] text-[#111827]">
                              {item.qty ||
                                1}
                            </div>

                            <button
                              onClick={() =>
                                increaseQty(
                                  index
                                )
                              }
                              className="h-11 w-11 bg-green-50 hover:bg-green-100 text-[#0f5c2e] flex items-center justify-center duration-200"
                            >
                              <FiPlus />
                            </button>

                          </div>
                        </div>

                      </td>

                      <td className="px-5 py-5">

                        <div className="bg-[#eef7f1] px-5 py-3 rounded-2xl inline-block">

                          <span className="text-[20px] font-bold text-[#0f5c2e]">
                            ₹{" "}
                            {(
                              item.price *
                              item.qty
                            ).toFixed(
                              2
                            )}
                          </span>

                        </div>

                      </td>

                      <td className="px-5 py-5 text-center">

                        <button
                          onClick={() =>
                            removeItem(
                              index
                            )
                          }
                          className="h-12 w-12 rounded-2xl bg-red-50 hover:bg-red-100 text-red-500 inline-flex items-center justify-center duration-200"
                        >
                          <FiTrash2 className="text-[18px]" />
                        </button>

                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* SUMMARY */}
          <div className="flex justify-end">

            <div className="w-full max-w-[340px] rounded-[24px] bg-white border border-[#e7ece9] shadow-sm overflow-hidden">

              {/* HEADER */}
              <div className="bg-[#0f5c2e] px-5 py-5">

                <h2 className="text-[24px] font-bold text-white leading-none">
                  Billing Summary
                </h2>

                <p className="text-green-100 text-[13px] mt-1">
                  Pharmacy Billing Details
                </p>

              </div>

              {/* BODY */}
              <div className="p-5 space-y-4">

                <div className="flex items-center justify-between">

                  <span className="text-gray-600 font-medium text-[15px]">
                    Sub Total
                  </span>

                  <span className="font-semibold text-[#111827] text-[17px]">
                    ₹{" "}
                    {subtotal.toFixed(
                      2
                    )}
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-gray-600 font-medium text-[15px]">
                    Discount
                  </span>

                  <span className="font-semibold text-red-500 text-[17px]">
                    - ₹{" "}
                    {discount.toFixed(
                      2
                    )}
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-gray-600 font-medium text-[15px]">
                    Packing
                  </span>

                  <span className="font-semibold text-[#111827] text-[17px]">
                    ₹ {packing}
                  </span>

                </div>

                <div className="bg-gradient-to-r from-[#eef7f1] to-[#f4fbf6] border border-[#dcefe3] rounded-[22px] p-5 shadow-sm">

                  <div className="flex items-center justify-between gap-4">

                    <div>

                      <p className="text-[19px] text-[#111827] font-bold leading-none">
                        Grand Total
                      </p>

                      <span className="text-[12px] text-gray-600 mt-1 block">
                        Including discounts & charges
                      </span>

                    </div>

                    <div className="flex items-center gap-1 shrink-0">

                      <span className="text-[22px] font-bold text-[#0f5c2e] leading-none">
                        ₹
                      </span>

                      <span className="text-[34px] leading-none font-bold text-[#0f5c2e] whitespace-nowrap">
                        {grandTotal.toFixed(
                          0
                        )}
                      </span>

                    </div>
                  </div>
                </div>

                {/* PLACE ORDER BTN */}
                <button
                  onClick={
                    handlePlaceOrder
                  }
                  disabled={
                    placingOrder
                  }
                  className="w-full h-12 rounded-xl bg-[#0f5c2e] hover:bg-[#0c4d27] disabled:opacity-60 text-white text-[15px] font-semibold duration-200 shadow-md shadow-green-100 flex items-center justify-center gap-2"
                >
                  <FiCheckCircle className="text-[16px]" />

                  {placingOrder
                    ? "Placing..."
                    : "Place Order"}
                </button>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}