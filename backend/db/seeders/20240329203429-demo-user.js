'use strict';
const bcrypt = require('bcryptjs');
const { User } = require('../models'); // Ensure that the path to your models is correct

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = [
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
    ];

    await User.bulkCreate(users, {
      updateOnDuplicate: ['email', 'firstName', 'lastName', 'hashedPassword', 'updatedAt']
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', {
      username: [
        'DemoUser',
        'SecondDemoUser',
        'ThirdDemoUser',
        'DemoUserFourth',
        'DemoUsertheFifth'
      ]
    }, {});
  }
};
