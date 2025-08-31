// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,  // Your Gmail address
//     pass: process.env.EMAIL_PASS,  // Gmail App Password
//   },
// });

// export async function sendOtpEmail(to, otp) {
//   const mailOptions = {
//     from: `"Hubbly" <${process.env.EMAIL_USER}>`,
//     to,
//     subject: "OTP Verification Code",
//     text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
//     html: `<p>Your OTP code is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`OTP email sent to ${to}`);
//   } catch (error) {
//     console.error("Error sending OTP email:", error);
//     throw new Error("Failed to send OTP email");
//   }
// }


import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: process.env.SMTP_PORT,
//   secure: false, // false for 587, true for 465
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOtpEmail = async (to, otp) => {
  try {
    const info = await transporter.sendMail({
      from: '"Hubbly" <noreply@gasibsons.app>', // Use your domain email
      to: to,
      subject: "OTP Verification Code",
      html: `
        <p>Your OTP code is: <b>${otp}</b></p>
        <p>This code is valid for 5 minutes.</p>
      `,
    });

    console.log("Email sent: %s", info.messageId);
    return true;
  } catch (error) {
    // console.error("Error sending email:", error);
    console.error("Error sending email:", error.message, error);
    throw new Error("Failed to send email");
    // throw error; // don’t replace it with custom message yet
  }
};
