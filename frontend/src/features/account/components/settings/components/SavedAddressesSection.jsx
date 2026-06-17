import { useState, useEffect } from "react";
import API from "../../../../../services/apiClient";
import { MapPin, Plus, Pencil, Trash2, Home, Briefcase, MapPinned } from "lucide-react";
import { toast } from "react-toastify";

// ─── Label → Icon map ─────────────────────────────────────────────────────────
const LabelIcon = ({ label, size = 24, className = "" }) => {
  if (label === "Work") return <Briefcase size={size} className={className} />;
  if (label === "Other") return <MapPinned size={size} className={className} />;
  return <Home size={size} className={className} />;
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ onAdd }) => (
  <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-12 text-center">
    <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
      <MapPin size={28} className="text-[#0f5c2e]" />
    </div>
    <p className="text-gray-600 font-medium mb-1">No saved addresses yet</p>
    <p className="text-gray-400 text-sm mb-6">Add an address for faster checkout</p>
    <button
      onClick={onAdd}
      className="inline-flex items-center gap-2 bg-[#0f5c2e] hover:bg-[#0c4a26] text-white px-5 py-3 rounded-xl font-medium transition"
    >
      <Plus size={18} />
      Add Address
    </button>
  </div>
);

// ─── Delete confirmation modal ─────────────────────────────────────────────────
const DeleteModal = ({ onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
        <Trash2 size={24} className="text-red-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Address?</h3>
      <p className="text-gray-500 mb-8 text-sm">
        This address will be permanently removed from your account.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-medium transition disabled:opacity-60"
        >
          {loading ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

// ─── Empty form state ──────────────────────────────────────────────────────────
const emptyForm = {
  label: "Home",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
};

// ─── Main component ────────────────────────────────────────────────────────────
export default function SavedAddressesSection() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);

      const { data } = await API.get("/addresses");

      setAddresses(
        Array.isArray(data)
          ? data
          : data.addresses ?? []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    const required = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];
    for (const field of required) {
      if (!formData[field].trim()) {
        return `Please enter your ${field.replace(/([A-Z])/g, " $1").toLowerCase()}.`;
      }
    }
    if (!/^\d{10}$/.test(formData.phone.trim())) return "Phone must be 10 digits.";
    if (!/^\d{6}$/.test(formData.pincode.trim())) return "Pincode must be 6 digits.";
    return null;
  };

  const openAddModal = () => {
    setEditingAddress(null);
    setFormData(emptyForm);
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSaving(true);
      setFormError(null);

      if (editingAddress) {
        const { data } = await API.put(
          `/addresses/${editingAddress._id}`,
          formData
        );
        toast.success("Address updated successfully");

        setAddresses((prev) =>
          prev.map((item) =>
            item._id === editingAddress._id
              ? { ...item, ...(data.data || data.address || formData) }
              : item
          )
        );
      } else {
        const { data } = await API.post(
          "/addresses",
          formData
        );
        await fetchAddresses();
        toast.success("Address added successfully");
      }

      setShowModal(false);
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
        err.message
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await API.delete(`/addresses/${deleteId}`);

      setAddresses((prev) =>
        prev.filter((item) => item._id !== deleteId)
      );
      setDeleteId(null);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        err.message
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f5c2e]">Saved Addresses</h1>
        <div className="w-16 h-1 bg-[#22c55e] rounded mt-2" />
        <p className="text-gray-500 mt-3">Manage your delivery and billing addresses</p>
      </div>

      {/* Add button */}
      <div className="mb-6">
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#0f5c2e] hover:bg-[#0c4a26] text-white px-5 py-3 rounded-xl font-medium transition"
        >
          <Plus size={18} />
          Add New Address
        </button>
      </div>

      {/* Global error */}
      {error && (
        <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}{" "}
          <button onClick={fetchAddresses} className="underline font-medium">
            Retry
          </button>
        </div>
      )}

      {/* Address list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white border border-gray-100 rounded-3xl p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-100" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState onAdd={openAddModal} />
      ) : (
        <div className="space-y-5">
          {addresses.map((item) => (
            <div key={item._id} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0">
                    <LabelIcon label={item.label} size={24} className="text-[#0f5c2e]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-bold text-gray-900">{item.label}</h3>
                      {item.isDefault && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-2 font-medium text-gray-800">{item.fullName}</p>
                    <p className="text-gray-500">{item.phone}</p>
                    <div className="flex gap-2 mt-3">
                      <MapPin size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600">
                        {item.addressLine1}
                        {item.addressLine2 ? `, ${item.addressLine2}` : ""},{" "}
                        {item.city}, {item.state} – {item.pincode}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                    title="Edit address"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => setDeleteId(item._id)}
                    className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                    title="Delete address"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl rounded-[32px] overflow-hidden border border-white/10 bg-gradient-to-r from-[#012f1a] via-[#014421] to-[#0b6b32] shadow-2xl text-white">
            <div className="flex items-start justify-between px-8 pt-8">
              <div>
                <h2 className="text-4xl font-bold">
                  {editingAddress ? "Edit Address" : "Add Address"}
                </h2>
                <p className="text-white/70 mt-2">Save delivery address for faster checkout</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/70 hover:text-white text-3xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {formError && (
              <div className="mx-8 mt-4 px-4 py-3 rounded-2xl bg-red-500/20 border border-red-400/40 text-red-200 text-sm">
                {formError}
              </div>
            )}

            <div className="px-8 py-6 space-y-4">
              <select
                name="label"
                value={formData.label}
                onChange={handleInputChange}
                className="w-full h-14 rounded-2xl bg-white/10 border border-white/20 px-5 text-white outline-none"
              >
                <option value="Home" className="bg-[#0f5c2e] text-white">Home</option>
                <option value="Work" className="bg-[#0f5c2e] text-white">Work</option>
                <option value="Other" className="bg-[#0f5c2e] text-white">Other</option>
              </select>

              <div className="grid md:grid-cols-2 gap-4">
                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Full Name *" className="w-full h-14 rounded-2xl bg-black/10 border border-white/10 px-5 text-white placeholder:text-white/60 outline-none" />
                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone Number * (10 digits)" maxLength={10} className="w-full h-14 rounded-2xl bg-black/10 border border-white/10 px-5 text-white placeholder:text-white/60 outline-none" />
              </div>

              <input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} placeholder="Address Line 1 *" className="w-full h-14 rounded-2xl bg-black/10 border border-white/10 px-5 text-white placeholder:text-white/60 outline-none" />
              <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} placeholder="Address Line 2 (optional)" className="w-full h-14 rounded-2xl bg-black/10 border border-white/10 px-5 text-white placeholder:text-white/60 outline-none" />

              <div className="grid md:grid-cols-3 gap-4">
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City *" className="h-14 rounded-2xl bg-black/10 border border-white/10 px-5 text-white placeholder:text-white/60 outline-none" />
                <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State *" className="h-14 rounded-2xl bg-black/10 border border-white/10 px-5 text-white placeholder:text-white/60 outline-none" />
                <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="Pincode * (6 digits)" maxLength={6} className="h-14 rounded-2xl bg-black/10 border border-white/10 px-5 text-white placeholder:text-white/60 outline-none" />
              </div>
            </div>

            <div className="flex justify-end gap-4 px-8 pb-8">
              <button onClick={() => setShowModal(false)} disabled={saving} className="px-8 py-4 rounded-2xl border border-white/20 text-white hover:bg-white/5 transition disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="min-w-[220px] px-8 py-4 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] shadow-lg shadow-green-900/30 text-white font-semibold text-base transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100">
                {saving
                  ? editingAddress ? "Updating…" : "Saving…"
                  : editingAddress ? "Update Address" : "Save Address"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <DeleteModal
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}