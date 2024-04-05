const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { ReviewImage, Review } = require('../../db/models');

const router = express.Router();

// DELETE /api/review-images/:imageId - Delete an existing review image
router.delete('/:imageId', requireAuth, async (req, res) => {
    const { imageId } = req.params;
    const userId = req.user.id;

    // Find the review image
    const reviewImage = await ReviewImage.findByPk(imageId, {
        include: {
            model: Review,
            attributes: ['userId'] // Only fetch userId to check review ownership
        }
    });

    if (!reviewImage) {
        return res.status(404).json({ message: "Review Image couldn't be found" });
    }

    // Ensure the review belongs to the current user
    if (reviewImage.Review.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
    }

    // Delete review image
    await reviewImage.destroy();

    res.json({ message: "Successfully deleted" });
});

module.exports = router;
