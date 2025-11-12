const Booking = require("../models/bookingModel");

//create booking

exports.createBooking = async (req, res) => {
  try {
    const {
      provider,
      service,
      pickupLocation,
      dropLocation,
      date,
      totalPrice,
    } = req.body;
    const booking = new Booking({
      client: req.user.id,
      provider,
      service,
      pickupLocation,
      dropLocation,
      date,
      totalPrice,
    });
    await booking.save();
    res.status(200).json({ message: "Booking created", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get all bookings(admin only)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("client", "name email")
      .populate("provider", "name email")
      .populate("service", "title price");
    res.status(200).json({ message: "success", bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get bookings by logged-in user(client or provider)
exports.getMyBookings = async (req, res) => {
  try {
    const filter =
      req.user.role === "provider"
        ? { provider: req.iser.id }
        : { client: req.user.id };
    const bookings = await Booking.find(filter)
      .populate("service", "title price")
      .populate("provider", "name email")
      .populate("client", "name email");
    res.status(200).json({ message: "success", bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get single booking by id
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate("service")
      .populate("provider", "name email")
      .populate("client", "name email");
    if (!booking) return res.status(400).json({ message: "Booking not found" });
    res.status(200).json({ message: "success", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//update booking
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const booking = await Booking.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!booking) return res.status(400).json({ message: "Booking not found" });
    res.status(200).json({ message: "Booking updated", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete booking
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) res.status(400).json({ message: "Booking not found" });
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
