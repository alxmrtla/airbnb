const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../utils/auth");
const { Booking, Spot, User } = require("../../db/models");
const { check, validationResult } = require("express-validator");
const { Op } = require("sequelize");

// GET /api/spots/:spotId/bookings
router.get("/spots/:spotId/bookings", requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const spot = await sequelize.models.Spot.findByPk(spotId);

  if (!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

  let includeAttributes = ["id", "startDate", "endDate"];
  if (spot.ownerId === req.user.id) {
    includeAttributes = {
      model: sequelize.models.User,
      attributes: ["id", "firstName", "lastName"],
    };
  }

  const bookings = await Booking.findAll({
    where: { spotId },
    attributes: includeAttributes,
  });

  res.status(200).json({ Bookings: bookings });
});

router.get("/current", requireAuth, async (req, res) => {
  const userId = req.user.id;

  try {
    const bookings = await Booking.findAll({
      where: { userId },
      include: [
        {
          model: Spot,
          as: "Spot",
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
            "previewImage",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ Bookings: bookings });
  } catch (error) {
    console.error("Error fetching user's bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put(
  "/:bookingId",
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
    const { bookingId } = req.params;
    const { startDate, endDate } = req.body;
    const userId = req.user.id;

    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({
          message: "Bad Request",
          errors: errors.array().map((err) => err.msg),
        });
    }

    // Find the booking
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking couldn't be found" });
    }

    // Ensure the booking belongs to the current user
    if (booking.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Prevent editing past bookings
    if (new Date(booking.endDate) < new Date()) {
      return res
        .status(403)
        .json({ message: "Past bookings can't be modified" });
    }

    // Check for booking date conflicts
    const conflict = await Booking.findOne({
      where: {
        id: { [Op.ne]: bookingId },
        spotId: booking.spotId,
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

    // Update booking
    booking.startDate = startDate;
    booking.endDate = endDate;
    await booking.save();

    res.json(booking);
  }
);
// DELETE /api/bookings/:bookingId - Delete an existing booking
router.delete("/:bookingId", requireAuth, async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;

  // Find the booking
  const booking = await Booking.findByPk(bookingId, {
    include: {
      model: Spot,
      attributes: ["ownerId"], // Only fetch ownerId to check spot ownership
    },
  });

  if (!booking) {
    return res.status(404).json({ message: "Booking couldn't be found" });
  }

  // Ensure the booking belongs to the current user or the spot belongs to the current user
  if (booking.userId !== userId && booking.Spot.ownerId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // Prevent deleting bookings that have already started
  if (new Date(booking.startDate) <= new Date()) {
    return res
      .status(403)
      .json({ message: "Bookings that have been started can't be deleted" });
  }

  // Delete booking
  await booking.destroy();

  res.json({ message: "Successfully deleted" });
});

module.exports = router;
