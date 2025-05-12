
// export { sendOtpToSms };
import twilio from 'twilio';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({
  path: './.env'
});

// Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Twilio Account SID
const authToken = process.env.TWILIO_AUTH_TOKEN;   // Your Twilio Auth Token
const smsNumber = process.env.TWILIO_SMS_NUMBER;  // Your Twilio SMS-enabled number

// Initialize Twilio client
const client = twilio(accountSid, authToken);

/**
 * Send OTP via SMS using Twilio.
 * @param {string} phoneNumber - The user's phone number in E.164 format (e.g., +1234567890).
 * @param {string} otp - The OTP to send to the user.
 * @returns {Promise} - A promise that resolves if the message is sent successfully.
 */
const sendOtpToSms = async (phoneNumber, otp) => {
  try {
    const message = `Your OTP code is: ${otp}`;

    // Send the SMS to the provided phone number
    const response = await client.messages.create({
      body: message,
      from: smsNumber,  // Twilio SMS-enabled phone number (your Twilio number)
      to: phoneNumber,  // The user's phone number in E.164 format
    });

    console.log('OTP sent via SMS:', response.sid);
    return response; // Return the response in case it's needed
  } catch (error) {
    console.error('Twilio Error:', error);
    throw new Error(`Failed to send OTP via SMS: ${error.message}`);
  }
};

export { sendOtpToSms };
