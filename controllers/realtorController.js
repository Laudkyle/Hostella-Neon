const Realtor = require('../models/Realtor');

exports.getRealtorProfile = async (req, res, next) => {
  try {
    if (req.user.role !== 'realtor') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const realtor = await Realtor.findByUserId(req.user.id);
    if (!realtor) {
      return res.status(404).json({ message: 'Realtor profile not found' });
    }
    
    res.json(realtor);
  } catch (error) {
    next(error);
  }
};

exports.updateCompany = async (req, res, next) => {
  try {
    if (req.user.role !== 'realtor') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { companyName } = req.body;
    if (!companyName) {
      return res.status(400).json({ message: 'Company name is required' });
    }
    
    const updatedRealtor = await Realtor.updateCompany(req.user.id, companyName);
    res.json(updatedRealtor);
  } catch (error) {
    next(error);
  }
};