'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const reviewImages = [

      {
        reviewId: 1,
        url: 'http://example.com/review-image-1.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        reviewId: 2,
        url: 'http://example.com/review-image-2.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },{
        reviewId: 3,
        url: 'http://example.com/review-image-3.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },{
        reviewId: 4,
        url: 'http://example.com/review-image-4.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },{
        reviewId: 5,
        url: 'http://example.com/review-image-5.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

    ];
    await queryInterface.bulkInsert('ReviewImages', reviewImages, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ReviewImages', null, {});
  }
};
