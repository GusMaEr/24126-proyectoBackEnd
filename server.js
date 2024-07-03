// server.js
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Sequelize = require('sequelize');
const app = express();
const cors = require('cors');


app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // to serve your static files

// Database configuration
const sequelize = new Sequelize("proyecto1_backend", "proyecto1", "Rec3178chI", {
  host: 'mysql-proyecto1.alwaysdata.net',
  dialect: 'mysql',
});

// Connect to the database
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to the database successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

connectDB();

// Define the User model
const User = sequelize.define('user', {
  username: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers['x-access-token'];
  if (!token) return res.status(403).send({ auth: false, message: 'No token provided.' });

  jwt.verify(token, 'your-secret-key', (err, decoded) => {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

    req.userId = decoded.id;
    next();
  });
}

// Registration route
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

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) return res.status(404).send('User not found.');

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

// Protected route
app.get('/dashboard', verifyToken, (req, res) => {
  res.status(200).send('Welcome to the dashboard!');
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});