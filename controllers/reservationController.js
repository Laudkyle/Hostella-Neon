const Reservation = require('../models/Reservation');
const Payment = require('../models/Payment');
const SharedReservation = require('../models/SharedReservation');
const HostelRoom = require('../models/HostelRoom');
const PaystackService = require('../services/paystackService');

// Initialize reservation and payment
exports.initializeReservation = async (req, res, next) => {
  try {
    const { hostel_room_id, payment_strategy, start_date, end_date, shared_users = [] } = req.body;
    
    // Validate required fields
    if (!hostel_room_id || !payment_strategy || !start_date || !end_date) {
      return res.status(400).json({ 
        message: 'hostel_room_id, payment_strategy, start_date, and end_date are required' 
      });
    }

    // Validate payment strategy
    if (!['full', 'half'].includes(payment_strategy)) {
      return res.status(400).json({ 
        message: 'payment_strategy must be either "full" or "half"' 
      });
    }

    // Check room availability
    const isAvailable = await Reservation.checkAvailability(hostel_room_id, start_date, end_date);
    if (!isAvailable) {
      return res.status(400).json({ 
        message: 'Room is not available for the selected dates' 
      });
    }

    // Calculate total price
    const totalAmount = await Reservation.calculateTotalPrice(
      hostel_room_id, 
      start_date, 
      end_date, 
      payment_strategy
    );

    // Create reservation record (initially with amount_paid = 0)
    const reservationData = {
      user_id: req.user.id,
      hostel_room_id,
      payment_strategy,
      amount_paid: 0, // Will be updated after successful payment
      start_date,
      end_date
    };

    const reservation = await Reservation.create(reservationData);

    // Create shared reservations if any
    if (shared_users.length > 0) {
      const shareAmount = totalAmount / (shared_users.length + 1); // +1 for the main user
      
      for (const sharedUserId of shared_users) {
        await SharedReservation.create({
          reservation_id: reservation.id,
          user_id: sharedUserId,
          share_amount: shareAmount
        });
      }
    }

    // Initialize Paystack payment
    const reference = PaystackService.generateReference();
    const paymentResponse = await PaystackService.initializeTransaction(
      req.user.email,
      totalAmount,
      reference,
      {
        reservation_id: reservation.id,
        user_id: req.user.id,
        custom_fields: [
          {
            display_name: "Reservation ID",
            variable_name: "reservation_id",
            value: reservation.id
          }
        ]
      }
    );

    // Store payment record
    await Payment.create({
      reservation_id: reservation.id,
      amount: totalAmount,
      payment_method: 'paystack',
      transaction_id: reference
    });

    res.json({
      message: 'Reservation initialized successfully',
      reservation,
      payment_url: paymentResponse.data.authorization_url,
      reference,
      amount: totalAmount
    });
  } catch (error) {
    next(error);
  }
};

// Verify payment and confirm reservation
exports.verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.body;
    
    if (!reference) {
      return res.status(400).json({ message: 'Payment reference is required' });
    }

    // Verify payment with Paystack
    const verification = await PaystackService.verifyTransaction(reference);
    
    if (verification.data.status !== 'success') {
      return res.status(400).json({ 
        message: 'Payment not successful', 
        status: verification.data.status 
      });
    }

    // Get payment record
    const payment = await Payment.findByTransactionId(reference);
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Update reservation with actual paid amount
    const amountPaid = parseFloat(verification.data.amount) / 100; // Convert from kobo
    const updatedReservation = await Reservation.update(payment.reservation_id, {
      amount_paid: amountPaid
    });

    // Update payment record with successful status
    await Payment.updateTransaction(reference, {
      payment_date: new Date()
    });

    // Get full reservation details
    const reservation = await Reservation.findById(payment.reservation_id);

    res.json({
      message: 'Payment verified and reservation confirmed',
      reservation,
      payment: verification.data
    });
  } catch (error) {
    next(error);
  }
};

// Get user's reservations
exports.getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.findByUserId(req.user.id);
    res.json(reservations);
  } catch (error) {
    next(error);
  }
};

// Get reservation by ID
exports.getReservationById = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check if user owns the reservation or is a shared user
    if (reservation.user_id !== req.user.id) {
      const sharedReservations = await SharedReservation.findByReservationId(req.params.id);
      const isSharedUser = sharedReservations.some(sr => sr.user_id === req.user.id);
      
      if (!isSharedUser) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Get payment history
    const payments = await Payment.findByReservationId(req.params.id);
    
    // Get shared reservations if any
    const sharedReservations = await SharedReservation.findByReservationId(req.params.id);

    res.json({
      ...reservation,
      payments,
      shared_reservations: sharedReservations
    });
  } catch (error) {
    next(error);
  }
};

// Cancel reservation
exports.cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check if user owns the reservation
    if (reservation.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if reservation can be cancelled (e.g., not too close to start date)
    const startDate = new Date(reservation.start_date);
    const today = new Date();
    const daysDifference = (startDate - today) / (1000 * 60 * 60 * 24);

    if (daysDifference < 7) {
      return res.status(400).json({ 
        message: 'Reservation cannot be cancelled within 7 days of start date' 
      });
    }

    await Reservation.delete(req.params.id);
    
    res.json({ message: 'Reservation cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

// Calculate reservation price
exports.calculatePrice = async (req, res, next) => {
  try {
    const { hostel_room_id, payment_strategy, start_date, end_date } = req.body;
    
    if (!hostel_room_id || !payment_strategy || !start_date || !end_date) {
      return res.status(400).json({ 
        message: 'hostel_room_id, payment_strategy, start_date, and end_date are required' 
      });
    }

    const totalAmount = await Reservation.calculateTotalPrice(
      hostel_room_id, 
      start_date, 
      end_date, 
      payment_strategy
    );

    // Check availability
    const isAvailable = await Reservation.checkAvailability(hostel_room_id, start_date, end_date);

    res.json({
      total_amount: totalAmount,
      currency: 'NGN',
      is_available: isAvailable,
      room_id: hostel_room_id,
      payment_strategy,
      start_date,
      end_date
    });
  } catch (error) {
    next(error);
  }
};