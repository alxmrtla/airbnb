// /routes/api/spots.js

const express = require("express");
const router = express.Router();
const {
  Spot,
  SpotImage,
  Review,
  User,
  ReviewImage,
  sequelize,
} = require("../../db/models");
const { requireAuth } = require("../../utils/auth");
const { check, validationResult } = require("express-validator");
const { Op } = require("sequelize");

const validateSpot = [
  check("address").notEmpty().withMessage("Street address is required"),
  check("city").notEmpty().withMessage("City is required"),
  check("state").notEmpty().withMessage("State is required"),
  check("country").notEmpty().withMessage("Country is required"),
  check("lat")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be within -90 and 90"),
  check("lng")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be within -180 and 180"),
  check("name")
    .isLength({ max: 50 })
    .withMessage("Name must be less than 50 characters"),
  check("description").notEmpty().withMessage("Description is required"),
  check("price")
    .isFloat({ min: 0 })
    .withMessage("Price per day must be a positive number"),
];

// POST /api/spots - Create a new spot
router.post("/", [requireAuth, validateSpot], async (req, res) => {
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;
  const ownerId = req.user.id;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({
        message: "Bad Request",
        errors: errors.array().map((e) => e.msg),
      });
  }

  try {
    const newSpot = await Spot.create({
      ownerId,
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    });

    res.status(201).json(newSpot);
  } catch (error) {
    console.error("Error creating spot:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/spots - Get all spots
router.get("/", async (req, res) => {
  try {
    const spots = await Spot.findAll({
      include: [
        {
          model: Review,
          attributes: [],
        },
        {
          model: SpotImage,
          attributes: [],
          where: {
            preview: true,
          },
          required: false,
        },
      ],
      attributes: {
        include: [
          [sequelize.fn("AVG", sequelize.col("Reviews.stars")), "avgRating"],
          [sequelize.col("SpotImages.url"), "previewImage"],
        ],
      },
      group: ["Spot.id", "SpotImages.id"],
    });

    res.status(200).json({ Spots: spots });
  } catch (error) {
    console.error("Error fetching spots:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/spots/current - Get all spots owned by the current user
router.get("/current", requireAuth, async (req, res) => {
  const userId = req.user.id; // Assuming req.user.id contains the current user's ID

  try {
    const spots = await Spot.findAll({
      where: { ownerId: userId },
      include: [
        {
          model: Review,
          attributes: [],
        },
      ],
      attributes: {
        include: [
          [sequelize.fn("AVG", sequelize.col("Reviews.stars")), "avgRating"],
        ],
        exclude: ["createdAt", "updatedAt"],
      },
      group: ["Spot.id"],
    });

    res.status(200).json({
      Spots: spots.map((spot) => {
        return {
          ...spot.get({ plain: true }),
          avgRating: parseFloat(spot.avgRating).toFixed(1),
        };
      }),
    });
  } catch (error) {
    console.error("Error fetching user's spots:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:spotId", requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const spot = await Spot.findByPk(spotId);

  if (!spot) {
    return res.status(404).json({ message: "Spot not found" });
  }

  if (spot.ownerId !== req.user.id) {
    return res
      .status(403)
      .json({ message: "You don't have permission to modify this spot" });
  }

  // Update spot
  // ...

  return res.json({ spot });
});

// DELETE /api/spots/:spotId - Delete an existing spot
router.delete("/:spotId", requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const userId = req.user.id;

  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

  if (spot.ownerId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // Proceed with deletion
  try {
    await spot.destroy();
    res.json({ message: "Successfully deleted" });
  } catch (error) {
    console.error("Error deleting spot:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/current", requireAuth, async (req, res) => {
  const spots = await Spot.findAll({
    where: { ownerId: req.user.id },
  });

  res.json({ Spots: spots });
});

router.get("/:spotId", async (req, res) => {
  const { spotId } = req.params;

  const spot = await Spot.findByPk(spotId, {
    include: [
      {
        model: SpotImage,
        attributes: ["id", "url", "preview"],
      },
      {
        model: User,
        as: "Owner",
        attributes: ["id", "firstName", "lastName"],
      },
    ],
  });

  if (!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }
  const reviews = await Review.findAll({
    where: { spotId },
    attributes: [
      [sequelize.fn("AVG", sequelize.col("stars")), "avgStarRating"],
      [sequelize.fn("COUNT", sequelize.col("id")), "numReviews"],
    ],
    raw: true,
  });

  const spotDetails = spot.toJSON();
  spotDetails.SpotImages = spot.SpotImages;
  spotDetails.Owner = spot.Owner;
  if (reviews.length > 0) {
    spotDetails.avgStarRating = parseFloat(reviews[0].avgStarRating).toFixed(1);
    spotDetails.numReviews = parseInt(reviews[0].numReviews, 10);
  } else {
    spotDetails.avgStarRating = "No ratings yet";
    spotDetails.numReviews = 0;
  }

  res.json(spotDetails);
});

//Add an Image to a Spot based on the Spot's ID
router.post("/:spotId/images", requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const { url, preview } = req.body;
  const userId = req.user.id;

  // Verify the spot exists and belongs to the current user
  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }
  if (spot.ownerId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const newImage = await SpotImage.create({
      spotId,
      url,
      preview,
    });

    res.json({
      id: newImage.id,
      url: newImage.url,
      preview: newImage.preview,
    });
  } catch (error) {
    console.error("Error adding image to spot:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Edit spot
// Validation checks for updating a spot
const validateSpotUpdate = [
  check("address").notEmpty().withMessage("Street address is required"),
  check("city").notEmpty().withMessage("City is required"),
  check("state").notEmpty().withMessage("State is required"),
  check("country").notEmpty().withMessage("Country is required"),
  check("lat")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be within -90 and 90"),
  check("lng")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be within -180 and 180"),
  check("name")
    .isLength({ max: 50 })
    .withMessage("Name must be less than 50 characters"),
  check("description").notEmpty().withMessage("Description is required"),
  check("price")
    .isFloat({ min: 0 })
    .withMessage("Price per day must be a positive number"),
];

// PUT /api/spots/:spotId - Update an existing spot
router.put("/:spotId", [requireAuth, validateSpotUpdate], async (req, res) => {
  const { spotId } = req.params;
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;
  const userId = req.user.id;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: "Bad Request", errors: errors.mapped() });
  }

  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }
  if (spot.ownerId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // Update the spot
  try {
    spot.set({
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    });
    await spot.save();

    res.json(spot);
  } catch (error) {
    console.error("Error updating spot:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/spots/:spotId/bookings - Get all bookings for a spot by its ID
router.get("/:spotId/bookings", requireAuth, async (req, res) => {
  const { spotId } = req.params;

  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

  if (spot.ownerId === req.user.id) {
    // If the user is the owner of the spot, include User details in the bookings
    const bookings = await Booking.findAll({
      where: { spotId },
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    return res.json({ Bookings: bookings });
  } else {
    // If the user is not the owner, return limited booking details
    const bookings = await Booking.findAll({
      where: { spotId },
      attributes: ["spotId", "startDate", "endDate"],
    });

    return res.json({ Bookings: bookings });
  }
});
// POST /api/spots/:spotId/bookings - Create a new booking
router.post(
  "/:spotId/bookings",
  requireAuth,
  [
    check("startDate", "startDate cannot be in the past").isAfter(
      new Date().toISOString().split("T")[0]
    ),
    check("endDate", "endDate cannot be on or before startDate").custom(
      (value, { req }) => value > req.body.startDate
    ),
  ],
  async (req, res) => {
    const { spotId } = req.params;
    const { startDate, endDate } = req.body;
    const userId = req.user.id;

    // Validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({
          message: "Bad Request",
          errors: errors
            .array()
            .reduce((acc, err) => ({ ...acc, [err.param]: err.msg }), {}),
        });
    }

    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId === userId) {
      return res.status(403).json({ message: "Cannot book your own spot" });
    }

    // Check for booking conflicts
    const conflict = await Booking.findOne({
      where: {
        spotId,
        [Op.or]: [
          { startDate: { [Op.between]: [startDate, endDate] } },
          { endDate: { [Op.between]: [startDate, endDate] } },
        ],
      },
    });

    if (conflict) {
      return res.status(403).json({
        message: "Sorry, this spot is already booked for the specified dates",
        errors: {
          startDate: "Start date conflicts with an existing booking",
          endDate: "End date conflicts with an existing booking",
        },
      });
    }

    // Create booking
    const booking = await Booking.create({
      spotId,
      userId,
      startDate,
      endDate,
    });

    res.status(200).json(booking);
  }
);

// GET /api/spots - Get all spots with optional filtering
router.get("/", async (req, res) => {
  // Default values
  let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } =
    req.query;
  page = parseInt(page) || 1;
  size = parseInt(size) || 20;

  // Validate page and size
  if (page < 1 || page > 10 || size < 1 || size > 20) {
    return res.status(400).json({
      message: "Bad Request",
      errors: {
        page: "Page must be between 1 and 10",
        size: "Size must be between 1 and 20",
      },
    });
  }

  // Build where conditions based on query parameters
  const whereConditions = {
    ...(minLat && { lat: { [Op.gte]: parseFloat(minLat) } }),
    ...(maxLat && { lat: { [Op.lte]: parseFloat(maxLat) } }),
    ...(minLng && { lng: { [Op.gte]: parseFloat(minLng) } }),
    ...(maxLng && { lng: { [Op.lte]: parseFloat(maxLng) } }),
    ...(minPrice && { price: { [Op.gte]: parseFloat(minPrice) } }),
    ...(maxPrice && { price: { [Op.lte]: parseFloat(maxPrice) } }),
  };

  try {
    const { count, rows } = await Spot.findAndCountAll({
      where: whereConditions,
      limit: size,
      offset: (page - 1) * size,
      // Include additional attributes or associations here if necessary
    });

    res.status(200).json({
      Spots: rows,
      page,
      size,
      total: count,
      totalPages: Math.ceil(count / size),
    });
  } catch (error) {
    console.error("Error fetching spots:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// GET /api/spots/:spotId/reviews - Get all reviews for a spot
router.get("/:spotId/reviews", async (req, res) => {
  const { spotId } = req.params;

  // Check if the spot exists
  const spotExists = await Spot.findByPk(spotId);
  if (!spotExists) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

  try {
    const reviews = await Review.findAll({
      where: { spotId },
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: ReviewImage,
          attributes: ["id", "url"],
        },
      ],
    });

    res.status(200).json({ Reviews: reviews });
  } catch (error) {
    console.error("Error fetching reviews for spot:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
