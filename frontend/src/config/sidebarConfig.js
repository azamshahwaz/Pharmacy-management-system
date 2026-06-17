import {
  LayoutDashboard,
  Users,
  Pill,
  ShoppingCart,
  BarChart3,
  User,
  Settings,
  LogOut,
  Package,
  Truck,
  CreditCard,
} from "lucide-react";

/**
 * =========================
 * COMMON ACCOUNT SECTION
 * =========================
 */
const accountSection = {
  title: "ACCOUNT",

  items: [
    {
      icon: User,
      label: "Profile",
      path: "/dashboard/profile",
    },

    {
      icon: Settings,
      label: "Settings",
      path: "/dashboard/settings",
    },

    {
      icon: LogOut,
      label: "Logout",
      action: "logout",
    },
  ],
};

/**
 * =========================
 * SIDEBAR CONFIG
 * =========================
 */
export const sidebarConfig = {
  /**
   * =========================
   * ADMIN
   * =========================
   */
  admin: [
    {
      title: "MENU",

      items: [
        {
          icon: LayoutDashboard,
          label: "Dashboard",
          path: "/dashboard",
        },
      ],
    },

    {
      title: "MANAGEMENT",

      items: [
        {
          icon: Users,
          label: "Users",
          path: "/dashboard/users",

          meta: {
            admin: {
              filter: "all",
            },

            staff: {
              filter: "customer",
            },
          },
        },

        {
          icon: Pill,
          label: "Medicines",
          path: "/dashboard/manage-medicines",
        },

        {
          icon: ShoppingCart,
          label: "Orders",
          path: "/dashboard/orders",
        },

        {
          icon: BarChart3,
          label: "Reports",
          path: "/dashboard/reports",

          access: ["admin"],
        },
      ],
    },

    accountSection,
  ],

  /**
   * =========================
   * STAFF
   * =========================
   */
  staff: [
    {
      title: "MENU",

      items: [
        {
          icon: LayoutDashboard,
          label: "Dashboard",
          path: "/dashboard",
        },
      ],
    },

    {
      title: "OPERATIONS",

      items: [
        {
          icon: Package,
          label: "Orders",
          path: "/dashboard/orders",
        },

        {
          icon: Pill,
          label: "Medicines",
          path: "/dashboard/manage-medicines",
        },

        {
  icon: Users,
  label: "Customers",
  path: "/dashboard/customers",
},
      ],
    },

    accountSection,
  ],

  /**
   * =========================
   * CUSTOMER
   * =========================
   */
  customer: [
    {
      title: "MENU",

      items: [
        {
          icon: LayoutDashboard,
          label: "Dashboard",
          path: "/dashboard",
        },
      ],
    },

    {
      title: "SHOP",

      items: [
        {
          icon: Pill,
          label: "Medicines",
          path: "/dashboard/medicines",
        },

        {
          icon: ShoppingCart,
          label: "Review Order",
          path: "/dashboard/review-orders",
        },

        {
          icon: CreditCard,
          label: "Payment",
          path: "/dashboard/payment-history",
        },

        {
          icon: Package,
          label: "Orders",
          path: "/dashboard/orders",
        },

        {
          icon: Truck,
          label: "Track Order",
          path: "/dashboard/track-orders",
        },
      ],
    },

    accountSection,
  ],
};