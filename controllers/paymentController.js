const Payment = require("../models/paymentModel");
const Booking = require("../models/bookingModel");
//create payment
exports.createPayment = async (req, res) => {
  try {
    const { booking, amount, paymentMethod } = req.body;

    // Save payment
    const payment = await Payment.create({
      booking,
      amount,
      paymentMethod,
      status: "Completed",
    });

    // Update booking payment status
    await Booking.findByIdAndUpdate(booking, {
      paymentStatus: "Paid",
    });

    res.status(200).json({ message: "Payment successful", payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//get all payments
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("booking");
    res.status(200).json({ message: "success", payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getBookingBySession = async (req, res) => {
  try {
    const { session_id } = req.params;

    const payment = await Payment.findOne({ transactionId: session_id }).populate({
      path: "booking",
      populate: { path: "provider service" },
    });

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    const booking = payment.booking.toObject();

    // Return actual paymentStatus from DB
    booking.paymentStatus = booking.paymentStatus || "Unpaid";

    res.status(200).json({ booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


//get single paymentdetails
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id).populate("booking");
    if (!payment) return res.status(400).json({ message: "Payment not found" });
    res.status(200).json({ message: "success", payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//update payment details
exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const payment = await Payment.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json({ message: "success", payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete payment
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    await Payment.findByIdAndDelete(id);
    res.status(200).json({ message: "Payment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
