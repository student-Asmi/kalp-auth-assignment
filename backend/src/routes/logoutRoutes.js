const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const {logout, logoutAll} = require('../controllers/logoutController');

router.post("/logout", authMiddleware, logout);
router.post("/logout-all", authMiddleware, logoutAll);

module.exports = router;