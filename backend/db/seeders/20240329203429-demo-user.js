'use strict';
const bcrypt = require('bcryptjs');

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

    for (const user of users) {
      const [foundUser, created] = await queryInterface.rawSelect('Users', {
        where: {
          username: user.username
        }
      }, ['id']);

      if (!foundUser) {
        await queryInterface.bulkInsert('Users', [user], {});
      } else {
        await queryInterface.bulkUpdate('Users', user, { username: user.username });
      }
    }
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
