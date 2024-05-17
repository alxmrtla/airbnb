'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
options.tableName = 'Bookings';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(options, [
      {
        userId: 1,
        spotId: 1,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 3)),
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
