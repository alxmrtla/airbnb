//backend/db/models/review.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Review belongs to a user
      Review.belongsTo(models.User, { foreignKey: 'userId' });

      // Review can have many images
      Review.hasMany(models.ReviewImage, { foreignKey: 'reviewId' });

      // Review belongs to a spot
      Review.belongsTo(models.Spot, { foreignKey: 'spotId' });
    }
  }

  Review.init({
    spotId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    review: DataTypes.TEXT,
    stars: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Review',
  });

  return Review;
};
