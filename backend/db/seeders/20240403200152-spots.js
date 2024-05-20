
'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
options.tableName = 'Spots';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(options, [
      {
        ownerId: 1,
        address: '123 Demo St',
        city: 'Demo City',
        state: 'DC',
        country: 'USA',
        lat: 37.7749,
        lng: -122.4194,
        name: 'Demo Spot',
        description: 'This is a demo spot.',
        price: 123.45,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['Demo Spot'] }
    }, {});
  }
};
