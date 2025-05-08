// import twilio from 'twilio';
// import dotenv from 'dotenv';

// // Load environment variables
// dotenv.config({
//   path: './.env'
// });

// // Twilio credentials from environment variables
// // const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Twilio Account SID
// // const authToken = process.env.TWILIO_AUTH_TOKEN;   // Your Twilio Auth Token
// // const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Your Twilio WhatsApp number

// // // Ensure the environment variables are set
// // if (!accountSid || !authToken || !whatsappNumber) {
// //   console.error("Missing Twilio environment variables. Please check your .env file.");
// //   process.exit(1);  // Exit the application if credentials are missing
// // }

// // // Initialize Twilio client
// // const client = twilio(accountSid, authToken);

// // /**
// //  * Send OTP via WhatsApp using Twilio.
// //  * @param {string} phoneNumber - The user's phone number in E.164 format (e.g., +1234567890).
// //  * @param {string} otp - The OTP to send to the user.
// //  * @returns {Promise} - A promise that resolves if the message is sent successfully.
// //  */
// // const sendOtpToWhatsApp = async (phoneNumber, otp) => {
// //   try {
// //     const message = `Your OTP code is: ${otp}`;
// //     // Send the message to the provided phone number via WhatsApp
// //     const response = await client.messages.create({
// //       body: message,
// //       from: `whatsapp:${whatsappNumber}`, // The WhatsApp-enabled Twilio number
// //       to: `whatsapp:${phoneNumber}`,      // The user's phone number in WhatsApp format
// //     });

// //     console.log('OTP sent to WhatsApp:', response.sid);
// //     return response; // Return the response in case it's needed
// //   } catch (error) {
// //     console.error('Twilio Error:', error);
// //     return res.status(500).json(new Error(`Failed to send OTP via WhatsApp: ${error.message}`))
// //   }
// // };

// // /**
// //  * Send a custom message via WhatsApp using Twilio.
// //  * @param {string} phoneNumber - The recipient's phone number.
// //  * @param {string} message - The message content to send.
// //  * @returns {Promise} - A promise that resolves if the message is sent successfully.
// //  */
// // const sendCustomMessageToWhatsApp = async (phoneNumber, message) => {
// //   try {
// //     const response = await client.messages.create({
// //       body: message,
// //       from: `whatsapp:${whatsappNumber}`,
// //       to: `whatsapp:${phoneNumber}`,
// //     });

// //     console.log('Custom message sent to WhatsApp:', response.sid);
// //     return response;
// //   } catch (error) {
// //     console.error('Twilio Error:', error);
// //     throw new Error(`Failed to send custom message via WhatsApp: ${error.message}`);
// //   }
// // };

// // export { sendOtpToWhatsApp, sendCustomMessageToWhatsApp };

// // Twilio credentials from environment variables
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const smsNumber = process.env.TWILIO_SMS_NUMBER; // Your Twilio SMS-enabled number

// // Initialize Twilio client
// const client = twilio(accountSid, authToken);

// /**
//  * Send OTP via SMS using Twilio.
//  * @param {string} phoneNumber - The user's phone number in E.164 format (e.g., +1234567890).
//  * @param {string} otp - The OTP to send to the user.
//  * @returns {Promise} - A promise that resolves if the message is sent successfully.
//  */
// const sendOtpToSms = async (phoneNumber, otp) => {
//   try {
//     const message = `Your OTP code is: ${otp}`;

//     // Send the SMS to the provided phone number
//     const response = await client.messages.create({
//       body: message,
//       from: smsNumber,  // Ensure this is a valid Twilio SMS-enabled number
//       to: phoneNumber,  // The user's phone number in E.164 format
//     });

//     console.log('OTP sent via SMS:', response.sid);
//     return response; // Return the response in case it's needed
//   } catch (error) {
//     console.error('Twilio Error:', error);
//     throw new Error(`Failed to send OTP via SMS: ${error.message}`);
//   }
// };


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
