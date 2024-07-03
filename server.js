// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Sequelize = require('sequelize');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // para servir sus archivos estáticos

// Database configuration
const sequelize = new Sequelize("proyecto1_backend", "proyecto1", "Rec3178chI", {
  host: 'mysql-proyecto1.alwaysdata.net',
  dialect: 'mysql',
});

// Connect to the database
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conectado a la base de datos');
  } catch (error) {
    console.error('No se puede conectar a la base de datos:', error);
  }
};
connectDB();

// Definir el modelo de la tabla user
const User = sequelize.define('user', {
  username: {type: Sequelize.STRING, unique: true, allowNull: false},
  password: {type: Sequelize.STRING, allowNull: false},
  createdAt: {type: Sequelize.STRING, allowNull: false},
  updatedAt: {type: Sequelize.STRING, allowNull: false},
});

// Middleware para verificar el token JWT
function verifyToken(req, res, next) {
  const token = req.headers['x-access-token'];
  if (!token) return res.status(403).send({ auth: false, message: 'No se proporciona ningun token.' });

  jwt.verify(token, 'your-secret-key', (err, decoded) => {
    if (err) return res.status(500).send({ auth: false, message: 'No se pudo autenticar el token.' });

    req.userId = decoded.id;
    next();
  });
}

// Rutas para alta de usuario
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  try {
    const user = await User.create({
      username,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user.id }, 'your-secret-key', {
      expiresIn: 86400, // expires in 24 hours
    });

    res.status(200).send({ auth: true, token });
  } catch (error) {
    res.status(500).send('There was a problem registering the user.');
  }
});

// Ruta para login 
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) return res.status(404).send('Usuario no encontrado.');

    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

    const token = jwt.sign({ id: user.id }, 'your-secret-key', {
      expiresIn: 86400, // expires in 24 hours
    });

    res.status(200).send({ auth: true, token });
  } catch (error) {
    res.status(500).send('Server error.');
  }
});

// Ruta protegida
app.get('/dashboard', verifyToken, (req, res) => {
  res.status(200).send('Bienvenido al dashboard!');
});

// Iniciar Servidor
app.listen(3000, () => {
  console.log('Server iniciado en el puerto 3000');
});
