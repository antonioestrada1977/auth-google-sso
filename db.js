// db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,     // ✅ Nombre de la base de datos
  process.env.DB_USER,     // ✅ Usuario
  process.env.DB_PASSWORD, // ✅ Contraseña
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;
