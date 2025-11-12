const Payment = require("../models/paymentModel");

//create payment
exports.createPayment = async (req, res) => {
  try {
    const { booking, amount, paymentMethod, status } = req.body;
    const payment = new Payment({ booking, amount, paymentMethod, status });
    await payment.save();
    res.status(200).json({ message: "success", payment });
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
