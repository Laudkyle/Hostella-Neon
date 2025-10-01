// utils/hostelUtils.js
const Hostel = require('../models/Hostel');
const HostelRoom = require('../models/HostelRoom');
const Amenity = require('../models/Amenity');
const pool = require('../config/db')
class HostelUtils {
  static async getHostelWithDetails(hostelId) {
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) return null;

    const [rooms, amenities] = await Promise.all([
      HostelRoom.findByHostelId(hostelId),
      Hostel.getAmenities(hostelId)
    ]);

    return {
      ...hostel,
      rooms,
      amenities
    };
  }

  static async searchHostels(filters = {}) {
    let query = `
      SELECT DISTINCT h.*, u.first_name, u.last_name
      FROM hostels h
      JOIN users u ON h.realtor_id = u.id
      LEFT JOIN hostel_rooms hr ON h.id = hr.hostel_id
      LEFT JOIN hostel_amenities ha ON h.id = ha.hostel_id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 1;

    if (filters.roomType) {
      query += ` AND hr.room_type = $${paramCount}`;
      values.push(filters.roomType);
      paramCount++;
    }

    if (filters.maxPrice) {
      query += ` AND hr.price_per_year <= $${paramCount}`;
      values.push(filters.maxPrice);
      paramCount++;
    }

    if (filters.amenities && filters.amenities.length > 0) {
      query += ` AND ha.amenity_id IN (${filters.amenities.map((_, i) => `$${paramCount + i}`).join(',')})`;
      values.push(...filters.amenities);
      paramCount += filters.amenities.length;
    }

    query += ' ORDER BY h.name';

    const { rows } = await pool.query(query, values);
    return rows;
  }
}
// Helper function to decrease room quantity
async function decreaseRoomQuantity(roomId) {
  try {
    const { rows } = await pool.query(
      `UPDATE hostel_rooms 
       SET quantity_available = GREATEST(0, quantity_available - 1), 
           updated_at = NOW() 
       WHERE id = $1 
       RETURNING quantity_available`,
      [roomId]
    );
    
    if (rows.length === 0) {
      throw new Error('Room not found');
    }
    
    return rows[0].quantity_available;
  } catch (error) {
    console.error('Error decreasing room quantity:', error);
    throw error;
  }
}

// Helper function to validate shared users exist
async function validateSharedUsers(userIds) {
  try {
    const placeholders = userIds.map((_, i) => `$${i + 1}`).join(',');
    const queryText = `
      SELECT id, role FROM users 
      WHERE id IN (${placeholders}) AND role = 'student'
    `;
    
    const { rows } = await pool.query(queryText, userIds);
    return rows.length === userIds.length;
  } catch (error) {
    return false;
  }
}
// Helper function to get room details including capacity
async function getRoomDetails(roomId) {
  try {
    const { rows } = await pool.query(
      `SELECT 
          hr.*,
          CASE 
            WHEN hr.room_type = 'single' THEN 1
            WHEN hr.room_type = 'double' THEN 2
            WHEN hr.room_type = 'three' THEN 3
            WHEN hr.room_type = 'four' THEN 4
          END as capacity
       FROM hostel_rooms hr
       WHERE hr.id = $1`,
      [roomId]
    );
    
    return rows[0] || null;
  } catch (error) {
    console.error('Error getting room details:', error);
    return null;
  }
}

// Helper function to validate sharing rules
function validateSharing(roomDetails, sharedUsers) {
  const roomCapacity = roomDetails.capacity;
  const roomType = roomDetails.room_type;
  
  // Single rooms cannot be shared
  if (roomType === 'single' && sharedUsers.length > 0) {
    return 'Single rooms cannot be shared. Please book individually.';
  }
  
  // Check if trying to share beyond room capacity
  const totalParticipants = sharedUsers.length + 1; // +1 for main user
  
  if (totalParticipants > roomCapacity) {
    return `Room capacity exceeded. This ${roomType} room can accommodate ${roomCapacity} person(s), but ${totalParticipants} participants were specified.`;
  }
  
  // Check minimum sharing requirements (optional)
  if (roomType === 'single' && sharedUsers.length > 0) {
    return 'Single rooms are for individual use only.';
  }
  
  // Check if room type supports the requested sharing
  if (roomType === 'double' && totalParticipants > 2) {
    return 'Double rooms can only accommodate 2 persons.';
  }
  
  if (roomType === 'three' && totalParticipants > 3) {
    return 'Three-person rooms can only accommodate 3 persons.';
  }
  
  if (roomType === 'four' && totalParticipants > 4) {
    return 'Four-person rooms can only accommodate 4 persons.';
  }
  
  return null; // No validation errors
}

// Helper function to validate shared users exist and are students
async function validateSharedUsers(userIds) {
  try {
    if (userIds.length === 0) return true;
    
    const placeholders = userIds.map((_, i) => `$${i + 1}`).join(',');
    const queryText = `
      SELECT id, role FROM users 
      WHERE id IN (${placeholders}) AND role = 'student' AND is_active = true
    `;
    
    const { rows } = await pool.query(queryText, userIds);
    
    if (rows.length !== userIds.length) {
      // Find which users are invalid
      const validUserIds = rows.map(row => row.id);
      const invalidUserIds = userIds.filter(id => !validUserIds.includes(id));
      throw new Error(`Invalid or inactive users: ${invalidUserIds.join(', ')}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error validating shared users:', error);
    throw error;
  }
}
module.exports = {HostelUtils,decreaseRoomQuantity,validateSharedUsers,validateSharing,getRoomDetails};