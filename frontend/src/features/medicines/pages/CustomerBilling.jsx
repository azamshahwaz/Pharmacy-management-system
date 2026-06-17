import { useRef, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AsyncSelect from "react-select/async";
import API from "../../../services/apiClient";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import {
  FiSearch, FiTrash2, FiPlus, FiMinus, FiCreditCard,
} from "react-icons/fi";

const CustomerBilling = () => {
  const navigate = useNavigate();

  const { user } = useAuth(); // ✅ user context se
  const userId = user?._id || user?.id;

  const emptyRow = {
    medicineId: "", medicine: "", category: "", mrp: "",
    discount: "", price: "", qty: 1, total: 0, categoryOptions: [],
  };

  const [rows, setRows] = useState(() => {
    if (!userId) return [{ ...emptyRow }];

    try {
      const saved = localStorage.getItem(
        `customerBillingRows_${userId}`
      );

      return saved
        ? JSON.parse(saved)
        : [{ ...emptyRow }];
    } catch (err) {
      console.error(
        "Invalid billing data",
        err
      );

      localStorage.removeItem(
        `customerBillingRows_${userId}`
      );

      return [{ ...emptyRow }];
    }
  });

  useEffect(() => {
    if (!userId) return;

    try {
      localStorage.setItem(
        `customerBillingRows_${userId}`,
        JSON.stringify(rows)
      );
    } catch (err) {
      console.error(
        "Failed to save billing data",
        err
      );
    }
  }, [rows, userId]);

  const selectRefs = useRef([]);

  // ✅ Token nahi — API instance withCredentials use karega
  const searchMedicines = async (inputValue) => {
    if (!inputValue) return [];
    try {
      const { data } = await API.get(`/medicines?search=${inputValue}`);
      const selectedIds = rows.filter((r) => r.medicineId).map((r) => r.medicineId);
      return data.data
        .filter((med) => !selectedIds.includes(med._id))
        .map((med) => ({ value: med._id, label: med.productName, medicine: med }));
    } catch (error) {
      console.error(error);
      toast.error(
        "Failed to load medicines"
      );
      return [];
    }
  };

  const handleMedicineChange = async (selected, rowIndex) => {
    if (!selected) return;
    const updatedRows = [...rows];
    const selectedMedicine = selected.medicine;

    updatedRows[rowIndex].medicineId = selectedMedicine._id;
    updatedRows[rowIndex].medicine = selectedMedicine.productName;

    const { data } = await API.get(`/medicines?search=${selectedMedicine.productName}`);
    const sameMedicines = data.data.filter(
      (m) => m.productName === selectedMedicine.productName
    );

    if (sameMedicines.length > 1) {
      updatedRows[rowIndex].categoryOptions = sameMedicines;
      updatedRows[rowIndex].category = "";
      updatedRows[rowIndex].mrp = "";
      updatedRows[rowIndex].discount = "";
      updatedRows[rowIndex].price = "";
      updatedRows[rowIndex].total = 0;
    } else {
      const med = sameMedicines[0];
      updatedRows[rowIndex].medicineId = med._id;
      updatedRows[rowIndex].category = med.productCategory;
      updatedRows[rowIndex].mrp = med.mrp;
      updatedRows[rowIndex].discount = med.discount;
      updatedRows[rowIndex].price = med.price;
      updatedRows[rowIndex].total = med.price * updatedRows[rowIndex].qty;
    }

    setRows(updatedRows);

    const isLastRow = rowIndex === rows.length - 1;
    if (isLastRow && selectedMedicine.productName) {
      setRows([...updatedRows, { ...emptyRow }]);
      setTimeout(() => selectRefs.current[rowIndex + 1]?.focus(), 200);
    }
  };

  const handleCategoryChange = (e, rowIndex) => {
    const updatedRows = [...rows];
    const medicine = updatedRows[rowIndex].categoryOptions.find(
      (m) => m.productCategory === e.target.value
    );
    updatedRows[rowIndex].medicineId = medicine._id;
    updatedRows[rowIndex].category = medicine.productCategory;
    updatedRows[rowIndex].mrp = medicine.mrp;
    updatedRows[rowIndex].discount = medicine.discount;
    updatedRows[rowIndex].price = medicine.price;
    updatedRows[rowIndex].total = medicine.price * updatedRows[rowIndex].qty;
    setRows(updatedRows);
  };

  const handleDeleteRow = (rowIndex) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== rowIndex));
  };

  const updateRows = (updated) => {
    setRows(updated);
  };

  const increaseQty = (index) => {
    const updated = [...rows];
    updated[index].qty += 1;
    updated[index].total = updated[index].price * updated[index].qty;
    updateRows(updated);
  };

  const decreaseQty = (index) => {
    const updated = [...rows];
    if (updated[index].qty > 1) {
      updated[index].qty -= 1;
      updated[index].total = updated[index].price * updated[index].qty;
      updateRows(updated);
    }
  };

  const handleProceedBilling = () => {
    const validRows = rows.filter((item) => item.medicine);
    if (validRows.length === 0) {
      toast.error(
        "Please add at least one medicine"
      );
      return;
    }
    try {
      if (userId) {
        localStorage.setItem(
          `reviewOrders_${userId}`,
          JSON.stringify(validRows)
        );
      }
    } catch (err) {
      console.error(
        "Failed to save review orders",
        err
      );
      toast.error(
        "Failed to save order data"
      );
      return;
    }
    navigate("/dashboard/review-orders");
  };

  const subtotal = useMemo(
    () => rows.reduce((acc, item) => acc + Number(item.mrp || 0) * Number(item.qty || 0), 0),
    [rows]
  );

  const totalAfterDiscount = useMemo(
    () => rows.reduce((acc, item) => acc + Number(item.price || 0) * Number(item.qty || 0), 0),
    [rows]
  );

  const totalDiscount = subtotal - totalAfterDiscount;
  const packing = totalAfterDiscount > 0 ? 20 : 0;
  const grandTotal = totalAfterDiscount + packing;

  // ============ JSX (same as before, no changes needed) ============
  return (
    <div className="min-h-screen bg-[#f5f7f9] p-5 md:p-8">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-900">Customer Billing</h1>
        <div className="w-16 h-1 bg-green-600 mt-1 rounded"></div>
        <p className="text-gray-500 mt-1">New Drug Pharmacy</p>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-[30px] border border-[#e7ece9] bg-white shadow-sm">
        <table className="w-full min-w-[1250px]">
          <thead className="bg-[#0f5c2e] text-white">
            <tr className="align-middle">
              {["SL", "PRODUCT", "CATEGORY", "MRP", "DISC%", "PRICE", "QTY", "TOTAL", "ACTION"].map((h) => (
                <th key={h} className="px-5 py-5 text-left align-middle text-[15px] font-bold whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b border-[#edf1ef] hover:bg-[#fafcfa] duration-150 align-middle">
                {/* SL */}
                <td className="px-5 py-5 align-middle">
                  <div className="h-11 w-11 rounded-xl bg-[#eef7f1] text-[#0f5c2e] font-bold text-[18px] flex items-center justify-center">
                    {index + 1}
                  </div>
                </td>

                {/* PRODUCT */}
                <td className="px-5 py-5 min-w-[300px] align-middle">
                  <div className="relative z-[9999]">
                    {!row.medicine && (
                      <div className="absolute left-4 top-[21px] z-10 text-gray-400">
                        <FiSearch size={18} />
                      </div>
                    )}
                    <AsyncSelect
                      ref={(el) => (selectRefs.current[index] = el)}
                      cacheOptions
                      defaultOptions={true}
                      openMenuOnFocus
                      tabSelectsValue={true}
                      blurInputOnSelect={false}
                      loadOptions={searchMedicines}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      value={row.medicine ? { label: row.medicine, value: row.medicine } : null}
                      onChange={(selected) => handleMedicineChange(selected, index)}
                      placeholder="Search medicine..."
                      styles={{
                        control: (p, s) => ({
                          ...p, minHeight: "58px", height: "58px", borderRadius: "18px",
                          border: s.isFocused ? "2px solid #0f5c2e" : "1px solid #dde5df",
                          boxShadow: s.isFocused ? "0 0 0 4px rgba(15,92,46,0.08)" : "0 2px 10px rgba(0,0,0,0.03)",
                          backgroundColor: "#fff", paddingLeft: row.medicine ? "8px" : "34px",
                          alignItems: "center", "&:hover": { borderColor: "#0f5c2e" },
                        }),
                        valueContainer: (p) => ({ ...p, height: "58px", padding: "0 10px", display: "flex", alignItems: "center" }),
                        input: (p) => ({ ...p, margin: 0, padding: 0, color: "#111827", fontSize: "15px", fontWeight: 600 }),
                        singleValue: (p) => ({ ...p, margin: 0, color: "#111827", fontWeight: 600, fontSize: "15px" }),
                        placeholder: (p) => ({ ...p, margin: 0, color: "#9ca3af", fontSize: "15px", fontWeight: 500 }),
                        indicatorSeparator: () => ({ display: "none" }),
                        dropdownIndicator: (p, s) => ({ ...p, color: s.isFocused ? "#0f5c2e" : "#6b7280" }),
                        menuPortal: (b) => ({ ...b, zIndex: 99999 }),
                        menu: (p) => ({ ...p, borderRadius: "22px", overflow: "hidden", border: "1px solid #e5e7eb", boxShadow: "0 20px 40px rgba(0,0,0,0.12)", marginTop: "10px" }),
                        menuList: (p) => ({ ...p, padding: "8px" }),
                        option: (p, s) => ({
                          ...p, borderRadius: "16px", marginBottom: "4px", padding: "10px 12px",
                          backgroundColor: s.isFocused || s.isSelected ? "#d7f0e1" : "#fff",
                          border: s.isFocused ? "1px solid #16a34a" : "1px solid transparent",
                          color: "#111827", fontWeight: 600, cursor: "pointer",
                        }),
                      }}
                    />
                  </div>
                </td>

                {/* CATEGORY */}
                <td className="px-5 py-5 align-middle">
                  {row.categoryOptions.length > 1 ? (
                    <select
                      className="w-full h-[58px] rounded-2xl border border-[#dde5df] bg-white px-4 text-[15px] shadow-sm focus:outline-none focus:border-[#0f5c2e]"
                      value={row.category}
                      onChange={(e) => handleCategoryChange(e, index)}
                    >
                      <option value="">Select</option>
                      {row.categoryOptions.map((cat) => (
                        <option key={cat._id} value={cat.productCategory}>{cat.productCategory}</option>
                      ))}
                    </select>
                  ) : (
                    <input className="w-full h-[58px] rounded-2xl border border-[#e4e7eb] bg-[#f9fbfa] px-4 text-center text-[15px] text-gray-700 shadow-sm" value={row.category} readOnly />
                  )}
                </td>

                {/* MRP */}
                <td className="px-5 py-5 align-middle">
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <span className="font-bold text-[16px] text-[#111827]">₹</span>
                    <span className="font-bold text-[16px] text-[#111827]">{Number(row.mrp || 0).toFixed(2)}</span>
                  </div>
                </td>

                {/* DISCOUNT */}
                <td className="px-5 py-5 align-middle">
                  <span className="text-[#059669] font-bold text-[16px] whitespace-nowrap">{Number(row.discount || 0).toFixed(2)}%</span>
                </td>

                {/* PRICE */}
                <td className="px-5 py-5 align-middle">
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <span className="font-bold text-[16px] text-[#111827]">₹</span>
                    <span className="font-bold text-[16px] text-[#111827]">{Number(row.price || 0).toFixed(2)}</span>
                  </div>
                </td>

                {/* QTY */}
                <td className="px-5 py-5 align-middle">
                  <div className="flex items-center justify-center">
                    <div className="inline-flex items-center border border-[#dbe4de] rounded-2xl overflow-hidden">
                      <button onClick={() => decreaseQty(index)} className="h-11 w-11 bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center duration-200">
                        <FiMinus />
                      </button>
                      <div className="w-14 text-center font-bold text-[18px] text-[#111827]">{row.qty || 1}</div>
                      <button onClick={() => increaseQty(index)} className="h-11 w-11 bg-green-50 hover:bg-green-100 text-[#0f5c2e] flex items-center justify-center duration-200">
                        <FiPlus />
                      </button>
                    </div>
                  </div>
                </td>

                {/* TOTAL */}
                <td className="px-5 py-5 align-middle">
                  <div className="bg-[#eef7f1] px-5 py-4 rounded-2xl inline-flex items-center gap-1 whitespace-nowrap">
                    <span className="text-[20px] font-bold text-[#0f5c2e]">₹</span>
                    <span className="text-[20px] font-bold text-[#0f5c2e]">{Number(row.price * row.qty).toFixed(2)}</span>
                  </div>
                </td>

                {/* DELETE */}
                <td className="px-5 py-5 text-center align-middle">
                  <button onClick={() => handleDeleteRow(index)} className="h-12 w-12 rounded-2xl bg-red-50 hover:bg-red-100 text-red-500 inline-flex items-center justify-center duration-200">
                    <FiTrash2 className="text-[18px]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="h-8" />

      {/* SUMMARY */}
      <div className="flex justify-end">
        <div className="w-full max-w-[340px] rounded-[24px] bg-white border border-[#e7ece9] shadow-sm overflow-hidden">
          <div className="bg-[#0f5c2e] px-5 py-5">
            <h2 className="text-[24px] font-bold text-white leading-none">Billing Summary</h2>
            <p className="text-green-100 text-[13px] mt-1">Pharmacy Billing Details</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium text-[15px]">Sub Total</span>
              <span className="font-semibold text-[#111827] text-[17px]">₹ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium text-[15px]">Discount</span>
              <span className="font-semibold text-red-500 text-[17px]">- ₹ {totalDiscount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium text-[15px]">Packing</span>
              <span className="font-semibold text-[#111827] text-[17px]">₹ {packing}</span>
            </div>
            <div className="bg-gradient-to-r from-[#eef7f1] to-[#f4fbf6] border border-[#dcefe3] rounded-[22px] p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[19px] text-[#111827] font-bold leading-none">Grand Total</p>
                  <span className="text-[12px] text-gray-600 mt-1 block">Including discounts & charges</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[22px] font-bold text-[#0f5c2e]">₹</span>
                  <span className="text-[34px] leading-none font-bold text-[#0f5c2e] whitespace-nowrap">{grandTotal.toFixed(0)}</span>
                </div>
              </div>
            </div>
            <button onClick={handleProceedBilling} className="w-full h-12 rounded-xl bg-[#0f5c2e] hover:bg-[#0c4d27] text-white text-[15px] font-semibold duration-200 shadow-md shadow-green-100 flex items-center justify-center gap-2">
              <FiCreditCard className="text-[16px]" />
              Review Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerBilling;