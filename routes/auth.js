// ./routes/auth.js
const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../db');
const { sendActivationEmail } = require('../services/email.services');

// SIGN UP
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await pool.query(
      'SELECT id FROM users WHERE email=$1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Електронна пошта вже існує' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const activationToken = crypto.randomUUID();

    await pool.query(
      `INSERT INTO users (username, email, password, activation_token)
       VALUES ($1, $2, $3, $4)`,
      [username, email, hashedPassword, activationToken]
    );

    await sendActivationEmail(email, activationToken);

    res.status(201).json({
      message: 'Перевірте пошту для активації акаунту'
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/activate/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const result = await pool.query(
      'SELECT id FROM users WHERE activation_token=$1',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired link'
      });
    }

    await pool.query(
      `UPDATE users
       SET is_activated=true, activation_token=NULL
       WHERE activation_token=$1`,
      [token]
    );

    // ⛔ ПОКИ НЕ РОБИ redirect (див. нижче)
    res.json({ message: 'Account activated' });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email=$1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Користувача не знайдено' });
    }

    const user = result.rows[0];

    // 🔒 ПЕРЕВІРКА АКТИВАЦІЇ
    if (!user.is_activated) {
      return res.status(403).json({
        message: 'Активуйте акаунт через email'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Невірний пароль' });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

console.log('DB:', process.env.DB_NAME);

module.exports = router;