const Amenity = require('../models/Amenity');

// Get all amenities (public endpoint)
exports.getAllAmenities = async (req, res, next) => {
  try {
    const amenities = await Amenity.getAll();
    res.json(amenities);
  } catch (error) {
    next(error);
  }
};

// Get amenity by ID (public endpoint)
exports.getAmenityById = async (req, res, next) => {
  try {
    const amenity = await Amenity.findById(req.params.id);
    if (!amenity) {
      return res.status(404).json({ message: 'Amenity not found' });
    }
    res.json(amenity);
  } catch (error) {
    next(error);
  }
};

// Create one or many amenities (admin or realtor)
exports.createAmenity = async (req, res, next) => {
  try {
    if (!['realtor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Admin/Realtor only.' });
    }

    let amenities = req.body;

    // Normalize single object to array
    if (!Array.isArray(amenities)) {
      amenities = [amenities];
    }

    // Validate all
    const invalid = amenities.filter(a => !a.name);
    if (invalid.length > 0) {
      return res.status(400).json({ message: 'Each amenity must have a name' });
    }

    // Create amenities
    const created = [];
    for (const amenity of amenities) {
      const newAmenity = await Amenity.create(amenity.name);
      created.push(newAmenity);
    }

    res.status(201).json({
      message: `${created.length} amenity(ies) created successfully`,
      amenities: created
    });
  } catch (error) {
    next(error);
  }
};

// Update amenity (admin only)
exports.updateAmenity = async (req, res, next) => {
  try {
    // Add admin check if you have admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Amenity name is required' });
    }

    const amenity = await Amenity.update(req.params.id, name);
    if (!amenity) {
      return res.status(404).json({ message: 'Amenity not found' });
    }

    res.json(amenity);
  } catch (error) {
    next(error);
  }
};

// Delete amenity (admin only)
exports.deleteAmenity = async (req, res, next) => {
  try {
    // Add admin check if you have admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const result = await Amenity.delete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Amenity not found' });
    }

    res.json({ message: 'Amenity deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get hostels with specific amenity (public endpoint)
exports.getHostelsWithAmenity = async (req, res, next) => {
  try {
    const hostels = await Amenity.getHostelsWithAmenity(req.params.id);
    res.json(hostels);
  } catch (error) {
    next(error);
  }
};