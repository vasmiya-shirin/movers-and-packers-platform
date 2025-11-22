const Payment = require("../models/paymentModel");

exports.stripeWebhook = async (req, res) => {
  try {
    const event = req.body;

    // Listens for successful payment event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      await Payment.findOneAndUpdate(
        { transactionId: session.id },
        { status: "Completed" }
      );
    }

    res.status(200).json({ received: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
