'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
options.tableName = 'Bookings';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(options.tableName, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'Users',
            schema: options.schema
          },
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      spotId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'Spots',
            schema: options.schema
          },
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      startDate: {
        allowNull: false,
        type: Sequelize.DATE
      },
      endDate: {
        allowNull: false,
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, options);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(options);
  }
};
