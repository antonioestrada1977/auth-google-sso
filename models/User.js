// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
  googleId: {
    type: DataTypes.STRING,
    unique: true,
  },
  displayName: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    unique: true,
  },
}, {
  timestamps: true,
});

module.exports = User;
