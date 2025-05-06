// index.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();
const sequelize = require('./db');
const User = require('./models/User');
const PORT = process.env.PORT || 3000;
const cors = require('cors');

// Configurar sesión
app.use(session({
  secret: 'secreto-random',
  resave: false,
  saveUninitialized: true
}));

// Inicializar passport
app.use(passport.initialize());
app.use(passport.session());

// Configurar estrategia de Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      const [user, created] = await User.findOrCreate({
        where: { googleId: profile.id },
        defaults: {
          displayName: profile.displayName,
          email: profile.emails[0].value
        }
      });

      // Si el usuario ya existía, forzamos la actualización del updatedAt
    if (!created) {
      console.log("Antes:", user.updatedAt);
      user.set({ updatedAt: new Date() });
      user.changed('updatedAt', true); // fuerza el cambio
      await user.save();
      console.log("Después:", user.updatedAt);
    }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// Serializar y deserializar usuario
// Serializamos solo el ID
passport.serializeUser((user, done) => done(null, user.id));

// Buscamos al usuario por ID al deserializar
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Rutas
app.get('/', (req, res) => {
  res.send(`<a href="/auth/google">Iniciar sesión con Google</a>`);
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    //res.send(`Hola, ${req.user.displayName}! <a href="/logout">Salir</a>`);
	res.redirect('http://localhost:3001');
  }
);

app.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) {
      console.error('Error al cerrar sesión:', err);
	return res.redirect('http://localhost:3001'); // por si falla
    }
    //res.redirect('https://accounts.google.com/Logout');
	res.redirect('https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://localhost:3001');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  //res.redirect('/');
  res.redirect('http://localhost:3001');
}

app.get('/dashboard', isLoggedIn, (req, res) => {
  res.send(`Bienvenido a tu dashboard, ${req.user.displayName} (${req.user.email})`);
});

sequelize.authenticate()
  .then(() => {
    console.log("✅ Conexión exitosa con la base de datos");

    if (process.env.NODE_ENV === 'development') {
      console.log("🔁 Entorno de desarrollo: sincronizando base de datos...");
      return sequelize.sync({ alter: false });
    } else {
      console.log("🚫 Entorno de producción: omitiendo sincronización de base de datos.");
      return Promise.resolve(); // evita que falle la promesa si no hay sync
    }

  })
  .then(() => {
    console.log("🟢 Aplicación lista");
    app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
  })
  .catch(err => console.error("❌ Error durante la inicialización:", err));

//console.log("DB config:", {
//  db: process.env.DB_NAME,
//  user: process.env.DB_USER,
//  pass: process.env.DB_PASSWORD,
//  host: process.env.DB_HOST,
//});

//console.log("🚀 ¡Este es el auth-google-sso real en ejecución!");

// URL de tu frontend
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true               // cookies
}));

app.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      id: req.user.id,
      name: req.user.displayName,
      email: req.user.email
    });
  } else {
    res.status(401).json({ error: 'No autenticado' });
  }
});