import mongoose from "mongoose"

const notificationSchema =
    new mongoose.Schema({

        emailNotifications: {
            type: Boolean,
            default: true
        },

        pushNotifications: {
            type: Boolean,
            default: false
        },

        orderAlerts: {
            type: Boolean,
            default: true
        },

        smsNotifications: {
            type: Boolean,
            default: false
        }
    })

export default mongoose.model(
    "NotificationSettings",
    notificationSchema
)