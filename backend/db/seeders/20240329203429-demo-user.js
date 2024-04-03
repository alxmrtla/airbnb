'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [
      {
      email: 'demo@user.io',
      username: 'DemoUser',
      firstName: 'Alex',
      lastName: 'Demoalex',
      hashedPassword: bcrypt.hashSync('password', 10),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      email: 'demosecond@user.io',
      username: 'SecondDemoUser',
      firstName: 'Alexthesecond',
      lastName: 'SecondDemoalex',
      hashedPassword: bcrypt.hashSync('password', 10),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      email: 'demothird@user.io',
      username: 'ThirdDemoUser',
      firstName: 'Alexthethird',
      lastName: 'ThirdDemoalex',
      hashedPassword: bcrypt.hashSync('password', 10),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      email: 'demofourth@user.io',
      username: 'DemoUserFourth',
      firstName: 'Alexfourth',
      lastName: 'Demoalexthefourth',
      hashedPassword: bcrypt.hashSync('password', 10),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      email: 'demofifth@user.io',
      username: 'DemoUsertheFifth',
      firstName: 'Alexfifth',
      lastName: 'Demoalexthefifth',
      hashedPassword: bcrypt.hashSync('password', 10),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};


// npx sequelize-cli seed:generate --name demo-users
// npx sequelize-cli seed:generate --name bookings
// npx sequelize-cli seed:generate --name reviews
// npx sequelize-cli seed:generate --name review-images
// npx sequelize-cli seed:generate --name spots
// npx sequelize-cli seed:generate --name spot-images
