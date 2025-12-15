const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { authUser } = require("../middlewares/auth");
const { checkRole } = require("../middlewares/roleCheck");
const { route } = require("./paymentRoutes");
const requireVerifiedProvider=require("../middlewares/requireVerifiedProvider")
router.post(
  "/",
  authUser,
  checkRole(["client"]),
  bookingController.createBooking
);
router.get(
  "/all",
  authUser,
  checkRole(["admin"]),
  bookingController.getAllBookings
);
router.get("/my", authUser, bookingController.getMyBookings);

router.get(
  "/provider-dashboard",
  authUser,
  bookingController.providerDashboard
);
router.get(
  "/admin-dashboard",
  authUser,
  checkRole(["admin"]),
  bookingController.adminDashboard
);
router.get("/:id", authUser, bookingController.getBookingById);
router.put("/update-tracking",authUser,checkRole(["provider","admin"]),requireVerifiedProvider,bookingController.updateTrackingStatus)
router.put("/:id/status",authUser,checkRole(["admin",'provider']),requireVerifiedProvider,bookingController.updateBookingStatus)
router.put("/:id", authUser, bookingController.updateBooking);
router.delete("/:id", authUser, bookingController.deleteBooking);

module.exports = router;
