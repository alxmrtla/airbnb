const config = require('./index');

module.exports = {
  development: {
    storage: './db/dev.db',
    dialect: 'sqlite',
    seederStorage: 'sequelize',
    logQueryParameters: true,
    typeValidation: true
  },
  test: {
    storage: ':memory:',
    dialect: 'sqlite',
    seederStorage: 'sequelize'
  },
  production: {
    storage: './db/prod.db',
    dialect: 'sqlite',
    seederStorage: 'sequelize',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    define: {
      schema: process.env.SCHEMA
    }
  }
};
