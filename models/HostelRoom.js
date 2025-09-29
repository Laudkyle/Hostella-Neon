const pool = require('../config/db');

class HostelRoom {
  static async create(roomData) {
    const { 
      hostel_id, 
      room_type, 
      price_per_year, 
      quantity_available 
    } = roomData;

    const queryText = `
      INSERT INTO hostel_rooms 
      (hostel_id, room_type, price_per_year, quantity_available) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;
    
    const values = [hostel_id, room_type, price_per_year, quantity_available];
    
    const { rows } = await pool.query(queryText, values);
    return rows[0];
  }

  static async findById(id) {
    const { rows } = await pool.query(
      `SELECT hr.*, h.name as hostel_name, h.address
       FROM hostel_rooms hr
       JOIN hostels h ON hr.hostel_id = h.id
       WHERE hr.id = $1`,
      [id]
    );
    return rows[0];
  }

  static async findByHostelId(hostelId) {
    const { rows } = await pool.query(
      'SELECT * FROM hostel_rooms WHERE hostel_id = $1 ORDER BY room_type',
      [hostelId]
    );
    return rows;
  }

  static async findByType(hostelId, roomType) {
    const { rows } = await pool.query(
      'SELECT * FROM hostel_rooms WHERE hostel_id = $1 AND room_type = $2',
      [hostelId, roomType]
    );
    return rows[0];
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
    
    if (fields.length === 0) return null;
    
    values.push(id);
    const queryText = `
      UPDATE hostel_rooms 
      SET ${fields.join(', ')}, updated_at = NOW() 
      WHERE id = $${paramCount} 
      RETURNING *
    `;
    
    const { rows } = await pool.query(queryText, values);
    return rows[0];
  }

  static async updateQuantity(id, newQuantity) {
    const { rows } = await pool.query(
      'UPDATE hostel_rooms SET quantity_available = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [newQuantity, id]
    );
    return rows[0];
  }

  static async incrementQuantity(id, amount = 1) {
    const { rows } = await pool.query(
      `UPDATE hostel_rooms 
       SET quantity_available = quantity_available + $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [amount, id]
    );
    return rows[0];
  }

  static async decrementQuantity(id, amount = 1) {
    const { rows } = await pool.query(
      `UPDATE hostel_rooms 
       SET quantity_available = GREATEST(0, quantity_available - $1), updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [amount, id]
    );
    return rows[0];
  }

  static async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM hostel_rooms WHERE id = $1', [id]);
    return rowCount > 0;
  }

  static async deleteByHostelId(hostelId) {
    const { rowCount } = await pool.query('DELETE FROM hostel_rooms WHERE hostel_id = $1', [hostelId]);
    return rowCount > 0;
  }
}

module.exports = HostelRoom;