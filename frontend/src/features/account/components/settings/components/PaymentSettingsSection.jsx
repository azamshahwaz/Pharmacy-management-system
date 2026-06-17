import { useEffect, useState } from "react";
import API from "../../../../../services/apiClient";
import { toast } from "react-toastify";
import {
  CreditCard,
  Wallet,
  ShieldCheck,
  Smartphone,
  Save,
} from "lucide-react";

export default function PaymentSettingsSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    preferredMethod: "upi",
    upiId: "",
    preferredCardName: "",
    allowCOD: true,
    savePaymentHistory: true,
    paymentNotifications: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  // =========================
  // LOAD SETTINGS
  // =========================

  const fetchSettings = async () => {
    try {
      const { data } = await API.get(
        "/users/payment-settings"
      );

      const paymentSettings =
        data?.paymentSettings ||
        data?.settings ||
        data;

      setSettings({
        preferredMethod:
          paymentSettings?.preferredMethod ||
          "upi",

        upiId:
          paymentSettings?.upiId || "",

        preferredCardName:
          paymentSettings?.preferredCardName ||
          "",

        allowCOD:
          paymentSettings?.allowCOD ?? true,

        savePaymentHistory:
          paymentSettings?.savePaymentHistory ??
          true,

        paymentNotifications:
          paymentSettings?.paymentNotifications ??
          true,
      });
    } catch (error) {
      console.error(
        "Payment settings fetch error:",
        error.response?.data || error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  
  // =========================
  // SAVE SETTINGS
  // =========================

  const handleSave = async () => {
    if (
      settings.preferredMethod === "upi" &&
      !settings.upiId.trim()
    ) {
      return toast.error(
  "Please enter a valid UPI ID"
);
    }

    if (
      settings.preferredMethod === "card" &&
      !settings.preferredCardName.trim()
    ) {
      return toast.error(
  "Please enter a preferred card name"
);
    }

    try {
      setSaving(true);

      await API.put(
        "/users/payment-settings",
        settings
      );

      toast.success(
        "Payment settings updated successfully"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update settings"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border p-6">
        Loading payment settings...
      </div>
    );
  }
  
  return (
  <div className="p-6">

    {/* HEADER */}

    <div className="mb-8">
      <h1 className="text-2xl font-bold text-[#0f5c2e]">
        Payment Settings
      </h1>

      <div className="w-16 h-1 bg-[#22c55e] rounded mt-2" />

      <p className="text-gray-500 mt-3">
        Manage your payment preferences and checkout options
      </p>
    </div>

{/* PAYMENT METHOD CARD */}

<div
  className="
    bg-gradient-to-br
    from-white
    via-white
    to-green-50/40
    rounded-[32px]
    border
    border-green-100
    shadow-sm
    p-7
    mb-6
  "
>
  {/* Header */}

  <div className="flex items-center gap-4 mb-7">

    <div
      className="
        w-14
        h-14
        rounded-2xl
        bg-gradient-to-br
        from-green-100
        to-green-50
        flex
        items-center
        justify-center
      "
    >
      <Wallet
        size={24}
        className="text-[#0f5c2e]"
      />
    </div>

    <div>

      <h3 className="font-bold text-xl text-gray-900">
        Preferred Payment Method
      </h3>

      <p className="text-gray-600 text-sm mt-1 font-medium">
  Choose your default payment option for checkout
</p>

    </div>

  </div>

  {/* Methods */}

  <div className="grid md:grid-cols-3 gap-5">

    {[
      {
  value: "upi",
  title: "UPI",
  subtitle: "Instant payment via UPI apps",
  icon: Smartphone,
},

{
  value: "card",
  title: "Card",
  subtitle: "Credit and debit card payments",
  icon: CreditCard,
},

{
  value: "cash",
  title: "Cash On Delivery",
  subtitle: "Pay after receiving your order",
  icon: Wallet,
},
    ].map((item) => {

      const Icon = item.icon;

      const active =
        settings.preferredMethod ===
        item.value;

      return (

        <button
          key={item.value}
          onClick={() =>
            handleChange(
              "preferredMethod",
              item.value
            )
          }
          className={`
            relative
            overflow-hidden
            rounded-[24px]
            border-2
            p-5
            text-left
            transition-all
            duration-300
            group

            ${
              active
                ? `
                  border-green-500
                  bg-gradient-to-br
                  from-green-50
                  via-white
                  to-green-100/40
                  shadow-lg
                  shadow-green-100
                  scale-[1.02]
                `
                : `
                  border-gray-100
                  bg-white
                  hover:border-green-300
                  hover:shadow-md
                  hover:-translate-y-1
                `
            }
          `}
        >

          {/* Selected Badge */}

          {active && (

            <div
              className="
                absolute
                top-0
                right-0
                bg-green-500
                text-white
                text-xs
                font-semibold
                px-3
                py-1
                rounded-bl-xl
              "
            >
              Selected
            </div>

          )}

          {/* Icon */}

          <div
            className={`
              w-14
              h-14
              rounded-2xl
              flex
              items-center
              justify-center
              mb-4

              ${
                active
                  ? "bg-green-100"
                  : "bg-gray-50 group-hover:bg-green-50"
              }
            `}
          >

            <Icon
              size={24}
              className="text-[#0f5c2e]"
            />

          </div>

          {/* Content */}

          <h4
  className="
    font-bold
    text-gray-900
    text-[17px]
    tracking-tight
  "
>
            {item.title}
          </h4>

          <p
  className="
    text-sm
    text-gray-700
    font-medium
    mt-2
    leading-relaxed
  "
>
  {item.subtitle}
</p>

          {/* Radio Indicator */}

          <div
            className={`
              absolute
              bottom-5
              right-5
              w-6
              h-6
              rounded-full
              border-2
              flex
              items-center
              justify-center

              ${
                active
                  ? "border-green-500 bg-green-500"
                  : "border-gray-300"
              }
            `}
          >

            {active && (

              <div
                className="
                  w-2.5
                  h-2.5
                  rounded-full
                  bg-white
                "
              />

            )}

          </div>

        </button>

      );
    })}
  </div>
</div>

    {/* PAYMENT DETAILS */}

    <div className="grid lg:grid-cols-2 gap-6 mb-6">

      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">

        <div className="flex items-center gap-3 mb-4">
          <Smartphone
            size={20}
            className="text-[#0f5c2e]"
          />

          <h3 className="font-bold">
            UPI Information
          </h3>
        </div>

        <input
          type="text"
          value={settings.upiId}
          onChange={(e) =>
            handleChange(
              "upiId",
              e.target.value
            )
          }
          placeholder="example@paytm"
          className="
w-full
h-16
rounded-2xl
border
border-green-100
bg-gradient-to-r
from-green-50
via-white
to-white
px-5
text-gray-800
text-[15px]
font-semibold
placeholder:text-gray-500
placeholder:font-medium
shadow-sm
outline-none
transition-all
duration-300
focus:border-green-500
focus:ring-4
focus:ring-green-100
focus:shadow-md
"
        />
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">

        <div className="flex items-center gap-3 mb-4">
          <CreditCard
            size={20}
            className="text-[#0f5c2e]"
          />

          <h3 className="font-bold">
            Preferred Card
          </h3>
        </div>

        <input
          type="text"
          value={settings.preferredCardName}
          onChange={(e) =>
            handleChange(
              "preferredCardName",
              e.target.value
            )
          }
          placeholder="HDFC Platinum"
          className="
w-full
h-16
rounded-2xl
border
border-green-100
bg-gradient-to-r
from-green-50
via-white
to-white
px-5
text-gray-800
text-[15px]
font-semibold
placeholder:text-gray-500
placeholder:font-medium
shadow-sm
outline-none
transition-all
duration-300
focus:border-green-500
focus:ring-4
focus:ring-green-100
focus:shadow-md
"
        />
      </div>

    </div>

    {/* SETTINGS CARD */}

    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 mb-6">

      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck
          className="text-[#0f5c2e]"
        />

        <h3 className="font-bold text-lg">
          Payment Preferences
        </h3>
      </div>

      <div className="space-y-5">

        {[
          {
            label: "Allow Cash On Delivery",
            field: "allowCOD",
          },

          {
            label: "Save Payment History",
            field: "savePaymentHistory",
          },

          {
            label: "Payment Notifications",
            field: "paymentNotifications",
          },
        ].map((item) => (
          <div
            key={item.field}
            className="
              flex
              items-center
              justify-between
              py-3
              border-b
              border-gray-100
              last:border-none
            "
          >
            <span className="font-medium text-gray-700">
              {item.label}
            </span>

            <button
              onClick={() =>
                handleChange(
                  item.field,
                  !settings[item.field]
                )
              }
              className={`
                w-14
                h-8
                rounded-full
                transition
                relative

                ${
                  settings[item.field]
                    ? "bg-green-500"
                    : "bg-gray-300"
                }
              `}
            >
              <div
                className={`
                  absolute
                  top-1
                  w-6
                  h-6
                  bg-white
                  rounded-full
                  transition-all

                  ${
                    settings[item.field]
                      ? "left-7"
                      : "left-1"
                  }
                `}
              />
            </button>
          </div>
        ))}
      </div>
    </div>

    {/* SAVE BUTTON */}

    <div className="flex justify-end">

      <button
        onClick={handleSave}
        disabled={saving}
        className="
          flex
          items-center
          gap-3
          px-8
          py-4
          rounded-2xl

          bg-gradient-to-r
          from-[#22c55e]
          to-[#16a34a]

          hover:from-[#16a34a]
          hover:to-[#15803d]

          shadow-lg
          shadow-green-900/20

          text-white
          font-semibold

          transition-all
          duration-300

          hover:scale-[1.02]

          disabled:opacity-60
        "
      >
        <Save size={18} />

        {saving
          ? "Saving..."
          : "Save Settings"}
      </button>

    </div>

  </div>
);
}