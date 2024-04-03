// backend/db/models/spotimage.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const SpotImage = sequelize.define('SpotImage', {
    spotId: DataTypes.INTEGER,
    url: DataTypes.STRING,
    preview: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'SpotImage',
  });

  SpotImage.associate = function(models) {
    // Define association here
    SpotImage.belongsTo(models.Spot, {foreignKey: 'spotId'});
  };

  return SpotImage;
};
