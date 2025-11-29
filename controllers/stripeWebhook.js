const Payment=require("../models/paymentModel")

exports.stripeWebhook = async (req, res) => {
  try {
    const event = req.body;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Find payment record
      const payment = await Payment.findOne({ transactionId: session.id });

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      // Update payment
      payment.status = "Completed";
      await payment.save();

      // Update booking to Paid
      await Booking.findByIdAndUpdate(payment.booking, {
        paymentStatus: "Paid",
        status: "Accepted",     // or keep Pending if provider approves manually
      });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
