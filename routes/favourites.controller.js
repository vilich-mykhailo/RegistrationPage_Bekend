// routes/favourites.controller.js
import pool from "../db.js";

/* GET favourites */
export const getFavourites = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT massage_id, title, price, desc, tags
       FROM favourites
       WHERE user_id = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (e) {
    console.error("GET FAV ERROR:", e);
    res.status(500).json({ message: "Server error" });
  }
};

/* TOGGLE favourite */
export const toggleFavourite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, price, desc, tags } = req.body;

    const exists = await pool.query(
      `SELECT id FROM favourites
       WHERE user_id = $1 AND title = $2`,
      [userId, title]
    );

    if (exists.rows.length > 0) {
      await pool.query(
        `DELETE FROM favourites
         WHERE user_id = $1 AND title = $2`,
        [userId, title]
      );
      return res.json({ removed: true });
    }

    await pool.query(
      `INSERT INTO favourites (user_id, title, price, desc, tags)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, title, price, desc, JSON.stringify(tags)]
    );

    res.json({ added: true });
  } catch (e) {
    console.error("TOGGLE FAV ERROR:", e);
    res.status(500).json({ message: "Server error" });
  }
};
