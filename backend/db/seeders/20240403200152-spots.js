'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
options.tableName = 'Spots';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(options, [
      {
        ownerId: 1,
        address: '123 Main St',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        lat: 34.0522,
        lng: -118.2437,
        name: 'Cozy Cottage',
        description: 'A cozy cottage in the heart of the city.',
        price: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['Cozy Cottage'] }
    }, {});
  }
};
