const Session = require("../models/Session");

 //LOGOUT CURRENT DEVICE

 const logout = async (req, res) => {
    try {
        const {sessionId} = req.user;

        await Session.findOneAndUpdate(
            {_id: sessionId},
            {isActive: false}
        );

        res.json({message: "Logged out from current device"});
    } catch (error) {
        res.status(500).json({message: "Logout failed", error: error.message});
    }
};

//LOGOUT ALL DEVICES

const logoutAll = async (req, res) => {
    try {
        const {userId} = req.user;

        await Session.updateMany(
            {userId, isActive: true},
            {isActive: false}
        );

        res.json({message: "Logged out from all devices"});
    } catch (error) {
        res.status(500).json({message: "Logout failed", error: error.message});
    }
};

module.exports = {
    logout,
    logoutAll,
};