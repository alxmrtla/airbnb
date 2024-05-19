'use strict';

const { sequelize } = require('./db/models');

const cleanDatabase = async () => {
  try {
    await sequelize.query('PRAGMA foreign_keys = OFF', null, { raw: true });
    await sequelize.drop();
    await sequelize.query('PRAGMA foreign_keys = ON', null, { raw: true });
    console.log('Database cleaned successfully');
  } catch (error) {
    console.error('Error cleaning the database:', error);
  } finally {
    await sequelize.close();
  }
};

cleanDatabase();
