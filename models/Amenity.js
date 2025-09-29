const pool = require('../config/db');

class Amenity {
  static async create(name) {
    const { rows } = await pool.query(
      'INSERT INTO amenities (name) VALUES ($1) RETURNING *',
      [name]
    );
    return rows[0];
  }

  static async findById(id) {
    const { rows } = await pool.query('SELECT * FROM amenities WHERE id = $1', [id]);
    return rows[0];
  }

  static async findByName(name) {
    const { rows } = await pool.query('SELECT * FROM amenities WHERE name = $1', [name]);
    return rows[0];
  }

  static async getAll() {
    const { rows } = await pool.query('SELECT * FROM amenities ORDER BY name');
    return rows;
  }

  static async update(id, name) {
    const { rows } = await pool.query(
      'UPDATE amenities SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    return rows[0];
  }

  static async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM amenities WHERE id = $1', [id]);
    return rowCount > 0;
  }

  static async getHostelsWithAmenity(amenityId) {
    const { rows } = await pool.query(
      `SELECT h.*, u.first_name, u.last_name
       FROM hostels h
       JOIN hostel_amenities ha ON h.id = ha.hostel_id
       JOIN users u ON h.realtor_id = u.id
       WHERE ha.amenity_id = $1 AND ha.is_available = true
       ORDER BY h.name`,
      [amenityId]
    );
    return rows;
  }
}

module.exports = Amenity;