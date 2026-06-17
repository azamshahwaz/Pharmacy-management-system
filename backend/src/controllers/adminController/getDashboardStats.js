import User from "../../models/User.js";
import Medicine from "../../models/Medicine.js";
import Order from "../../models/Order.js";

export const getDashboardStats = async (req, res, next) => {
  try {

    const role =
      req.user.role;

    const userId =
      req.user.id;

    let data = {};

    // ================= ADMIN =================
    if (role === "admin") {

      const [
        totalUsers,
        totalMedicines,
        totalOrders,
        pendingOrders,
        revenueData,
      ] = await Promise.all([

        // ================= TOTAL USERS =================
        User.countDocuments(),

        // ================= TOTAL MEDICINES =================
        Medicine.countDocuments(),

        // ================= TOTAL ORDERS =================
        Order.countDocuments(),

        // ================= PENDING ORDERS =================
        Order.countDocuments({
          status: "pending",
        }),

        // ================= TOTAL REVENUE =================
        Order.aggregate([
          {
            $match: {
              status: {
                $in: [
                  "delivered",
                ],
              },
            },
          },

          {
            $group: {
              _id: null,

              total: {
                $sum:
                  "$grandTotal",
              },
            },
          },
        ]),
      ]);

      data = {

        totalUsers,

        totalMedicines,

        totalOrders,

        pendingOrders,

        totalRevenue:
          revenueData?.[0]
            ?.total || 0,
      };
    }

// ================= STAFF =================
// ================= STAFF =================
else if (role === "staff") {

  const [
    pendingOrders,
    completedOrders,
    totalMedicines,
    approvedCustomers,

    acceptedOrders,
    rejectedOrders,
    deliveredOrders,

  ] = await Promise.all([

    // ================= PENDING ORDERS =================
    Order.countDocuments({
      status: "pending",
    }),

    // ================= COMPLETED ORDERS BY CURRENT STAFF =================
    Order.countDocuments({
      status: "delivered",
      "actionBy.userId": userId,
    }),

    // ================= TOTAL MEDICINES =================
    Medicine.countDocuments(),

    // ================= APPROVED CUSTOMERS BY CURRENT STAFF =================
    User.countDocuments({
      role: "customer",
      status: "approved",
      "actionBy.userId": userId,
    }),

    // ================= ACCEPTED ORDERS BY CURRENT STAFF =================
    Order.countDocuments({
      "acceptedBy.userId": userId,
    }),

    // ================= REJECTED ORDERS BY CURRENT STAFF =================
    Order.countDocuments({
      "rejectedBy.userId": userId,
    }),

    // ================= DELIVERED ORDERS BY CURRENT STAFF =================
    Order.countDocuments({
      "deliveredBy.userId": userId,
    }),
  ]);

  data = {
    pendingOrders,
    completedOrders,
    totalMedicines,
    approvedCustomers,

    // New fields for pie chart
    acceptedOrders,
    rejectedOrders,
    deliveredOrders,
  };
}

    // ================= CUSTOMER =================
    else if (role === "customer") {

const user = await User.findById(userId);

const [
totalOrders,
pendingPayments,
deliveredOrders,
activeOrders,
totalSpentData,
] = await Promise.all([

// Total Orders
Order.countDocuments({
  "user.userId": userId,
}),

// Pending Payments
Order.countDocuments({
  "user.userId": userId,
  paymentStatus: "pending",
}),

// Delivered Orders
Order.countDocuments({
  "user.userId": userId,
  status: "delivered",
}),

// Active Orders
Order.countDocuments({
  "user.userId": userId,
  status: {
    $in: [
      "pending",
      "accepted",
      "delivered",
    ],
  },
}),

// Total Spent (ONLY DELIVERED ORDERS)
Order.aggregate([
  {
    $match: {
      "user.userId": userId,
      status: "delivered",
    },
  },
  {
    $group: {
      _id: null,
      totalSpent: {
        $sum: "$grandTotal",
      },
    },
  },
]),


]);

const totalSpent =
totalSpentData?.[0]?.totalSpent || 0;

const savedAddresses =
user?.addresses?.length || 0;

data = {
reviewOrders: deliveredOrders,
totalOrders,
trackOrder: activeOrders,
pendingPayments,


// Customer Profile Stats
totalSpent,
savedAddresses,

};
}
    // ================= RESPONSE =================
    res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {
  return next(error);
}
};