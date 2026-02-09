const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
//      message: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//    sentAt: {
//     type: Date,
//     default: Date.now, 
//   },
    isVerified: {
        type: Boolean,
        default: true,
    },
},
{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
