// backend/db/models/reviewimage.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const ReviewImage = sequelize.define('ReviewImage', {
    reviewId: DataTypes.INTEGER,
    url: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ReviewImage',
  });

  ReviewImage.associate = function(models) {
    // Define association here
    ReviewImage.belongsTo(models.Review, {foreignKey: 'reviewId'});
  };

  return ReviewImage;
};
