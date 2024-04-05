const express = require("express");
const { requireAuth } = require("../../utils/auth");
const { SpotImage, Spot } = require("../../db/models");

const router = express.Router();

// DELETE /api/spot-images/:imageId - Delete an existing spot image
router.delete("/:imageId", requireAuth, async (req, res) => {
  const { imageId } = req.params;
  const userId = req.user.id;

  // Find the spot image
  const spotImage = await SpotImage.findByPk(imageId, {
    include: {
      model: Spot,
      attributes: ["ownerId"], // Only fetch ownerId to check spot ownership
    },
  });

  if (!spotImage) {
    return res.status(404).json({ message: "Spot Image couldn't be found" });
  }

  // Ensure the spot belongs to the current user
  if (spotImage.Spot.ownerId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // Delete spot image
  await spotImage.destroy();

  res.json({ message: "Successfully deleted" });
});

module.exports = router;
