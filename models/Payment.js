const pool = require('../config/db');

class Payment {
  static async create(paymentData) {
    const { 
      reservation_id, 
      amount, 
      payment_method, 
      transaction_id 
    } = paymentData;

    const queryText = `
      INSERT INTO payments 
      (reservation_id, amount, payment_method, transaction_id) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;
    
    const values = [reservation_id, amount, payment_method, transaction_id];
    
    const { rows } = await pool.query(queryText, values);
    return rows[0];
  }

  static async findByReservationId(reservationId) {
    const { rows } = await pool.query(
      'SELECT * FROM payments WHERE reservation_id = $1 ORDER BY payment_date DESC',
      [reservationId]
    );
    return rows;
  }

  static async findByTransactionId(transactionId) {
    const { rows } = await pool.query(
      'SELECT * FROM payments WHERE transaction_id = $1',
      [transactionId]
    );
    return rows[0];
  }

  static async updateTransaction(transactionId, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
    
    if (fields.length === 0) return null;
    
    values.push(transactionId);
    const queryText = `
      UPDATE payments 
      SET ${fields.join(', ')} 
      WHERE transaction_id = $${paramCount} 
      RETURNING *
    `;
    
    const { rows } = await pool.query(queryText, values);
    return rows[0];
  }
}

module.exports = Payment;