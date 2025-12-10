const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/bookingModel");
const Payment = require("../models/paymentModel");

exports.createCheckoutSession = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate("service");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: booking.service?.title },
            unit_amount: booking.totalPrice * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/payment-success?bookingId=${booking._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/my-bookings`,
      metadata: { bookingId: booking._id.toString() }
    });

    // Save payment record using ONLY session.id
    await Payment.create({
      booking: booking._id,
      transactionId: session.id,   // ✔ USE ONLY THIS
      status: "Pending",
      amount: booking.totalPrice,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ message: "Checkout session failed" });
  }
};


