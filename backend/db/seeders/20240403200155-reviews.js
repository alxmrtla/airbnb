'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
options.tableName = 'Reviews';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(options, [
      {
        userId: 1,
        spotId: 1,
        review: 'Great place to stay!',
        stars: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      userId: { [Op.eq]: 1 },
      spotId: { [Op.eq]: 1 }
    }, {});
  }
};
