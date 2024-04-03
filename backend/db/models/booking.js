// backend/db/models/booking.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    startDate: DataTypes.DATEONLY,
    endDate: DataTypes.DATEONLY,
    spotId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Booking',
  });

  Booking.associate = function(models) {
    // Define association here
    Booking.belongsTo(models.User, { foreignKey: 'userId' });
    Booking.belongsTo(models.Spot, { foreignKey: 'spotId' });
  };

  return Booking;
};
