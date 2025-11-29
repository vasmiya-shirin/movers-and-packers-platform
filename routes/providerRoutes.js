const express = require("express");
const router = express.Router();
const { authUser } = require("../middlewares/auth");
const multer = require("../middlewares/multer");
const providerController = require("../controllers/providerController");

router.put("/availability", authUser, providerController.updateAvailability);

router.post(
  "/verify",
  authUser,
  multer.array("documents", 5),
  providerController.uploadVerificationDocs
);

module.exports = router;

