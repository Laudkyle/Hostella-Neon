const pool = require('../config/db');

class SharedReservation {
  static async create(sharedData) {
    const { 
      reservation_id, 
      user_id, 
      share_amount 
    } = sharedData;

    const queryText = `
      INSERT INTO shared_reservations 
      (reservation_id, user_id, share_amount) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    
    const values = [reservation_id, user_id, share_amount];
    
    const { rows } = await pool.query(queryText, values);
    return rows[0];
  }

  static async findByReservationId(reservationId) {
    const { rows } = await pool.query(
      `SELECT sr.*, u.first_name, u.last_name, u.email
       FROM shared_reservations sr
       JOIN users u ON sr.user_id = u.id
       WHERE sr.reservation_id = $1`,
      [reservationId]
    );
    return rows;
  }

  static async updatePaymentStatus(reservationId, userId, paymentStatus) {
    const { rows } = await pool.query(
      `UPDATE shared_reservations 
       SET payment_status = $1 
       WHERE reservation_id = $2 AND user_id = $3 
       RETURNING *`,
      [paymentStatus, reservationId, userId]
    );
    return rows[0];
  }

  static async deleteByReservation(reservationId) {
    const { rowCount } = await pool.query(
      'DELETE FROM shared_reservations WHERE reservation_id = $1',
      [reservationId]
    );
    return rowCount > 0;
  }
}

module.exports = SharedReservation;