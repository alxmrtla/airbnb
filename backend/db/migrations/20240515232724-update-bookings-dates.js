'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createSchema(process.env.SCHEMA).catch(() => {});

    const table = await queryInterface.describeTable({ tableName: 'Bookings', schema: process.env.SCHEMA });

    if (!table.startDate) {
      await queryInterface.addColumn(
        { tableName: 'Bookings', schema: process.env.SCHEMA },
        'startDate',
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      );
    }

    if (!table.endDate) {
      await queryInterface.addColumn(
        { tableName: 'Bookings', schema: process.env.SCHEMA },
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
    const table = await queryInterface.describeTable({ tableName: 'Bookings', schema: process.env.SCHEMA });

    if (table.startDate) {
      await queryInterface.removeColumn(
        { tableName: 'Bookings', schema: process.env.SCHEMA },
        'startDate'
      );
    }

    if (table.endDate) {
      await queryInterface.removeColumn(
        { tableName: 'Bookings', schema: process.env.SCHEMA },
        'endDate'
      );
    }
  }
};
