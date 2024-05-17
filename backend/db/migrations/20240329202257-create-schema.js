'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createSchema(process.env.SCHEMA).catch(() => {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropSchema(process.env.SCHEMA);
  }
};
