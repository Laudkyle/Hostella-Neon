const pool = require('../config/db');

class Student {
  static async findByUserId(userId) {
    const { rows } = await pool.query(
      `SELECT s.*, u.email, u.first_name, u.last_name, u.phone_number 
       FROM students s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.user_id = $1`,
      [userId]
    );
    return rows[0];
  }

  static async updateEnrollmentDate(userId, enrollmentDate) {
    // PostgreSQL supports RETURNING clause for single-step update and return
    const { rows } = await pool.query(
      'UPDATE students SET enrollment_date = $1 WHERE user_id = $2 RETURNING *',
      [enrollmentDate, userId]
    );
    
    if (rows.length === 0) return null;
    
    // Get the full student data with user info
    return await this.findByUserId(userId);
  }

  static async create(studentData) {
    // Convert object to columns and values for PostgreSQL
    const columns = Object.keys(studentData);
    const values = Object.values(studentData);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    
    const { rows } = await pool.query(
      `INSERT INTO students (${columns.join(', ')}) 
       VALUES (${placeholders}) 
       RETURNING *`,
      values
    );
    
    return this.findByUserId(studentData.user_id);
  }

  static async deleteByUserId(userId) {
    const { rowCount } = await pool.query(
      'DELETE FROM students WHERE user_id = $1',
      [userId]
    );
    return rowCount > 0;
  }

  static async update(studentId, updates) {
    // Convert object to SET clauses for PostgreSQL
    const setClauses = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      setClauses.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
    
    values.push(studentId);
    
    const { rows } = await pool.query(
      `UPDATE students 
       SET ${setClauses.join(', ')} 
       WHERE id = $${paramIndex} 
       RETURNING *`,
      values
    );
    
    return rows[0];
  }
}

module.exports = Student;