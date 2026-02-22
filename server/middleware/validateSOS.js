const { body, validationResult } = require("express-validator");

exports.validateSOS = [
  body("latitude")
    .notEmpty().withMessage("Latitude is required")
    .isFloat({ min: -90, max: 90 }).withMessage("Latitude must be between -90 and 90"),

  body("longitude")
    .notEmpty().withMessage("Longitude is required")
    .isFloat({ min: -180, max: 180 }).withMessage("Longitude must be between -180 and 180"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    next();
  }
];