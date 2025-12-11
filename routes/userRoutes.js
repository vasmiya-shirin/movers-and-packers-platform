const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authUser } = require("../middlewares/auth");
const { checkRole } = require("../middlewares/roleCheck");
const upload = require("../middlewares/multer");

router.post("/register", upload.single("profilePic"), userController.register);
router.post("/login", userController.login);
router.post("/forgot-password", userController.forgotPassword);
router.post("/verify-otp",userController.verifyOTP)
router.post("/reset-password/", userController.resetPassword);
router.get("/profile", authUser, userController.getProfile);
router.put("/edit-profile", authUser, userController.updateLoggedInUser);
router.get("/", authUser, checkRole(["admin"]), userController.getAllusers);
router.get("/:id", authUser, userController.getUserById);
router.put("/availability", authUser, userController.availabilityCheck);
router.put("/:id", authUser, userController.updateUser);
router.delete(
  "/:id",
  authUser,
  checkRole(["admin"]),
  userController.deleteUser
);

router.get("/check-user", authUser, userController.checkUser);
router.post("/logout", authUser, userController.logout);

router.post(
  "/upload-profile",
  authUser,
  upload.single("profilePic"),
  userController.uploadProfile
);

module.exports = router;
