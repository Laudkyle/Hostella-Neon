const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async create({ 
    email, 
    firstName, 
    lastName, 
    phoneNumber, 
    password, 
    role = 'student', 
    provider = 'email' 
  }) {
    const passwordHash = await bcrypt.hash(password, 10);
    
    // PostgreSQL uses $1, $2, etc. for parameters
    const queryText = `
      INSERT INTO users 
      (email, first_name, last_name, phone_number, password_hash, role, provider) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`;
      
    const values = [email, firstName, lastName, phoneNumber, passwordHash, role, provider];
    
    const { rows } = await db.query(queryText, values);
    const newUser = rows[0];
    
    // Create role-specific record if needed
    if (role === 'student') {
      await db.query(
        'INSERT INTO students (user_id) VALUES ($1)',
        [newUser.id]
      );
    } else if (role === 'realtor') {
      await db.query(
        'INSERT INTO realtors (user_id) VALUES ($1)',
        [newUser.id]
      );
    }
    
    return newUser;
  }

  static async findByEmail(email) {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
  }

  static async findById(id) {
    const { rows } = await db.query(
      `SELECT 
        id, email, first_name, last_name, phone_number, 
        role, provider, is_verified, is_active, created_at 
      FROM users WHERE id = $1`, 
      [id]
    );
    return rows[0];
  }

  static async updateUser(id, updates) {
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
    const queryText = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const { rows } = await db.query(queryText, values);
    return rows[0];
  }

  static async deleteUser(id) {
    await db.query('DELETE FROM users WHERE id = $1', [id]);
  }

  static async getAll() {
    const { rows } = await db.query(
      `SELECT 
        id, email, first_name, last_name, phone_number, 
        role, is_verified, is_active, created_at 
      FROM users`
    );
    return rows;
  }
}

module.exports = User;