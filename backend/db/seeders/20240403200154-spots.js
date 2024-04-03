'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const spots = [

      {
        ownerId: 1,
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        country: 'USA',
        lat: 34.0522,
        lng: -118.2437,
        name: 'Lovely Spot',
        description: 'A lovely spot to stay.',
        price: 125.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ownerId: 1,
        address: '456 Second St',
        city: 'Beachside',
        state: 'FL',
        country: 'USA',
        lat: 27.9944024,
        lng: -81.7602544,
        name: 'Beachfront Haven',
        description: 'Step out onto the sand from your front door.',
        price: 200.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        ownerId: 2,
        address: '789 Mountain Rd',
        city: 'Hilltop',
        state: 'CO',
        country: 'USA',
        lat: 39.5500507,
        lng: -105.7820674,
        name: 'Mountain Retreat',
        description: 'Enjoy the breathtaking mountain views.',
        price: 300.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        ownerId: 2,
        address: '101 Lakeview Circle',
        city: 'Lakeside',
        state: 'MI',
        country: 'USA',
        lat: 42.032974,
        lng: -86.513687,
        name: 'Lakeside Lounge',
        description: 'Cozy up in this tranquil lakeside home.',
        price: 150.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        ownerId: 3,
        address: '202 Suburb St',
        city: 'Quietville',
        state: 'TX',
        country: 'USA',
        lat: 31.9685988,
        lng: -99.9018131,
        name: 'Suburban Escape',
        description: 'A quiet and cozy house in the suburbs.',
        price: 100.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    await queryInterface.bulkInsert('Spots', spots, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Spots', null, {});
  }
};
