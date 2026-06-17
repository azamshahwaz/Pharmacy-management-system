import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import API from "../../../../services/apiClient";

export default function PersonalInfoCard({
  user,
  setUser,
  showHeader = false,
}) {
  // ─── STATES ─────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    shopName: "",
    street: "",
    city: "",
  });

  // ─── SYNC USER → FORM ───────────────────────────────────
  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        shopName: user?.address?.shopName || "",
        street: user?.address?.street || "",
        city: user?.address?.city || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ─── SAVE PROFILE ───────────────────────────────────────
  const handleSave = async () => {
    try {
      setLoading(true);

      const { data } = await API.put(
        "/users/update-profile",
        formData
      );

      if (setUser) {
        setUser(data.user);
      }

      setFormData({
        name: data.user?.name || "",
        email: data.user?.email || "",
        phone: data.user?.phone || "",
        shopName:
          data.user?.address?.shopName || "",
        street:
          data.user?.address?.street || "",
        city:
          data.user?.address?.city || "",
      });

      toast.success(
        data.message ||
          "Profile updated successfully",
        {
          theme: "colored",
        }
      );

      setIsEditing(false);
    } catch (error) {
      console.error(
        "Update Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong",
        {
          theme: "colored",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* ─── HEADER ─────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#064e3b]">
            Personal Information
          </h2>
          <p className="text-base text-[#475467] mt-1">
            Manage your personal and account details
          </p>
        </div>

        <button
          onClick={() =>
            setIsEditing(!isEditing)
          }
          className="flex items-center gap-2 bg-gradient-to-r from-green-700 to-emerald-600 hover:opacity-90 text-white px-5 py-3 rounded-2xl font-medium shadow-sm transition-all duration-300"
        >
          {isEditing ? (
            <X size={18} />
          ) : (
            <Pencil size={18} />
          )}

          {isEditing
            ? "Cancel"
            : "Edit Profile"}
        </button>
      </div>

      {/* ─── EDIT FORM ──────────────────────────────────── */}
      {isEditing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 p-4 rounded-3xl bg-green-50/40 border border-green-100">
          <InputField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />

          <InputField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />

          <InputField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />

          {user?.role === "customer" && (
            <>
              <InputField
                label="Shop Name"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
              />

              <InputField
                label="Street"
                name="street"
                value={formData.street}
                onChange={handleChange}
              />

              <InputField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </>
          )}

          <div className="md:col-span-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-green-700 to-emerald-600 hover:opacity-90 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-semibold shadow-sm transition-all duration-300"
            >
              <Save size={18} />
              {loading
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* ─── INFO DISPLAY ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoItem
          icon={<Mail size={18} />}
          label="Email Address"
          value={formData.email}
        />

        <InfoItem
          icon={<Phone size={18} />}
          label="Phone Number"
          value={formData.phone}
        />

        {user?.role === "customer" && (
          <>
            <InfoItem
              icon={<Building2 size={18} />}
              label="Shop Name"
              value={formData.shopName}
            />

            <InfoItem
              icon={<MapPin size={18} />}
              label="Street"
              value={formData.street}
            />

            <InfoItem
              icon={<MapPin size={18} />}
              label="City"
              value={formData.city}
            />
          </>
        )}
      </div>
    </div>
  );
}

/* ─── INFO ITEM ─────────────────────────────────────────── */
function InfoItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="bg-gradient-to-br from-white to-green-50/30 border border-gray-100 rounded-3xl p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
          {icon}
        </div>

        <p className="text-sm font-semibold text-[#475467]">
          {label}
        </p>
      </div>

      <h3 className="text-xl md:text-2xl font-bold text-gray-900 break-words">
        {value || "Not Available"}
      </h3>
    </div>
  );
}

/* ─── INPUT FIELD ───────────────────────────────────────── */
function InputField({
  label,
  name,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-[#344054] mb-2 block">
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none bg-white focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all"
      />
    </div>
  );
}

