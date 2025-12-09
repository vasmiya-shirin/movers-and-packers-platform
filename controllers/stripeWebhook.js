// controllers/stripeWebhook.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/bookingModel");
const Payment = require("../models/paymentModel");

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const payment = await Payment.findOne({ transactionId: session.id });
      if (!payment) throw new Error("Payment record not found");

      payment.status = "Completed";
      payment.paymentIntentId = session.payment_intent;
      await payment.save();

      // Update booking status
      const booking = await Booking.findById(payment.booking);
      if (!booking) throw new Error("Booking not found");

      booking.paymentStatus = "Paid";
      booking.status = "Completed";
      await booking.save();

      console.log(`Booking ${booking._id} marked as Paid`);
    } catch (err) {
      console.error("Error updating payment/booking :", err.message);
    }
  }

  res.status(200).json({ received: true });
};




