'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      { tableName: 'Bookings', schema: process.env.SCHEMA },
      'startDate',
      {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    );

    await queryInterface.addColumn(
      { tableName: 'Bookings', schema: process.env.SCHEMA },
      'endDate',
      {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      { tableName: 'Bookings', schema: process.env.SCHEMA },
      'startDate'
    );

    await queryInterface.removeColumn(
      { tableName: 'Bookings', schema: process.env.SCHEMA },
      'endDate'
    );
  }
};
