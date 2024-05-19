'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createSchema(process.env.SCHEMA).catch(() => {});

    const table = { tableName: 'Bookings', schema: process.env.SCHEMA };

    const tableDescription = await queryInterface.describeTable(table);

    if (!tableDescription.startDate) {
      await queryInterface.addColumn(
        table,
        'startDate',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      );
    }

    if (!tableDescription.endDate) {
      await queryInterface.addColumn(
        table,
        'endDate',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = { tableName: 'Bookings', schema: process.env.SCHEMA };

    const tableDescription = await queryInterface.describeTable(table);

    if (tableDescription.startDate) {
      await queryInterface.removeColumn(table, 'startDate');
    }

    if (tableDescription.endDate) {
      await queryInterface.removeColumn(table, 'endDate');
    }
  }
};
