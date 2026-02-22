const SOS = require("../models/SOS");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("../config/cloudinary");
const User = require("../models/User");

// Create SOS
exports.createSOS = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const dispatchId = "SOS-" + uuidv4();

    // Save SOS FIRST
    const newSOS = await SOS.create({
      dispatchId,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      user: req.user._id,
    });

    console.log("SOS saved:", newSOS.dispatchId);

    // Send success response immediately after save
    res.status(201).json({
      success: true,
      dispatchId,
      status: newSOS.status,
      message: "Emergency request created successfully",
    });

    // Notify police AFTER response — errors here won't affect the SOS save
    try {
      const io = req.app.get("io");

      try {
        const nearestPolice = await User.find({
          role: "police",
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
              },
              $maxDistance: 10000000000000,
            },
          },
        });

        console.log("Nearest police count:", nearestPolice.length);

        if (nearestPolice.length > 0) {
          nearestPolice.forEach((police) => {
            io.to(`user-${police._id}`).emit("newSOS", newSOS);
          });
        } else {
          io.emit("newSOS", newSOS);
        }
      } catch (geoErr) {
        console.error("Geo query failed, broadcasting to all:", geoErr.message);
        const io2 = req.app.get("io");
        io2.emit("newSOS", newSOS);
      }

      io.to(`user-${req.user.id}`).emit("mySOSUpdate", newSOS);

    } catch (notifyErr) {
      console.error("Notification error (SOS already saved):", notifyErr.message);
    }

  } catch (error) {
    console.error("CREATE SOS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get all SOS (police/admin)
exports.getAllSOS = async (req, res) => {
  try {
    const data = await SOS.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("GET ALL SOS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch data" });
  }
};

// Update SOS status
exports.updateSOSStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedSOS = await SOS.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedSOS) {
      return res.status(404).json({ success: false, message: "SOS not found" });
    }

    const io = req.app.get("io");
    io.to("police-room").emit("statusUpdated", updatedSOS);
    io.to(`user-${updatedSOS.user}`).emit("statusUpdated", updatedSOS);

    res.json({
      success: true,
      message: "Status updated successfully",
      data: updatedSOS,
    });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get my SOS (user)
exports.getMySOS = async (req, res) => {
  try {
    const mySOS = await SOS.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: mySOS.length,
      data: mySOS,
    });
  } catch (error) {
    console.error("GET MY SOS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user SOS" });
  }
};

// Get nearby SOS
exports.getNearbySOS = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng || !radius) {
      return res.status(400).json({ success: false, message: "lat, lng and radius are required" });
    }

    const nearbySOS = await SOS.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius),
        },
      },
    });

    res.json({ success: true, count: nearbySOS.length, data: nearbySOS });
  } catch (error) {
    console.error("NEARBY SOS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch nearby SOS" });
  }
};

// Upload audio
exports.uploadAudio = async (req, res) => {
  try {
    const { dispatchId } = req.params;
    console.log("Upload audio hit - dispatchId:", dispatchId);

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No audio file provided" });
    }

    const sos = await SOS.findOne({ dispatchId });
    console.log("Found SOS for audio:", sos ? sos.dispatchId : "NOT FOUND");

    if (!sos) {
      return res.status(404).json({ success: false, message: "SOS not found" });
    }

    const uploadStream = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "video", folder: "sos-audio" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

    const result = await uploadStream();
    sos.audioUrl = result.secure_url;
    await sos.save();

    const io = req.app.get("io");
    io.to("police-room").emit("audioUploaded", sos);
    io.to(`user-${sos.user}`).emit("audioUploaded", sos);

    res.json({ success: true, audioUrl: sos.audioUrl });

  } catch (error) {
    console.error("UPLOAD AUDIO ERROR:", error);
    res.status(500).json({ success: false, message: "Audio upload failed" });
  }
};