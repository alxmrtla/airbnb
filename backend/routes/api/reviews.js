const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../utils/auth");
const { Review, User, Spot, ReviewImage, SpotImage } = require("../../db/models");
const { check, validationResult } = require('express-validator');

const formatValidationErrors = (errors) => {
  const formattedErrors = {};
  errors.array().forEach((error) => {
    formattedErrors[error.path] = error.msg;
  });
  return formattedErrors;
};

router.get("/current", requireAuth, async (req, res) => {
  const userId = req.user.id;

  try {
    const reviews = await Review.findAll({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: Spot,
          attributes: [
            "id",
            "ownerId",
            "address",
            "city",
            "state",
            "country",
            "lat",
            "lng",
            "name",
            "price",
          ],
          include: [
            {
              model: SpotImage,
              attributes: ["url"],
              where: { preview: true },
              required: false // Allows for spots without preview images
            }
          ],
        },
        {
          model: ReviewImage,
          attributes: ["id", "url"],
        },
      ],
    });

    // If no reviews are found, return an appropriate message
    if (reviews.length === 0) {
      return res.status(404).json({ message: "No reviews found for the current user" });
    }

    // Format the response to match the required structure
    const formattedReviews = reviews.map((review) => {
      const spot = review.Spot.toJSON();
      const previewImage = spot.SpotImages && spot.SpotImages.length > 0
        ? spot.SpotImages[0].url
        : null;

      return {
        id: review.id,
        userId: review.userId,
        spotId: review.spotId,
        review: review.review,
        stars: review.stars,
        createdAt: review.createdAt.toISOString().split("T")[0] + " " + review.createdAt.toISOString().split("T")[1].split(".")[0],
        updatedAt: review.updatedAt.toISOString().split("T")[0] + " " + review.updatedAt.toISOString().split("T")[1].split(".")[0],
        User: review.User,
        Spot: {
          id: spot.id,
          ownerId: spot.ownerId,
          address: spot.address,
          city: spot.city,
          state: spot.state,
          country: spot.country,
          lat: spot.lat,
          lng: spot.lng,
          name: spot.name,
          price: spot.price,
          previewImage // Include the preview image
        },
        ReviewImages: review.ReviewImages
      };
    });

    res.status(200).json({ Reviews: formattedReviews });
  } catch (error) {
    console.error("Error fetching user's reviews:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Validation checks for reviews
const validateReview = [
  check("review").notEmpty().withMessage("Review text is required"),
  check("stars")
    .isInt({ min: 1, max: 5 })
    .withMessage("Stars must be an integer from 1 to 5"),
];

// POST /api/spots/:spotId/reviews - Create a new review for a spot
router.post("/:spotId/reviews", [requireAuth, validateReview], async (req, res) => {
  const { spotId } = req.params;
  const { review, stars } = req.body;
  const userId = req.user.id;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Map errors correctly to show the field name instead of 'undefined'
    const mappedErrors = errors.array().reduce((acc, error) => {
      acc[error.param] = error.msg;
      return acc;
    }, {});

    return res.status(400).json({
      message: "Bad Request",
      errors: mappedErrors,
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

    res.status(201).json(newReview);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/reviews/:reviewId/images - Add an image to a review
router.post("/:reviewId/images", requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const { url } = req.body;
  const userId = req.user.id;

  const review = await Review.findByPk(reviewId);
  if (!review) {
    return res.status(404).json({ message: "Review couldn't be found" });
  }
  if (review.userId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const imagesCount = await ReviewImage.count({
    where: { reviewId },
  });
  if (imagesCount >= 10) {
    return res.status(403).json({ message: "Maximum number of images for this resource was reached" });
  }

  try {
    const newImage = await ReviewImage.create({
      reviewId,
      url,
    });

    res.status(200).json({
      id: newImage.id,
      url: newImage.url,
    });
  } catch (error) {
    console.error("Error adding image to review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT /api/reviews/:reviewId - Update an existing review
router.put("/:reviewId", [requireAuth, validateReview], async (req, res) => {
  const { reviewId } = req.params;
  const { review, stars } = req.body;
  const userId = req.user.id;


 const errors = validationResult(req);


 if (!errors.isEmpty()) {
   return res.status(400).json({
     message: "Bad Request",
     errors: formatValidationErrors(errors)
   });
 }

  const existingReview = await Review.findByPk(reviewId);
  if (!existingReview) {
    return res.status(404).json({ message: "Review couldn't be found" });
  }
  if (existingReview.userId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    existingReview.review = review;
    existingReview.stars = stars;
    await existingReview.save();

    res.json(existingReview);
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE /api/reviews/:reviewId - Delete a review
router.delete("/:reviewId", requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.id;

  const review = await Review.findByPk(reviewId);
  if (!review) {
    return res.status(404).json({ message: "Review couldn't be found" });
  }

  if (review.userId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    await review.destroy();
    res.json({ message: "Successfully deleted" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
