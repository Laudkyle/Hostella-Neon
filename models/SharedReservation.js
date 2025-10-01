const pool = require('../config/db');

class SharedReservation {
  static async create(sharedData) {
    const { 
      reservation_id, 
      user_id, 
      share_amount,
      payment_status = 'pending'
    } = sharedData;

    try {
      const queryText = `
        INSERT INTO reservation_participants 
        (reservation_id, user_id, share_amount, payment_status) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `;
      
      const values = [reservation_id, user_id, share_amount, payment_status];
      
      const { rows } = await pool.query(queryText, values);
      return rows[0];
    } catch (error) {
      if (error.code === '23503') { // Foreign key violation
        if (error.constraint === 'reservation_participants_user_id_fkey') {
          throw new Error(`User with ID ${user_id} does not exist`);
        } else if (error.constraint === 'reservation_participants_reservation_id_fkey') {
          throw new Error(`Reservation with ID ${reservation_id} does not exist`);
        }
      }
      throw error;
    }
  }

  // Method to handle shared user payment
  static async processSharedUserPayment(reservationId, userId) {
    const { rows } = await pool.query(
      `UPDATE reservation_participants 
       SET payment_status = 'paid' 
       WHERE reservation_id = $1 AND user_id = $2 
       RETURNING *`,
      [reservationId, userId]
    );
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