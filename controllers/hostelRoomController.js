const HostelRoom = require('../models/HostelRoom');
const Hostel = require('../models/Hostel');

// Get room by ID (public endpoint)
exports.getRoomById = async (req, res, next) => {
  try {
    const room = await HostelRoom.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    next(error);
  }
};

// Create room for hostel (realtor only)
exports.createRoom = async (req, res, next) => {
  try {
    if (!['realtor', 'admin'].includes(req.user.role))
 {
      return res.status(403).json({ message: 'Access denied. Realtors only.' });
    }

    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    // Check if the realtor owns this hostel
    if (hostel.realtor_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only add rooms to your own hostels.' });
    }

    const { room_type, price_per_year, quantity_available } = req.body;
    
    // Validate required fields
    if (!room_type || !price_per_year || quantity_available === undefined) {
      return res.status(400).json({ 
        message: 'Room type, price per year, and quantity available are required' 
      });
    }

    // Validate room type
    const validRoomTypes = ['single', 'double', 'three', 'four'];
    if (!validRoomTypes.includes(room_type)) {
      return res.status(400).json({ 
        message: 'Invalid room type. Must be one of: single, double, three, four' 
      });
    }

    const roomData = {
      hostel_id: req.params.id,
      room_type,
      price_per_year: parseFloat(price_per_year),
      quantity_available: parseInt(quantity_available)
    };

    const room = await HostelRoom.create(roomData);
    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
};

// Update room (realtor only)
exports.updateRoom = async (req, res, next) => {
  try {
    if (!['realtor', 'admin'].includes(req.user.role))
 {
      return res.status(403).json({ message: 'Access denied. Realtors only.' });
    }

    const room = await HostelRoom.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const hostel = await Hostel.findById(room.hostel_id);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    // Check if the realtor owns this hostel
    if (hostel.realtor_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only update rooms in your own hostels.' });
    }

    const { price_per_year, quantity_available } = req.body;
    const updates = {};

    if (price_per_year !== undefined) updates.price_per_year = parseFloat(price_per_year);
    if (quantity_available !== undefined) updates.quantity_available = parseInt(quantity_available);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const updatedRoom = await HostelRoom.update(req.params.roomId, updates);
    res.json(updatedRoom);
  } catch (error) {
    next(error);
  }
};

// Update room quantity (realtor only)
exports.updateRoomQuantity = async (req, res, next) => {
  try {
    if (!['realtor', 'admin'].includes(req.user.role))
 {
      return res.status(403).json({ message: 'Access denied. Realtors only.' });
    }

    const room = await HostelRoom.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const hostel = await Hostel.findById(room.hostel_id);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    // Check if the realtor owns this hostel
    if (hostel.realtor_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only update rooms in your own hostels.' });
    }

    const { quantity_available } = req.body;
    
    if (quantity_available === undefined || quantity_available < 0) {
      return res.status(400).json({ message: 'Valid quantity available is required' });
    }

    const updatedRoom = await HostelRoom.updateQuantity(req.params.roomId, parseInt(quantity_available));
    res.json(updatedRoom);
  } catch (error) {
    next(error);
  }
};

// Delete room (realtor only)
exports.deleteRoom = async (req, res, next) => {
  try {
    if (!['realtor', 'admin'].includes(req.user.role))
 {
      return res.status(403).json({ message: 'Access denied. Realtors only.' });
    }

    const room = await HostelRoom.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const hostel = await Hostel.findById(room.hostel_id);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    // Check if the realtor owns this hostel
    if (hostel.realtor_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only delete rooms from your own hostels.' });
    }

    await HostelRoom.delete(req.params.roomId);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    next(error);
  }
};