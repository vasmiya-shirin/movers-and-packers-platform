const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { authUser } = require("../middlewares/auth");
const { checkRole } = require("../middlewares/roleCheck");

router.post("/", authUser, checkRole(["client"]), reviewController.addReview);
router.get("/", authUser, checkRole(["admin"]), reviewController.getReviews);
router.get("/:id", authUser, reviewController.getReviewById);
router.put(
  "/:id",
  authUser,
  checkRole(["client", "admin"]),
  reviewController.updateReview
);
router.delete(
  "/:id",
  authUser,
  checkRole(["admin"]),
  reviewController.deleteReview
);

module.exports = router;
