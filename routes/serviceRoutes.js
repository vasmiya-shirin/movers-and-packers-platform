const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const { authUser } = require("../middlewares/auth");
const { checkRole } = require("../middlewares/roleCheck");

router.post(
  "/",
  authUser,
  checkRole(["provider"]),
  serviceController.createService
);
router.get("/", serviceController.getServices);
// GET /my-services -> only provider's own services
router.get("/my-services", authUser, checkRole(["provider"]), serviceController.getProviderServices);

router.get("/:id", serviceController.getServiceById);
router.put(
  "/:id",
  authUser,
  checkRole(["provider", "admin"]),
  serviceController.updateService
);
router.delete(
  "/:id",
  authUser,
  checkRole(["provider", "admin"]),
  serviceController.deleteService
);

module.exports = router;
