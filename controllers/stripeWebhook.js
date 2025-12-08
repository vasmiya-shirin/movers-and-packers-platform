const Booking = require("../models/bookingModel");
const Payment = require("../models/paymentModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      // Find the payment record
      const payment = await Payment.findOne({ transactionId: session.id });
      if (!payment) throw new Error("Payment not found");

      // Update payment status
      payment.status = "Completed";
      await payment.save();

      // Update booking status
      const booking = await Booking.findById(payment.booking);
      if (!booking) throw new Error("Booking not found");

      booking.paymentStatus = "Paid";
      booking.status = "Completed";
      await booking.save();

      console.log(`Booking ${booking._id} marked as Paid`);
    } catch (err) {
      console.error("Error updating payment/booking:", err.message);
    }
  }

  res.status(200).json({ received: true });
};




