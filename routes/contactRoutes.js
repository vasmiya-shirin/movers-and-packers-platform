const express = require("express");
const router = express.Router();
const { authUser } = require("../middlewares/auth");
const contactController = require("../controllers/contactContrroller")

router.post("/send",authUser,contactController.sendMessage)
router.get("/admin/all",authUser,contactController.getAllContactMessage)

module.exports = router;