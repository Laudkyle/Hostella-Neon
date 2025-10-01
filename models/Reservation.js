const pool = require('../config/db');

class Reservation {
  static async create(reservationData) {
    const { 
      user_id, 
      hostel_room_id, 
      payment_strategy, 
      amount_paid, 
      start_date, 
      end_date 
    } = reservationData;

    const queryText = `
      INSERT INTO reservations 
      (user_id, hostel_room_id, payment_strategy, amount_paid, start_date, end_date) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `;
    
    const values = [user_id, hostel_room_id, payment_strategy, amount_paid, start_date, end_date];
    
    const { rows } = await pool.query(queryText, values);
    return rows[0];
  }

  static async findById(id) {
    const { rows } = await pool.query(
      `SELECT r.*, 
              hr.room_type, hr.price_per_year,
              h.name as hostel_name, h.address,
              u.first_name, u.last_name, u.email
       FROM reservations r
       JOIN hostel_rooms hr ON r.hostel_room_id = hr.id
       JOIN hostels h ON hr.hostel_id = h.id
       JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [id]
    );
    return rows[0];
  }

  static async findByUserId(userId) {
    const { rows } = await pool.query(
      `SELECT r.*, 
              hr.room_type, hr.price_per_year,
              h.name as hostel_name, h.address
       FROM reservations r
       JOIN hostel_rooms hr ON r.hostel_room_id = hr.id
       JOIN hostels h ON hr.hostel_id = h.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );
    return rows;
  }

  static async findByRoomId(roomId) {
    const { rows } = await pool.query(
      `SELECT r.*, u.first_name, u.last_name, u.email
       FROM reservations r
       JOIN users u ON r.user_id = u.id
       WHERE r.hostel_room_id = $1
       ORDER BY r.created_at DESC`,
      [roomId]
    );
    return rows;
  }

static async checkAvailability(roomId, startDate, endDate) {
  const { rows } = await pool.query(
    `SELECT 
        hr.quantity_available,
        COUNT(r.id) as active_reservations
     FROM hostel_rooms hr
     LEFT JOIN reservations r ON hr.id = r.hostel_room_id 
        AND daterange($2, $3) && daterange(r.start_date, r.end_date)
        AND r.amount_paid > 0  -- Only count paid reservations
     WHERE hr.id = $1
     GROUP BY hr.id, hr.quantity_available`,
    [roomId, startDate, endDate]
  );
  
  if (rows.length === 0) return false;
  
  const availableRooms = rows[0].quantity_available - rows[0].active_reservations;
  return availableRooms > 0;
}

static async calculateTotalPrice(roomId, startDate, endDate, paymentStrategy) {
  // Get room price
  const { rows } = await pool.query(
    'SELECT price_per_year FROM hostel_rooms WHERE id = $1',
    [roomId]
  );
  
  if (rows.length === 0) throw new Error('Room not found');
  
  const pricePerYear = parseFloat(rows[0].price_per_year);
  
  // Calculate duration in days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationInDays = (end - start) / (1000 * 60 * 60 * 24);
  
  // Calculate total price (NO division here - this is the full price)
  let totalPrice = pricePerYear * (durationInDays / 365.25);
  
  // Apply payment strategy
  if (paymentStrategy === 'half') {
    totalPrice = totalPrice * 0.5;
  }
  
  return Math.round(totalPrice * 100) / 100; 
}

  static async update(reservationId, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
    
    if (fields.length === 0) return null;
    
    values.push(reservationId);
    const queryText = `
      UPDATE reservations 
      SET ${fields.join(', ')}, updated_at = NOW() 
      WHERE id = $${paramCount} 
      RETURNING *
    `;
    
    const { rows } = await pool.query(queryText, values);
    return rows[0];
  }

  static async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM reservations WHERE id = $1', [id]);
    return rowCount > 0;
  }
  

}

module.exports = Reservation;