'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createSchema('bnb_schema');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropSchema('bnb_schema');
  }
};
