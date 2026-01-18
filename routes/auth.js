// ./routes/auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../db.js';

import {
  sendActivationEmail,
  sendResetPasswordEmail,
} from '../services/email.services.js';

const router = express.Router();

/* =========================
   SIGN UP
========================= */
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
      message: 'Перевірте пошту для активації акаунту',
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

/* =========================
   ACTIVATE
========================= */
router.get('/activate/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const result = await pool.query(
      'SELECT id FROM users WHERE activation_token=$1',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    await pool.query(
      `UPDATE users
       SET is_activated=true, activation_token=NULL
       WHERE activation_token=$1`,
      [token]
    );

    res.json({ message: 'Account activated' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

/* =========================
   LOGIN
========================= */
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

    if (!user.is_activated) {
      return res.status(403).json({
        message: 'Активуйте акаунт через email',
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
        email: user.email,
      },
    });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

/* =========================
   RESET PASSWORD
========================= */
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: 'Пароль обовʼязковий',
      });
    }

    const result = await pool.query(
      `
      SELECT id FROM users
      WHERE reset_password_token = $1
        AND reset_password_expires > NOW()
      `,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: 'Посилання недійсне або застаріле',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `
      UPDATE users
      SET password = $1,
          reset_password_token = NULL,
          reset_password_expires = NULL
      WHERE id = $2
      `,
      [hashedPassword, result.rows[0].id]
    );

    res.json({
      message: 'Пароль успішно змінено',
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

/* =========================
   FORGOT PASSWORD
========================= */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    console.log('FORGOT PASSWORD EMAIL:', email);

    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    // ❗ Безпека: не кажемо, чи існує email
    if (result.rows.length === 0) {
      return res.json({
        message: 'Якщо такий email існує, ми надішлемо лист',
      });
    }

    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 хв

    await pool.query(
      `
      UPDATE users
      SET reset_password_token = $1,
          reset_password_expires = $2
      WHERE email = $3
      `,
      [token, expires, email]
    );

    // 🔥 ВАЖЛИВО: email існує ТУТ
    try {
      await sendResetPasswordEmail(email, token);
    } catch (err) {
      console.error('EMAIL ERROR:', err);
    }

    res.json({
      message: 'Якщо такий email існує, ми надішлемо лист',
    });
  } catch (e) {
    console.error('FORGOT PASSWORD ERROR:', e);
    res.status(500).json({ message: 'Server error' });
  }
});




export default router;
