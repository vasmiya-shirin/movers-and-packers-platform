const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authUser } = require("../middlewares/auth");
const { checkRole } = require("../middlewares/roleCheck");
const { createCheckoutSession } = require("../controllers/stripeController");

router.post("/",authUser,checkRole(["client"]),paymentController.createPayment)
router.get("/",authUser,checkRole(["admin"]),paymentController.getPayments)
router.get("/:id",authUser,paymentController.getPaymentById)
router.put("/:id",authUser,checkRole(["admin"]),paymentController.updatePayment)
router.delete("/:id",authUser,checkRole(["admin"]),paymentController.deletePayment)
router.post("/create-checkout-session", createCheckoutSession);

module.exports=router