const Service = require("../models/serviceModel");

exports.createService = async (req, res) => {
  try {
    const { title, description, price, availableLocations,availability } = req.body;
    const service = new Service({
      title,
      description,
      price,
      availableLocations,
      availability,
      provider: req.user._id,
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
    const services = await Service.find({ isDeleted: false }).populate("provider", "name email");
    return res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get only provider's own services
exports.getProviderServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user.id,isDeleted: false });
    return res.status(200).json(services);
  } catch (error) {
    return res.status(500).json({ message: error.message });
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

// Update service
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find the service first
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Check ownership for providers
    if (req.user.role === "provider" && service.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied: cannot update this service" });
    }

    // Apply updates
    Object.assign(service, updates); // merge updates into service
    await service.save();

    return res.status(200).json({ message: "Service updated successfully", service });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


//delete
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    if (
      req.user.role === "provider" &&
      service.provider.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }
     // ❗ Soft delete instead of hard delete
    service.isDeleted = true;
    await service.save();
    return res.status(200).json({ message: "service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
