'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createSchema(process.env.SCHEMA).catch(() => {});

    const existingUser = await queryInterface.rawSelect(
      { tableName: 'Users', schema: process.env.SCHEMA },
      { where: { username: 'DemoUser' } },
      ['id']
    );

    if (!existingUser) {
      await queryInterface.bulkInsert(
        { tableName: 'Users', schema: process.env.SCHEMA },
        [
          {
            username: 'DemoUser',
            email: 'demo@user.io',
            firstName: 'Demo',
            lastName: 'User',
            hashedPassword: 'hashed-password',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        {}
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(
      { tableName: 'Users', schema: process.env.SCHEMA },
      { username: 'DemoUser' },
      {}
    );
  },
};
