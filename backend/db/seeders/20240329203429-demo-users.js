'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // specify schema if in production
}
options.tableName = 'Users'; // Add this line to ensure table name is correctly specified

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('Starting to insert demo users...');
    await queryInterface.bulkInsert(options, [
      {
        username: 'DemoUser',
        email: 'demo@user.io',
        hashedPassword: 'password',
        firstName: 'Demo',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'FakeUser1',
        email: 'fakeuser1@user.io',
        hashedPassword: 'password',
        firstName: 'Fake',
        lastName: 'User1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'FakeUser2',
        email: 'fakeuser2@user.io',
        hashedPassword: 'password',
        firstName: 'Fake',
        lastName: 'User2',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
    console.log('Finished inserting demo users.');
  },

  down: async (queryInterface, Sequelize) => {
    console.log('Starting to delete demo users...');
    await queryInterface.bulkDelete(options, null, {});
    console.log('Finished deleting demo users.');
  }
};
