const express = require('express');
const userController = require('../../controllers/user.controller');
const authMiddleware = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/update-details', authMiddleware, userController.updateUserDetails);

module.exports = router;