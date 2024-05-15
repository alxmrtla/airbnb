const express = require("express");
const router = express.Router();
const {
  Spot,
  SpotImage,
  Review,
  User,
  ReviewImage,
  sequelize,
  Booking,
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

const validateReview = [
  check("review").notEmpty().withMessage("Review text is required"),
  check("stars")
    .isInt({ min: 1, max: 5 })
    .withMessage("Stars must be an integer from 1 to 5"),
];

// GET /api/spots/current - Get all spots owned by the current user
router.get("/current", requireAuth, async (req, res) => {
  const userId = req.user.id;

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
        const spotData = spot.get({ plain: true });
        spotData.avgRating = spotData.avgRating ? parseFloat(spotData.avgRating).toFixed(1) : null;
        return spotData;
      }),
    });
  } catch (error) {
    console.error("Error fetching user's spots:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// GET /api/spots/:spotId - Get details of a spot by id
router.get('/:spotId', async (req, res) => {
  const spotId = req.params.spotId;

  try {
    const spot = await Spot.findByPk(spotId, {
      include: [
        { model: User, as: 'Owner', attributes: ['id', 'username', 'email'] },
        { model: SpotImage, attributes: ['id', 'url', 'preview'] },
        { model: Review, attributes: ['id', 'review', 'stars', 'userId', 'createdAt', 'updatedAt'] }
      ]
    });

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    res.status(200).json(spot);
  } catch (error) {
    console.error('Error fetching spot details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/spots - Create a new spot
router.post("/", [requireAuth, validateSpot], async (req, res) => {
  const { address, city, state, country, lat, lng, name, description, price } = req.body;
  const ownerId = req.user.id;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
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



// PUT /api/spots/:spotId - Update a spot by id
router.put('/:spotId', requireAuth, async (req, res) => {
  const spotId = req.params.spotId;
  const { address, city, state, country, lat, lng, name, description, price } = req.body;

  try {
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    console.log('Update data:', { address, city, state, country, lat, lng, name, description, price });
    console.log('Current spot data before update:', spot.toJSON());

    // Updating the spot
    const [updated] = await Spot.update(
      { address, city, state, country, lat, lng, name, description, price },
      { where: { id: spotId } }
    );

    console.log('Number of rows updated:', updated);

    // Fetch the updated spot data
    const updatedSpot = await Spot.findByPk(spotId);

    console.log('Updated spot data:', updatedSpot.toJSON());

    res.status(200).json({ spot: updatedSpot });
  } catch (error) {
    console.error('Error updating spot:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
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

  try {
    await spot.destroy();
    res.json({ message: "Successfully deleted" });
  } catch (error) {
    console.error("Error deleting spot:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add an Image to a Spot based on the Spot's ID
router.post("/:spotId/images", requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const { url, preview } = req.body;
  const userId = req.user.id;

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

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
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

    const booking = await Booking.create({
      spotId,
      userId,
      startDate,
      endDate,
    });

    res.status(200).json(booking);
  }
);

// GET /api/spots/:spotId/reviews - Get all reviews for a spot
router.get("/:spotId/reviews", async (req, res) => {
  const { spotId } = req.params;

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

// POST /api/spots/:spotId/reviews - Create a review for a spot
router.post('/:spotId/reviews', [requireAuth, validateReview], async (req, res) => {
  const { spotId } = req.params;
  const { review, stars } = req.body;
  const userId = req.user.id;

  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Bad Request", errors: errors.array() });
  }

  // Check if the spot exists
  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

  // Check if the user has already reviewed this spot
  const existingReview = await Review.findOne({
    where: { userId, spotId },
  });
  if (existingReview) {
    return res.status(500).json({ message: "User already has a review for this spot" });
  }

  // Create the review
  try {
    const newReview = await Review.create({
      userId,
      spotId,
      review,
      stars,
    });

    res.status(201).json(newReview);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
