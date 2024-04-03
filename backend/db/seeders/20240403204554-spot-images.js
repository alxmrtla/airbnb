'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const spotImages = [

      {
        spotId: 1,
        url: 'http://example.com/spot-image-1.jpg',
        preview: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        spotId: 2,
        url: 'http://example.com/spot-image-2.jpg',
        preview: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },{
        spotId: 3,
        url: 'http://example.com/spot-image-3.jpg',
        preview: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },{
        spotId: 4,
        url: 'http://example.com/spot-image-4.jpg',
        preview: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },{
        spotId: 5,
        url: 'http://example.com/spot-image-5.jpg',
        preview: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

    ];
    await queryInterface.bulkInsert('SpotImages', spotImages, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('SpotImages', null, {});
  }
};
