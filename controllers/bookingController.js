const Booking = require("../models/bookingModel");
const User = require("../models/userModel");
const Service = require("../models/serviceModel");

//create booking
exports.createBooking = async (req, res) => {
  try {
    const { service, pickupLocation, dropLocation, date, totalPrice } =
      req.body;

    // 1. Find service info
    const serviceData = await Service.findById(service);
    if (!serviceData) {
      return res.status(404).json({ message: "Service not found" });
    }

    // 2. Provider comes from service model (NOT frontend)
    const providerId = serviceData.provider;

    // 3. Create booking
    const booking = await Booking.create({
      client: req.user._id,
      provider: providerId,
      service,
      pickupLocation,
      dropLocation,
      date,
      totalPrice,
    });

    res.status(200).json({
      message: "Booking created successfully",
      booking,
    });
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
        ? { provider: req.user.id }
        : { client: req.user.id };
    const bookings = await Booking.find({ client: req.user._id })
  .populate("service")
  .populate("provider")
  .sort({ createdAt: -1 });
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

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Allow: Admin OR Provider who owns the booking
    if (
      req.user.role !== "admin" &&
      !(
        req.user.role === "provider" &&
        booking.provider.toString() === req.user.id
      )
    ) {
      return res.status(403).json({ message: "Not allowed to update booking" });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(id, updates, {
      new: true,
    });

    res.status(200).json({
      message: "Booking updated",
      booking: updatedBooking,
    });
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

exports.providerDashboard = async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res
        .status(403)
        .json({ message: "Access denied - Not a provider" });
    }

    const providerId = req.user.id;

    const bookings = await Booking.find({ provider: providerId })
      .populate("client", "name email")
      .populate("service", "title price");

    // Stats
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === "Pending").length;
    const completed = bookings.filter((b) => b.status === "Completed").length;
    const cancelled = bookings.filter((b) => b.status === "Cancelled").length;

    const earnings = bookings
      .filter((b) => b.status === "Completed")
      .reduce((sum, b) => sum + parseFloat(b.service?.price || 0), 0);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    let monthlyEarnings = {};
    let monthlyCounts = {};

    for (let b of bookings) {
      if (b.status !== "Completed") continue;

      const month = monthNames[new Date(b.createdAt).getMonth()];
      const amount = parseFloat(b.service?.price || 0);

      monthlyEarnings[month] = (monthlyEarnings[month] || 0) + amount;
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    }

    const earningsHistory = monthNames.map((m) => ({
      month: m,
      amount: monthlyEarnings[m] || 0,
      bookings: monthlyCounts[m] || 0,
    }));

    res.json({
      total,
      pending,
      completed,
      cancelled,
      earnings,
      bookings,
      earningsHistory,
    });
  } catch (err) {
    console.log("Provider Dashboard Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.adminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProviders = await User.countDocuments({ role: "provider" });
    const totalClients = await User.countDocuments({ role: "client" });

    const totalServices = await Service.countDocuments();

    const bookings = await Booking.find()
      .populate("client", "name email")
      .populate("provider", "name email")
      .populate("service", "title price");

    const totalBookings = bookings.length;
    const pending = bookings.filter((b) => b.status === "Pending").length;
    const completed = bookings.filter((b) => b.status === "Completed").length;
    const cancelled = bookings.filter((b) => b.status === "Cancelled").length;

    const earnings = bookings
      .filter((b) => b.status === "Completed")
      .reduce((sum, b) => sum + (b.service?.price || 0), 0);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    let monthlyEarnings = {};
    let monthlyCounts = {};

    for (let b of bookings) {
      if (b.status !== "Completed") continue;

      const month = monthNames[new Date(b.createdAt).getMonth()];
      const amount = b.service?.price || 0;

      monthlyEarnings[month] = (monthlyEarnings[month] || 0) + amount;
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    }

    const earningsHistory = monthNames.map((m) => ({
      month: m,
      amount: monthlyEarnings[m] || 0,
      bookings: monthlyCounts[m] || 0,
    }));

    res.status(200).json({
      stats: {
        totalUsers,
        totalProviders,
        totalClients,
        totalServices,
        totalBookings,
        pending,
        completed,
        cancelled,
        earnings,
      },
      earningsHistory,
      recentBookings: bookings.slice(-5).reverse(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
