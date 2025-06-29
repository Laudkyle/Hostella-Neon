const pool = require('../config/db');

class Realtor {
  static async findByUserId(userId) {
    const { rows } = await pool.query(
      `SELECT r.*, u.email, u.first_name, u.last_name, u.phone_number 
       FROM realtors r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.user_id = $1`,
      [userId]
    );
    return rows[0];
  }

  static async updateCompany(userId, companyName) {
    // PostgreSQL supports RETURNING clause
    const { rows } = await pool.query(
      'UPDATE realtors SET company_name = $1 WHERE user_id = $2 RETURNING *',
      [companyName, userId]
    );
    
    if (rows.length === 0) return null;
    
    // Return the full realtor data with user info
    return await this.findByUserId(userId);
  }

  static async create(realtorData) {
    // Convert object to columns and values for PostgreSQL
    const columns = Object.keys(realtorData);
    const values = Object.values(realtorData);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    
    const { rows } = await pool.query(
      `INSERT INTO realtors (${columns.join(', ')}) 
       VALUES (${placeholders}) 
       RETURNING *`,
      values
    );
    
    return this.findByUserId(realtorData.user_id);
  }

  static async deleteByUserId(userId) {
    const { rowCount } = await pool.query(
      'DELETE FROM realtors WHERE user_id = $1',
      [userId]
    );
    return rowCount > 0;
  }

  static async update(realtorId, updates) {
    // Convert object to SET clauses for PostgreSQL
    const setClauses = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      setClauses.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
    
    values.push(realtorId);
    
    const { rows } = await pool.query(
      `UPDATE realtors 
       SET ${setClauses.join(', ')} 
       WHERE id = $${paramIndex} 
       RETURNING *`,
      values
    );
    
    return rows[0];
  }

  static async getAll() {
    const { rows } = await pool.query(
      `SELECT r.*, u.email, u.first_name, u.last_name, u.phone_number
       FROM realtors r
       JOIN users u ON r.user_id = u.id`
    );
    return rows;
  }
}

module.exports = Realtor;