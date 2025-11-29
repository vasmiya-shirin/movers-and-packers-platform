const express = require("express");
const router = express.Router();
const { authUser } = require("../middlewares/auth");
const messageController = require("../controllers/messageController");

router.post("/", authUser, messageController.sendMessage);          // send a message
router.get("/:bookingId", authUser, messageController.getMessages); // get messages by booking

module.exports = router;
