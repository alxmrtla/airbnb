// GET /api/reviews/current
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../utils/auth");
const { Review, User, Spot, ReviewImage } = require("../../db/models");
const { check } = require('express-validator');


// GET /api/reviews/current - Get all reviews by the current user
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
        },
        {
          model: ReviewImage,
          attributes: ["id", "url"],
        },
      ],
    });

    res.status(200).json({ Reviews: reviews });
  } catch (error) {
    console.error("Error fetching user's reviews:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Validation checks
const validateReview = [
  check("review").notEmpty().withMessage("Review text is required"),
  check("stars")
    .isInt({ min: 1, max: 5 })
    .withMessage("Stars must be an integer from 1 to 5"),
];

// POST /api/spots/:spotId/reviews - Create a new review for a spot
router.post(
  "/:spotId/reviews",
  [requireAuth, validateReview],
  async (req, res) => {
    const { spotId } = req.params;
    const { review, stars } = req.body;
    const userId = req.user.id;

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "Bad Request", errors: errors.array() });
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
      return res
        .status(500)
        .json({ message: "User already has a review for this spot" });
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
  }
);

// POST /api/reviews/:reviewId/images - Add an image to a review
router.post("/:reviewId/images", requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const { url } = req.body;
  const userId = req.user.id;

  // Check if the review exists and belongs to the current user
  const review = await Review.findByPk(reviewId);
  if (!review) {
    return res.status(404).json({ message: "Review couldn't be found" });
  }
  if (review.userId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // Check the number of images already associated with the review
  const imagesCount = await ReviewImage.count({
    where: { reviewId },
  });
  if (imagesCount >= 10) {
    return res
      .status(403)
      .json({
        message: "Maximum number of images for this resource was reached",
      });
  }

  // Create the review image
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

  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({
        message: "Bad Request",
        errors: errors.array().map((e) => e.msg),
      });
  }

  // Find the review
  const existingReview = await Review.findByPk(reviewId);
  if (!existingReview) {
    return res.status(404).json({ message: "Review couldn't be found" });
  }
  if (existingReview.userId !== userId) {
    return res.status(403).json({ message: "Forbidden" }); // review does not belong to the current user
  }

  // Update review
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
    return res.status(403).json({ message: "Forbidden" }); // The review does not belong to current user
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
