import Order from "../../models/Order.js";

export const getAllOrders = async (req, res, next) => {
  try {

    const orders =
      await Order.find({})

        .populate({
          path: "user.userId",
          select:
            "name email phone address",
        })

        .populate({
          path: "actionBy.userId",
          select:
            "name email phone role",
        })

        .populate({
          path: "items.medicineId",
          select:
            "productName price productCategory",
        })

        .sort({
          createdAt: -1,
        });

    // ======================================
    // SAFE FORMAT
    // ======================================
    const formattedOrders =
      orders.map((order) => {

        let grandTotal = 0;

        const items =
          order.items.map(
            (item) => {

              const medicine =
                item.medicineId;

              const price =
                medicine?.price || 0;

              const total =
                item.quantity *
                price;

              grandTotal += total;

              return {
                medicineId:
                  medicine?._id || null,

                medicineName:
                  medicine
                    ?.productName ||
                  "Medicine Deleted",

                quantity:
                  item.quantity,

                price,

                total,
              };
            }
          );

        return {
          _id: order._id,

          orderId:
            order.orderId,

          createdAt:
            order.createdAt,

          status:
            order.status,

          user: {
            userId:
              order.user
                ?.userId?._id ||
              null,

            name:
              order.user
                ?.userId?.name ||
              "Unknown User",

            email:
              order.user
                ?.userId?.email ||
              "-",

            phone:
              order.user
                ?.userId?.phone ||
              "-",

            address:
              order.user
                ?.userId
                ?.address || "-",
          },

          // ✅ SAFE ACTIONBY
          actionBy: {
            name:
              order.actionBy
                ?.userId?.name ||
              "-",

            email:
              order.actionBy
                ?.userId?.email ||
              "-",

            phone:
              order.actionBy
                ?.userId?.phone ||
              "-",

            role:
              order.actionBy
                ?.userId?.role ||
              "-",

            actionAt:
              order.actionBy?.actionAt || null,
          },

          // ✅ ACCEPTED BY
          acceptedBy: {
            userId:
              order.acceptedBy
                ?.userId || null,

            name:
              order.acceptedBy
                ?.name || "-",

            email:
              order.acceptedBy
                ?.email || "-",

            role:
              order.acceptedBy
                ?.role || "-",

            actionAt:
              order.acceptedBy
                ?.actionAt || null,
          },

          // ✅ REJECTED BY
          rejectedBy: {
            userId:
              order.rejectedBy
                ?.userId || null,

            name:
              order.rejectedBy
                ?.name || "-",

            email:
              order.rejectedBy
                ?.email || "-",

            role:
              order.rejectedBy
                ?.role || "-",

            actionAt:
              order.rejectedBy
                ?.actionAt || null,
          },

          // ✅ DELIVERED BY
          deliveredBy: {
            userId:
              order.deliveredBy
                ?.userId || null,

            name:
              order.deliveredBy
                ?.name || "-",

            email:
              order.deliveredBy
                ?.email || "-",

            role:
              order.deliveredBy
                ?.role || "-",

            actionAt:
              order.deliveredBy
                ?.actionAt || null,
          },

          items,

          grandTotal,
        };
      });

    res.status(200).json({
      success: true,

      totalOrders:
        formattedOrders.length,

      results:
        formattedOrders.length,

      data:
        formattedOrders,
    });

  } catch (error) {
  console.error(
    "GET ALL ORDERS ERROR:",
    error
  );
  return next(error);
}
};