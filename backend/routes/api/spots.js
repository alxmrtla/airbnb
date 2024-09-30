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
const { handleValidationErrors } = require("../../utils/validation");

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
    handleValidationErrors
];

const validateReview = [
  check("review").notEmpty().withMessage("Review text is required"),
  check("stars")
    .isInt({ min: 1, max: 5 })
    .withMessage("Stars must be an integer from 1 to 5"),
];

// Generalized function for validation error formatting
const formatValidationErrors = (errors) => {
  const formattedErrors = {};
  errors.array().forEach((error) => {
    formattedErrors[error.path] = error.msg;
  });
  return formattedErrors;
};


// GET /api/spots - Get all spots with optional filtering
router.get("/", async (req, res) => {
  let {
    page = 1,
    size = 20,
    minLat,
    maxLat,
    minLng,
    maxLng,
    minPrice,
    maxPrice,
  } = req.query;

  page = parseInt(page) || 1;
  size = parseInt(size) || 20;

  if (page < 1) page = 1;
  if (size < 1) size = 20;

  const errors = {};
  if (isNaN(page) || page < 1 || page > 10)
    errors.page = "Page must be between 1 and 10";
  if (isNaN(size) || size < 1 || size > 20)
    errors.size = "Size must be between 1 and 20";
  if (minLat && isNaN(parseFloat(minLat)))
    errors.minLat = "minLat must be a decimal";
  if (maxLat && isNaN(parseFloat(maxLat)))
    errors.maxLat = "maxLat must be a decimal";
  if (minLng && isNaN(parseFloat(minLng)))
    errors.minLng = "minLng must be a decimal";
  if (maxLng && isNaN(parseFloat(maxLng)))
    errors.maxLng = "maxLng must be a decimal";
  if (
    minPrice &&
    (isNaN(parseFloat(minPrice)) || parseFloat(minPrice) < 0)
  )
    errors.minPrice = "minPrice must be a decimal and greater than or equal to 0";
  if (
    maxPrice &&
    (isNaN(parseFloat(maxPrice)) || parseFloat(maxPrice) < 0)
  )
    errors.maxPrice = "maxPrice must be a decimal and greater than or equal to 0";

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: "Bad Request", errors });
  }

  const whereConditions = {
    ...(minLat && { lat: { [Op.gte]: parseFloat(minLat) } }),
    ...(maxLat && { lat: { [Op.lte]: parseFloat(maxLat) } }),
    ...(minLng && { lng: { [Op.gte]: parseFloat(minLng) } }),
    ...(maxLng && { lng: { [Op.lte]: parseFloat(maxLng) } }),
    ...(minPrice && { price: { [Op.gte]: parseFloat(minPrice) } }),
    ...(maxPrice && { price: { [Op.lte]: parseFloat(maxPrice) } }),
  };

  try {
    const spots = await Spot.findAll({
      where: whereConditions,
      include: [
        {
          model: Review,
          attributes: ["stars"],
        },
        {
          model: SpotImage,
          attributes: ["url"],
          where: {
            preview: true,
          },
          required: false,
        },
      ],
      limit: size,
      offset: (page - 1) * size,
    });

    const spotData = spots.map((spot) => {
      const spotJson = spot.toJSON();

      // Calculate the average rating manually
      const reviews = spot.Reviews || [];
      const totalStars = reviews.reduce((acc, review) => acc + review.stars, 0);
      const avgRating = reviews.length > 0
      ? parseFloat((totalStars / reviews.length).toFixed(1))
      : null;


      // Handle preview image
      const previewImage = spot.SpotImages.length > 0
        ? spot.SpotImages[0].url
        : null;

      return {
        ...spotJson,
        avgRating,
        previewImage,
      };
    });

    res.status(200).json({
      Spots: spotData,
      page,
      size,
      total: spots.length,
      totalPages: Math.ceil(spots.length / size),
    });
  } catch (error) {
    console.error("Error fetching spots:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// GET /api/spots/current - Get all spots owned by the current user
router.get("/current", requireAuth, async (req, res) => {
  const ownerId = req.user.id;

  try {
    const spots = await Spot.findAll({
      where: { ownerId },
      include: [
        {
          model: SpotImage,
          attributes: ["url"],
          where: {
            preview: true,
          },
          required: false,
        },
        {
          model: Review,
          attributes: ["stars"],
        },
      ],
    });

    if (!spots || spots.length === 0) {
      return res.status(404).json({ message: "No spots found for the current user" });
    }

    const spotData = spots.map((spot) => {
      const spotJson = spot.toJSON();

      // Calculate the average rating manually
      const reviews = spot.Reviews || [];
      const totalStars = reviews.reduce((acc, review) => acc + review.stars, 0);
      const avgRating = reviews.length > 0
        ? parseFloat((totalStars / reviews.length).toFixed(1))
        : null;

      // Handle preview image
      const previewImage = spot.SpotImages.length > 0
        ? spot.SpotImages[0].url
        : null;

      return {
        ...spotJson,
        avgRating,
        previewImage,
      };
    });

    res.status(200).json({ Spots: spotData });
  } catch (error) {
    console.error("Error fetching spots:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



// GET /api/spots/:spotId - Get details of a spot by id
router.get('/:spotId', async (req, res) => {
  const spotId = req.params.spotId;

  try {
    const spot = await Spot.findByPk(spotId, {
      include: [
        { model: User, as: 'Owner', attributes: ['id', 'firstName', 'lastName'] },
        { model: SpotImage, attributes: ['id', 'url', 'preview'] },
        { model: Review, attributes: ['id', 'review', 'stars', 'userId', 'createdAt', 'updatedAt'] }
      ]
    });

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Calculate avgRating
    const reviews = await Review.findAll({ where: { spotId } });
    const totalStars = reviews.reduce((acc, review) => acc + review.stars, 0);
    let avgRating = null;
    if (reviews.length > 0) {
      avgRating = totalStars / reviews.length;
      avgRating = avgRating % 1 === 0 ? Math.round(avgRating) : parseFloat(avgRating.toFixed(1)); // Ensure it's a number
    }

    res.status(200).json({
      ...spot.toJSON(),
      numReviews: reviews.length,
      avgRating,
      SpotImages: spot.SpotImages,
      Owner: spot.Owner
    });
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
      errors: formatValidationErrors(errors),
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

    res.status(201).json({
      ...newSpot.toJSON(),
      createdAt: newSpot.createdAt,
      updatedAt: newSpot.updatedAt
    });
  } catch (error) {
    console.error("Error creating spot:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/spots/:spotId/images - Add an Image to a Spot
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

// PUT /api/spots/:spotId - Update a spot by id
router.put("/:spotId", requireAuth, async (req, res) => {
  const spotId = parseInt(req.params.spotId);
  if (isNaN(spotId) || spotId < 1) {
    const err = new Error("Spot couldn't be found");
    err.status = 404;
    throw err;
  }
  const selectedSpot = await Spot.findByPk(spotId);
  if (!selectedSpot) {
    const err = new Error("Spot couldn't be found");
    err.status = 404;
    throw err;
  }
  if (selectedSpot.ownerId !== req.user.id) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  const payload = ({
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price,
  } = req.body);

  const err = new Error("Bad Request");
  err.errors = {};
  err.status = 400;
  if (typeof address !== "string" || address.length === 0) {
    err.errors.address = "Street address is required";
  }
  if (typeof city !== "string" || city.length === 0) {
    err.errors.city = "City is required";
  }
  if (typeof state !== "string" || state.length === 0) {
    err.errors.state = "State is required";
  }
  if (typeof country !== "string" || country.length === 0) {
    err.errors.country = "Country is required";
  }
  if (typeof lat !== "number" || lat > 90 || lat < -90) {
    err.errors.lat = "Latitude must be within -90 and 90";
  }
  if (typeof lng !== "number" || lng > 180 || lng < -180) {
    err.errors.lng = "Longitude must be within -180 and 180";
  }
  if (typeof name !== "string" || name.length > 50) {
    err.errors.name = "Name must be less than 50 characters";
  }
  if (typeof description !== "string" || description.length === 0) {
    err.errors.description = "Description is required";
  }
  if (typeof price !== "number" || price < 0) {
    err.errors.price = "Price per day must be a positive number";
  }
  if (Object.keys(err.errors).length) throw err;

  await Spot.update(payload, {
    where: {
      id: spotId,
    },
  });

  const updatedSpot = await Spot.findByPk(spotId);
  res.json(updatedSpot);
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
    res.status(200).json({ message: "Successfully deleted" });
  } catch (error) {
    console.error("Error deleting spot:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

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

    res.status(200).json({
      Reviews: reviews.map(review => ({
        ...review.toJSON(),
        User: review.User,
        ReviewImages: review.ReviewImages
      }))
    });
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

  const errors = validationResult(req);


  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Bad Request",
      errors: formatValidationErrors(errors),  // Proper error formatting
    });
  }

  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

  const existingReview = await Review.findOne({
    where: { userId, spotId },
  });
  if (existingReview) {
    return res.status(500).json({ message: "User already has a review for this spot" });
  }

  try {
    const newReview = await Review.create({
      userId,
      spotId,
      review,
      stars,
    });

    res.status(201).json({
      ...newReview.toJSON(),
      createdAt: newReview.createdAt,
      updatedAt: newReview.updatedAt
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/spots/:spotId/bookings - Get all bookings for a spot
router.get("/:spotId/bookings", requireAuth, async (req, res) => {
  const { spotId } = req.params;

  try {
    const spotExists = await Spot.findByPk(spotId);
    if (!spotExists) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    const bookings = await Booking.findAll({
      where: { spotId },
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    res.status(200).json({
      Bookings: bookings.map(booking => ({
        ...booking.toJSON(),
        User: booking.User
      }))
    });
  } catch (error) {
    console.error("Error fetching bookings for spot:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/spots/:spotId/bookings - Create a new booking
router.post("/:spotId/bookings", requireAuth, [
  check("startDate", "startDate cannot be in the past").isAfter(
    new Date().toISOString().split("T")[0]
  ),
  check("endDate", "endDate cannot be on or before startDate").custom(
    (value, { req }) => value > req.body.startDate
  ),
], async (req, res) => {
  const { spotId } = req.params;
  const { startDate, endDate } = req.body;
  const userId = req.user.id;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Bad Request",
      errors: formatValidationErrors(errors),
    });
  }

  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

  if (spot.ownerId === userId) {
    return res.status(403).json({ message: "Cannot book your own spot" });
  }

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

  try {
    const booking = await Booking.create({
      spotId,
      userId,
      startDate,
      endDate,
    });

    res.status(201).json({
      ...booking.toJSON(),
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
