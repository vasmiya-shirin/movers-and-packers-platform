const { connect } = require("mongoose");
const Service = require("../models/serviceModel");

exports.createService = async (req, res) => {
  try {
    const { title, description, price, availableLocations } = req.body;
    const service = new Service({
      title,
      description,
      price,
      availableLocations,
      provider: req.user.id,
    });
    await service.save();
    return res
      .status(200)
      .json({ message: "service created successfully", service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//read all
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find().populate("provider", "name email");
    return res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//read one
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id).populate(
      "provider",
      "name email"
    );
    if (!service) return res.status(400).json({ message: "service not found" });
    return res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//update
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const service = await Service.findByIdAndUpdate(id, updates, { new: true });
    return res
      .status(200)
      .json({ message: "updated service successfully", service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    await Service.findByIdAndDelete(id);
    return res.status(200).json({ message: "service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
