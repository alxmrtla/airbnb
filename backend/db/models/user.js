// backend/db/models/user.js

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { notEmpty: true }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    hashedPassword: {
      type: DataTypes.STRING.BINARY,
      allowNull: false,
      validate: { len: [60, 60] } // bcrypted passwords should be 60 chars long
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    }
  }, {
    defaultScope: {
      attributes: { exclude: ['hashedPassword', 'createdAt', 'updatedAt'] }
    },
    scopes: {
      currentUser: { attributes: { exclude: ['hashedPassword'] } },
      loginUser: { attributes: {} }
    }
  });

  User.associate = (models) => {
    // User can have many bookings
    User.hasMany(models.Booking, { foreignKey: 'userId' });

    // User can have many reviews
    User.hasMany(models.Review, { foreignKey: 'userId' });

    // User can have many spots
    User.hasMany(models.Spot, { foreignKey: 'ownerId' });
  };

  return User;
};
