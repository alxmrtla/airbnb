'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ensure the schema is created
    await queryInterface.createSchema(process.env.SCHEMA).catch(() => {});

    // Check if the table already exists
    const tableMeta = await queryInterface.describeTable({ tableName: 'Users', schema: process.env.SCHEMA }).catch(() => null);
    if (tableMeta) {
      console.log('Users table already exists, skipping creation.');
      return;
    }

    // Create the table if it doesn't exist
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      hashedPassword: {
        type: Sequelize.STRING,
        allowNull: false
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
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
    }, {
      schema: process.env.SCHEMA
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users', { schema: process.env.SCHEMA });
  }
};
