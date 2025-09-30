const axios = require('axios');

class PaystackService {
  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY;
    this.baseURL = 'https://api.paystack.co';
  }

  async initializeTransaction(email, amount, reference, metadata = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/transaction/initialize`,
        {
          email,
          amount: amount * 100, 
          reference,
          currency: 'GHS',
          metadata
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Paystack initialization error:', error.response?.data || error.message);
      throw new Error('Failed to initialize payment');
    }
  }

  async verifyTransaction(reference) {
    try {
      const response = await axios.get(
        `${this.baseURL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Paystack verification error:', error.response?.data || error.message);
      throw new Error('Failed to verify payment');
    }
  }

  generateReference() {
    return `RES_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = new PaystackService();