const pool = require('../config/db');

class OTP {
  static async create({ email, otp, expires_at }) {
    const { rows } = await pool.query(
      'INSERT INTO otp (email, otp, expires_at) VALUES ($1, $2, $3) RETURNING *',
      [email, otp, expires_at]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT * FROM otp WHERE email = $1',
      [email]
    );
    return rows[0];
  }

  static async deleteByEmail(email) {
    const { rowCount } = await pool.query(
      'DELETE FROM otp WHERE email = $1',
      [email]
    );
    return rowCount > 0;
  }

  static async updateOrCreate({ email, otp, expires_at }) {
    // Try to update existing record first
    const { rowCount } = await pool.query(
      'UPDATE otp SET otp = $1, expires_at = $2 WHERE email = $3',
      [otp, expires_at, email]
    );

    // If no record was updated, create a new one
    if (rowCount === 0) {
      await this.create({ email, otp, expires_at });
    }
  }
}

module.exports = OTP;