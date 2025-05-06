# 🔐 Autenticación con Google en Node.js y Sequelize

Este proyecto permite autenticar usuarios usando Google OAuth 2.0 y registrar su información en una base de datos PostgreSQL empleando Sequelize.

---

## ✅ Requisitos Previos

- Cuenta en Google Workspace
- Acceso a Google Cloud Console
- PostgreSQL instalado o accesible
- Node.js y npm instalados

---

## ⚙️ Configuración en Google Cloud Console

1. Ingresar a [https://console.cloud.google.com](https://console.cloud.google.com)
2. Crear un nuevo proyecto (ej. "auth-google-sso")
3. Ir a **APIs y servicios > Pantalla de consentimiento OAuth**:
   - Tipo de usuario: Externo
   - Nombre de la app: Registro de acceso SSO
   - Dominio autorizado: Todos
   - Correo de contacto
4. Ir a **Credenciales > Crear credenciales > ID de cliente OAuth 2.0**:
   - Tipo de aplicación: Aplicación web
   - Nombre: Auth app
   - URI de redireccionamiento autorizadas:
     - `http://localhost:3000/auth/google/callback`
     - `http://localhost:3000`
5. Copiar `Client ID` y `Client Secret`

---

## 🧩 Estructura del proyecto auth-google-sso (Backend)

auth-google-sso/

```
├── models/
│   ├── User.js
├── .env
├── db.js
├── index.js
├── package.json
└── README.md
```

---

## 🛠️ Instalar dependencias necesarias: En la ruta principal auth-google-sso

## Antes de instalar, es recomendable eliminar el archivo package.json, y ejecutar:

npm init -y

## Y luego:

npm install express passport passport-google-oauth20 express-session dotenv

---

## 🧪 Variables de Entorno (.env)

Crear un archivo `.env` con el siguiente contenido:

```env
PORT=3000

# Google OAuth
GOOGLE_CLIENT_ID=TU_CLIENT_ID
GOOGLE_CLIENT_SECRET=TU_CLIENT_SECRET
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Base de datos PostgreSQL
DB_NAME=google_auth_db
DB_USER=postgres
DB_PASSWORD=123456
DB_HOST=localhost
NODE_ENV=development

## 🗃️ Configuración de la Base de Datos

a. Creación de base de datos:

## Postgresql
CREATE DATABASE google_auth_db;

b. El modelo models/User:

``` models/User
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
  googleId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  }
});

module.exports = User;

c. Conexión a la base de datos:

```db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;

## 🗃️ Aplicación Backend (index.js)

