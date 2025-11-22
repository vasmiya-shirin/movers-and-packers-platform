const Stripe = require("stripe");
const Payment = require("../models/paymentModel");
const Booking = require("../models/bookingModel");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

//create checkout session
exports.createCheckoutSession = async (req, res) => {
  try {
    const { bookingId } = req.body;

    //get booking details
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    
    const amount = booking.totalPrice * 100;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: "Movers & Packers Booking" },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-failed`,
    });

    //create payment entry with pending status
    const payment = new Payment({
      booking: bookingId,
      amount: booking.totalPrice,
      paymentMethod: "Card",
      status: "Pending",
      transactionId: session.id,
    });

    await payment.save();
    res.status(200).json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
