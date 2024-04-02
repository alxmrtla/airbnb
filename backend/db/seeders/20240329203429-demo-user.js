'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the DemoUser already exists
    const userExists = await queryInterface.rawSelect('Users', {
      where: { username: 'DemoUser' },
    }, ['id']);

    // If the user doesn't exist, insert it
    if (!userExists) {
      await queryInterface.bulkInsert('Users', [{
        email: 'demo@user.io',
        username: 'DemoUser',
        firstName: 'Alex',
        lastName: 'Demoalex',
        hashedPassword: bcrypt.hashSync('password', 10),
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Delete the user on rollback
    await queryInterface.bulkDelete('Users', { username: ['DemoUser'] });
  }
};
