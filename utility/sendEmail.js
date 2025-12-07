const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    return true;
  } catch (err) {
    console.error("Email sending failed:", err);
    return false;
  }
};

module.exports = sendEmail;
