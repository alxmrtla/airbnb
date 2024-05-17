'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createSchema(options.schema).catch(() => {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropSchema(options.schema);
  }
};
