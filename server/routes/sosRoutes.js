const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  createSOS,
  getAllSOS,
  updateSOSStatus,
  getMySOS,
  getNearbySOS,
  uploadAudio
} = require("../controllers/sosController");

const { validateSOS } = require("../middleware/validateSOS");
const { protect, authorize } = require("../middleware/authMiddleware");

//create SOS
router.post(
  "/",
  protect,
  validateSOS,
  createSOS
);

//get user SOS
router.get(
  "/my",
  protect,
  getMySOS
);

//get nearby SOS(police || admin)
router.get(
  "/nearby",
  protect,
  authorize("police", "admin"),
  getNearbySOS
);

//get all SOS(police||admin)
router.get(
  "/",
  protect,
  authorize("police", "admin"),
  getAllSOS
);

//update SOS status(admin || police)
router.put(
  "/:id/status",
  protect,
  authorize("police", "admin"),
  updateSOSStatus
);

router.post(
  "/:dispatchId/upload-audio",
  protect,
  upload.single("audio"),
  uploadAudio
);

module.exports = router;
