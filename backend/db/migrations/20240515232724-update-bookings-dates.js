'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Bookings', 'startDate', {
      type: Sequelize.DATEONLY,
      allowNull: false,
    });
    await queryInterface.changeColumn('Bookings', 'endDate', {
      type: Sequelize.DATEONLY,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Bookings', 'startDate', {
      type: Sequelize.DATETIME,
      allowNull: false,
    });
    await queryInterface.changeColumn('Bookings', 'endDate', {
      type: Sequelize.DATETIME,
      allowNull: false,
    });
  }
};
