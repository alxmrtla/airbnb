'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
options.tableName = 'Bookings';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(options, 'startDate', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    await queryInterface.addColumn(options, 'endDate', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(options, 'startDate');
    await queryInterface.removeColumn(options, 'endDate');
  }
};
