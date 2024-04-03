'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const reviews = [
      // Sample reviews
      {
        spotId: 1,
        userId: 1,
        review: 'The best place to stay!',
        stars: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        spotId: 2,
        userId: 3,
        review: 'Bad place to stay!',
        stars: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        spotId: 3,
        userId: 2,
        review: 'Semi-bad place to stay!',
        stars: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },{
        spotId: 4,
        userId: 5,
        review: 'Mediocre place to stay!',
        stars: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },{
        spotId: 5,
        userId: 4,
        review: 'Good place to stay!',
        stars: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    await queryInterface.bulkInsert('Reviews', reviews, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Reviews', null, {});
  }
};
