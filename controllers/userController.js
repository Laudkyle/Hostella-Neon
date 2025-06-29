const User = require('../models/User');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Format the response
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phoneNumber: user.phone_number,
      role: user.role,
      isVerified: user.is_verified,
      createdAt: user.created_at
    };
    
    res.json(userResponse);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phoneNumber } = req.body;
    const updates = {};
    
    if (firstName) updates.first_name = firstName;
    if (lastName) updates.last_name = lastName;
    if (phoneNumber) updates.phone_number = phoneNumber;
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    updates.updated_at = new Date();
    const updatedUser = await User.updateUser(req.user.id, updates);
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Format the response
    const userResponse = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      phoneNumber: updatedUser.phone_number,
      role: updatedUser.role,
      isVerified: updatedUser.is_verified,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at
    };
    
    res.json(userResponse);
  } catch (error) {
    next(error);
  }
};

exports.deleteProfile = async (req, res, next) => {
  try {
    await User.deleteUser(req.user.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};