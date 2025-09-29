// utils/hostelUtils.js
const Hostel = require('../models/Hostel');
const HostelRoom = require('../models/HostelRoom');
const Amenity = require('../models/Amenity');

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

module.exports = HostelUtils;