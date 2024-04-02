'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    // Drop the Users table
    return queryInterface.dropTable('Users');
  },

  down: (queryInterface, Sequelize) => {
    // Logic to recreate the table, if necessary
  }
};
