const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    sessionId: {
        type: String,
        required: true,
        unique: true,
    },
    userAgent: String,
    ip : String,
    isActive: {
        type: Boolean,
        default: true,
    },
    lastActive: {
        type: Date,
        default: Date.now,
    },
    deviceHash: {
      type: String,
      required: true,
    },
}, { timestamps: true });

sessionSchema.index(
    {userId: 1, deviceHash: 1, isActive: 1},
    {unique: true}
); 


module.exports = mongoose.model("Session", sessionSchema);