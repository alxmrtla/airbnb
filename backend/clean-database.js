const { sequelize } = require('./models');

const cleanDatabase = async () => {
  try {
    await sequelize.dropSchema('bnb_schema', { logging: console.log, cascade: true });
    console.log('Schema dropped successfully');
  } catch (error) {
    console.error('Error cleaning the database:', error);
  }
};

cleanDatabase();
