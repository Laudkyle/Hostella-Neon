const HostelUtils = require('../utils/hostelUtils');

// Search hostels with filters (public endpoint)
exports.searchHostels = async (req, res, next) => {
  try {
    const { roomType, maxPrice, amenities } = req.query;
    const filters = {};

    if (roomType) filters.roomType = roomType;
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (amenities) {
      filters.amenities = Array.isArray(amenities) 
        ? amenities.map(id => parseInt(id))
        : [parseInt(amenities)];
    }

    const hostels = await HostelUtils.searchHostels(filters);
    res.json(hostels);
  } catch (error) {
    next(error);
  }
};

// Get hostel with full details (public endpoint)
exports.getHostelWithDetails = async (req, res, next) => {
  try {
    const hostelDetails = await HostelUtils.getHostelWithDetails(req.params.id);
    if (!hostelDetails) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    res.json(hostelDetails);
  } catch (error) {
    next(error);
  }
};