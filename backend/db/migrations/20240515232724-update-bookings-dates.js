// backend/db/migrations/20240515232724-update-bookings-dates.js
'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
options.tableName = "Bookings";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable(options);

    if (!tableDescription.startDate) {
      await queryInterface.addColumn(options, 'startDate', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
    }

    if (!tableDescription.endDate) {
      await queryInterface.addColumn(options, 'endDate', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable(options);

    if (tableDescription.startDate) {
      await queryInterface.removeColumn(options, 'startDate');
    }

    if (tableDescription.endDate) {
      await queryInterface.removeColumn(options, 'endDate');
    }
  }
};
