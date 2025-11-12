const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { authUser } = require("../middlewares/auth");
const { checkRole } = require("../middlewares/roleCheck");

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
router.get("/", authUser, bookingController.getMyBookings);
router.get("/:id", authUser, bookingController.getBookingById);
router.put("/:id", authUser, bookingController.updateBooking);
router.delete("/:id", authUser, bookingController.deleteBooking);

module.exports = router;
