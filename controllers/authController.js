const User = require('../models/User');
const OTP = require('../models/OTP'); 
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const bcrypt = require('bcryptjs');
const { generateOTP, sendOTP } = require('../utils/emailService');

exports.register = async (req, res, next) => {
  try {
    const { email, firstName, lastName, phoneNumber, password, role } = req.body;
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({ 
      email, 
      firstName, 
      lastName, 
      phoneNumber, 
      password, 
      role,
      is_verified: false // User starts unverified
    });

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + process.env.OTP_EXPIRY_MINUTES * 60000);

    // Store OTP in separate table
    await OTP.create({
      email: user.email,
      otp,
      expires_at: otpExpiry
    });

    // Send OTP email
    const emailSent = await sendOTP(user.email, otp);
    if (!emailSent) {
      throw new Error('Failed to send OTP email');
    }

    // Generate temporary token (can only verify OTP)
    const tempToken = jwt.sign(
      { 
        id: user.id,
        purpose: 'otp_verification'
      }, 
      jwtConfig.JWT_SECRET, 
      { expiresIn: '15m' }
    );

    res.status(201).json({ 
      message: 'Registration successful. Please check your email for OTP.',
      tempToken,
      userId: user.id
    });
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find OTP record
    const otpRecord = await OTP.findByEmail(user.email);
    if (!otpRecord) {
      return res.status(400).json({ message: 'No OTP found for this email' });
    }

    // Check if OTP matches and isn't expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      return res.status(400).json({ message: 'expired OTP' });
    }
    // Check if OTP matches and isn't expired
    if (otpRecord.otp !== otp ) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Mark user as verified
    await User.updateUser(userId, { 
      is_verified: true
    });

    // Delete the used OTP
    await OTP.deleteByEmail(user.email);

    // Generate full access token
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        email: user.email 
      }, 
      jwtConfig.JWT_SECRET, 
      { expiresIn: jwtConfig.JWT_EXPIRES_IN }
    );

    res.json({ 
      message: 'Email verified successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isVerified: true
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.resendOTP = async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + process.env.OTP_EXPIRY_MINUTES * 60000);

    // Update or create new OTP record
    await OTP.updateOrCreate({
      email: user.email,
      otp,
      expires_at: otpExpiry
    });

    // Send new OTP
    const emailSent = await sendOTP(user.email, otp);
    if (!emailSent) {
      throw new Error('Failed to resend OTP');
    }

    res.json({ message: 'New OTP sent successfully' });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is verified
    if (!user.is_verified) {
      return res.status(403).json({ 
        message: 'Account not verified. Please verify your email first.',
        userId: user.id
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        email: user.email 
      }, 
      jwtConfig.JWT_SECRET, 
      { expiresIn: jwtConfig.JWT_EXPIRES_IN }
    );

    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phoneNumber: user.phone_number,
        role: user.role,
        isVerified: user.is_verified,
        createdAt: user.created_at
      },
      token 
    });
  } catch (error) {
    next(error);
  }
};