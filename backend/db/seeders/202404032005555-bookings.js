'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const bookings = [
        {
          spotId: 1,
          userId: 1,
          startDate: new Date('2024-05-01'),
          endDate: new Date('2024-05-05'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          spotId: 2,
          userId: 2,
          startDate: new Date('2024-06-10'),
          endDate: new Date('2024-06-15'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          spotId: 3,
          userId: 3,
          startDate: new Date('2024-07-01'),
          endDate: new Date('2024-07-08'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          spotId: 4,
          userId: 4,
          startDate: new Date('2024-08-15'),
          endDate: new Date('2024-08-20'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          spotId: 5,
          userId: 5,
          startDate: new Date('2024-09-05'),
          endDate: new Date('2024-09-10'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },

    ];
    await queryInterface.bulkInsert('Bookings', bookings, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Bookings', null, {});
  }
};
