import {
  useEffect,
  useState,
} from "react";

import {
  Bell,
  Mail,
  Smartphone,
  BadgeAlert,
} from "lucide-react";

import {
  getNotificationSettings,
  updateNotificationSettings,
} from "../../../../../services/settingsAPI";

import { toast } from "react-toastify";


export default function NotificationSettingsSection() {

  // ======================================
  // SETTINGS STATE
  // ======================================

  const [settings, setSettings] =
    useState({

      emailNotifications: true,

      pushNotifications: false,

      orderAlerts: true,

      smsNotifications: false,
    });


  // ======================================
  // LOADING STATE
  // ======================================

  const [loading, setLoading] =
    useState(false);


  // ======================================
  // FETCH SETTINGS
  // ======================================

  useEffect(() => {

    const fetchSettings =
      async () => {

        try {

          setLoading(true);

          const data =
            await getNotificationSettings();

          setSettings(data);

        } catch (error) {

          console.log(
            "Fetch Error:",
            error
          );

        } finally {

          setLoading(false);
        }
      };

    fetchSettings();

  }, []);


  // ======================================
  // TOGGLE HANDLER
  // ======================================

  const handleToggle =
    async (key) => {

      const updatedSettings = {

        ...settings,

        [key]:
          !settings[key],
      };

      // UI UPDATE
      setSettings(
        updatedSettings
      );

      try {

        // DATABASE UPDATE
        await updateNotificationSettings(
          updatedSettings
        );

        toast.success("Settings updated successfully!");

      } catch (error) {

        toast.error(
          "Failed to update settings"
        );
      }
    };


  // ======================================
  // SETTINGS ARRAY
  // ======================================

  const notifications = [

    {
      key:
        "emailNotifications",

      icon: Mail,

      title:
        "Email Notifications",

      description:
        "Receive updates and alerts via email",

      enabled:
        settings.emailNotifications,
    },

    {
      key:
        "pushNotifications",

      icon: Bell,

      title:
        "Push Notifications",

      description:
        "Get real-time app notifications",

      enabled:
        settings.pushNotifications,
    },

    {
      key:
        "orderAlerts",

      icon: BadgeAlert,

      title:
        "Order Alerts",

      description:
        "Receive order and inventory updates",

      enabled:
        settings.orderAlerts,
    },

    {
      key:
        "smsNotifications",

      icon: Smartphone,

      title:
        "SMS Notifications",

      description:
        "Get important updates through SMS",

      enabled:
        settings.smsNotifications,
    },
  ];


  // ======================================
  // LOADING SCREEN
  // ======================================

  if (loading) {

    return (

      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
          text-xl
          font-semibold
        "
      >
        Loading Settings...
      </div>
    );
  }


  // ======================================
  // MAIN UI
  // ======================================

  return (

    <div
      className="
        min-h-screen
        bg-gray-50
        p-6
      "
    >

      {/* ================= HEADER ================= */}
      <div className="mb-6">
  <div>
    <h1 className="text-2xl font-bold text-green-900">
      Notification Settings
    </h1>

    <div className="w-16 h-1 bg-green-600 mt-1 rounded"></div>
  </div>

  <p className="text-gray-500 mt-3">
    Manage your alerts and
          notification preferences
  </p>

</div>


      {/* ================= SETTINGS LIST ================= */}

      <div className="space-y-5">

        {notifications.map(
          (item) => {

            const Icon =
              item.icon;

            return (

              <div
                key={item.title}
                className="
                  bg-white
                  rounded-3xl
                  border
                  border-gray-100
                  p-5
                  flex
                  items-center
                  justify-between
                  gap-4
                  hover:shadow-md
                  transition
                "
              >

                {/* LEFT SECTION */}

                <div className="flex gap-4">

                  {/* ICON */}

                  <div
                    className="
                      w-14
                      h-14
                      rounded-2xl
                      bg-amber-100
                      text-amber-700
                      flex
                      items-center
                      justify-center
                      shrink-0
                    "
                  >
                    <Icon size={24} />
                  </div>


                  {/* CONTENT */}

                  <div>

                    <h2
                      className="
                        text-lg
                        font-semibold
                        text-gray-900
                      "
                    >
                      {item.title}
                    </h2>

                    <p
                      className="
                        text-sm
                        text-gray-500
                        mt-1
                      "
                    >
                      {item.description}
                    </p>

                  </div>

                </div>


                {/* TOGGLE SWITCH */}

                <label
                  className="
                    relative
                    inline-flex
                    items-center
                    cursor-pointer
                  "
                >

                  <input
                    type="checkbox"

                    checked={
                      item.enabled
                    }

                    onChange={() =>
                      handleToggle(
                        item.key
                      )
                    }

                    className="
                      sr-only
                      peer
                    "
                  />

                  <div
                    className="
                      w-11
                      h-6
                      bg-gray-300
                      rounded-full
                      transition
                      peer-checked:bg-amber-500

                      after:content-['']
                      after:absolute
                      after:top-[2px]
                      after:left-[2px]

                      after:bg-white
                      after:border
                      after:border-gray-300

                      after:rounded-full

                      after:h-5
                      after:w-5

                      after:transition-all

                      peer-checked:after:translate-x-full
                    "
                  />

                </label>

              </div>
            );
          }
        )}

      </div>

    </div>
  );
}