const pool = require('../config/db');

class Hostel {
  static async create(hostelData) {
    const { 
      realtor_id, 
      name, 
      address, 
      description, 
      contact_email, 
      contact_phone 
    } = hostelData;

    const queryText = `
      INSERT INTO hostels 
      (realtor_id, name, address, description, contact_email, contact_phone) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `;
    
    const values = [realtor_id, name, address, description, contact_email, contact_phone];
    
    const { rows } = await pool.query(queryText, values);
    return rows[0];
  }

  static async findById(id) {
    const { rows } = await pool.query(
      `SELECT h.*, u.first_name, u.last_name, u.email as realtor_email
       FROM hostels h
       JOIN users u ON h.realtor_id = u.id
       WHERE h.id = $1`,
      [id]
    );
    return rows[0];
  }

  static async findByRealtorId(realtorId) {
    const { rows } = await pool.query(
      'SELECT * FROM hostels WHERE realtor_id = $1 ORDER BY created_at DESC',
      [realtorId]
    );
    return rows;
  }

  static async getAll() {
    const { rows } = await pool.query(
      `SELECT h.*, u.first_name, u.last_name, u.email as realtor_email
       FROM hostels h
       JOIN users u ON h.realtor_id = u.id
       ORDER BY h.created_at DESC`
    );
    return rows;
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
      UPDATE hostels 
      SET ${fields.join(', ')}, updated_at = NOW() 
      WHERE id = $${paramCount} 
      RETURNING *
    `;
    
    const { rows } = await pool.query(queryText, values);
    return rows[0];
  }

  static async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM hostels WHERE id = $1', [id]);
    return rowCount > 0;
  }

  static async addAmenity(hostelId, amenityId, isAvailable = true) {
    const queryText = `
      INSERT INTO hostel_amenities (hostel_id, amenity_id, is_available)
      VALUES ($1, $2, $3)
      ON CONFLICT (hostel_id, amenity_id) 
      DO UPDATE SET is_available = $3, updated_at = NOW()
      RETURNING *
    `;
    
    const { rows } = await pool.query(queryText, [hostelId, amenityId, isAvailable]);
    return rows[0];
  }

  static async removeAmenity(hostelId, amenityId) {
    const { rowCount } = await pool.query(
      'DELETE FROM hostel_amenities WHERE hostel_id = $1 AND amenity_id = $2',
      [hostelId, amenityId]
    );
    return rowCount > 0;
  }

  static async getAmenities(hostelId) {
    const { rows } = await pool.query(
      `SELECT a.*, ha.is_available
       FROM amenities a
       JOIN hostel_amenities ha ON a.id = ha.amenity_id
       WHERE ha.hostel_id = $1
       ORDER BY a.name`,
      [hostelId]
    );
    return rows;
  }

  static async getRooms(hostelId) {
    const { rows } = await pool.query(
      'SELECT * FROM hostel_rooms WHERE hostel_id = $1 ORDER BY room_type',
      [hostelId]
    );
    return rows;
  }
}

module.exports = Hostel;