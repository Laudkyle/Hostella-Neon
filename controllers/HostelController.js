const Hostel = require('../models/Hostel');
const HostelRoom = require('../models/HostelRoom');
const Amenity = require('../models/Amenity');

// Get all hostels (public endpoint)
exports.getAllHostels = async (req, res, next) => {
  try {
    const hostels = await Hostel.getAll();
    res.json(hostels);
  } catch (error) {
    next(error);
  }
};

// Get hostel by ID (public endpoint)
exports.getHostelById = async (req, res, next) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    res.json(hostel);
  } catch (error) {
    next(error);
  }
};

// Get hostels by realtor (realtor only)
exports.getMyHostels = async (req, res, next) => {
  try {
    if (req.user.role !== 'realtor') {
      return res.status(403).json({ message: 'Access denied. Realtors only.' });
    }
    
    const hostels = await Hostel.findByRealtorId(req.user.id);
    res.json(hostels);
  } catch (error) {
    next(error);
  }
};

// Create new hostel (realtor only)
exports.createHostel = async (req, res, next) => {
  try {
    if (req.user.role !== 'realtor') {
      return res.status(403).json({ message: 'Access denied. Realtors only.' });
    }

    const { name, address, description, contact_email, contact_phone } = req.body;
    
    // Validate required fields
    if (!name || !address) {
      return res.status(400).json({ message: 'Name and address are required' });
    }

    const hostelData = {
      realtor_id: req.user.id,
      name,
      address,
      description,
      contact_email: contact_email || req.user.email,
      contact_phone
    };

    const hostel = await Hostel.create(hostelData);
    res.status(201).json(hostel);
  } catch (error) {
    next(error);
  }
};

// Update hostel (realtor only - and only their own hostels)
exports.updateHostel = async (req, res, next) => {
  try {
    if (req.user.role !== 'realtor') {
      return res.status(403).json({ message: 'Access denied. Realtors only.' });
    }

    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    // Check if the realtor owns this hostel
    if (hostel.realtor_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only update your own hostels.' });
    }

    const { name, address, description, contact_email, contact_phone } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (address) updates.address = address;
    if (description !== undefined) updates.description = description;
    if (contact_email) updates.contact_email = contact_email;
    if (contact_phone) updates.contact_phone = contact_phone;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const updatedHostel = await Hostel.update(req.params.id, updates);
    res.json(updatedHostel);
  } catch (error) {
    next(error);
  }
};

// Delete hostel (realtor only - and only their own hostels)
exports.deleteHostel = async (req, res, next) => {
  try {
    if (req.user.role !== 'realtor') {
      return res.status(403).json({ message: 'Access denied. Realtors only.' });
    }

    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    // Check if the realtor owns this hostel
    if (hostel.realtor_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own hostels.' });
    }

    await Hostel.delete(req.params.id);
    res.json({ message: 'Hostel deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Add amenity to hostel (realtor only)
exports.addAmenityToHostel = async (req, res, next) => {
  try {
    if (req.user.role !== 'realtor') {
      return res.status(403).json({ message: 'Access denied. Realtors only.' });
    }

    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    // Check if the realtor owns this hostel
    if (hostel.realtor_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only modify your own hostels.' });
    }

    const { amenity_id, is_available = true } = req.body;
    
    if (!amenity_id) {
      return res.status(400).json({ message: 'Amenity ID is required' });
    }

    const result = await Hostel.addAmenity(req.params.id, amenity_id, is_available);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// Remove amenity from hostel (realtor only)
exports.removeAmenityFromHostel = async (req, res, next) => {
  try {
    if (req.user.role !== 'realtor') {
      return res.status(403).json({ message: 'Access denied. Realtors only.' });
    }

    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    // Check if the realtor owns this hostel
    if (hostel.realtor_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only modify your own hostels.' });
    }

    const { amenity_id } = req.body;
    
    if (!amenity_id) {
      return res.status(400).json({ message: 'Amenity ID is required' });
    }

    const result = await Hostel.removeAmenity(req.params.id, amenity_id);
    if (!result) {
      return res.status(404).json({ message: 'Amenity not found in hostel' });
    }

    res.json({ message: 'Amenity removed from hostel successfully' });
  } catch (error) {
    next(error);
  }
};

// Get hostel amenities (public endpoint)
exports.getHostelAmenities = async (req, res, next) => {
  try {
    const amenities = await Hostel.getAmenities(req.params.id);
    res.json(amenities);
  } catch (error) {
    next(error);
  }
};

// Get hostel rooms (public endpoint)
exports.getHostelRooms = async (req, res, next) => {
  try {
    const rooms = await Hostel.getRooms(req.params.id);
    res.json(rooms);
  } catch (error) {
    next(error);
  }
};